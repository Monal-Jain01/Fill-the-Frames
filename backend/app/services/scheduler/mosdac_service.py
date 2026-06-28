"""
MOSDAC Service — Async-compatible client for MOSDAC satellite data API.

Ported from the reference script at:
  /home/sid/Projects/ISRO_HACKATHON/INSAT_SAT_DATA/mdapi.py

Auth flow: login -> search -> download (streamed) -> refresh token if 401 -> logout
Target: INSAT-3D/3S TIR1 channel data (.h5 files)
"""

import asyncio
import os
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import httpx
from huggingface_hub import HfFileSystem
from loguru import logger

from app.core.config import (
    HF_BUCKET_ID,
    HF_TOKEN,
    MOSDAC_DATASET_ID,
    MOSDAC_PASSWORD,
    MOSDAC_USERNAME,
    TEMP_STORAGE_DIR,
)

# MOSDAC API endpoints
TOKEN_URL = "https://mosdac.gov.in/download_api/gettoken"
SEARCH_URL = "https://mosdac.gov.in/apios/datasets.json"
DOWNLOAD_URL = "https://mosdac.gov.in/download_api/download"
REFRESH_URL = "https://mosdac.gov.in/download_api/refresh-token"
LOGOUT_URL = "https://mosdac.gov.in/download_api/logout"


class MosdacService:
    def __init__(self):
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.fs = HfFileSystem(token=HF_TOKEN)
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=30.0)
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    # ─── Auth ───────────────────────────────────────────────────

    async def login(self) -> bool:
        """Authenticate with MOSDAC and obtain access + refresh tokens."""
        if not MOSDAC_USERNAME or not MOSDAC_PASSWORD:
            logger.error(
                "MOSDAC credentials not configured. Set MOSDAC_USERNAME and MOSDAC_PASSWORD env vars."
            )
            return False

        client = await self._get_client()
        try:
            resp = await client.post(
                TOKEN_URL,
                json={"username": MOSDAC_USERNAME, "password": MOSDAC_PASSWORD},
            )

            if resp.status_code == 401:
                error_data = resp.json()
                logger.error(
                    f"MOSDAC login failed (401): {error_data.get('error', 'Invalid credentials')}"
                )
                return False

            if resp.status_code == 400:
                error_data = resp.json()
                logger.error(
                    f"MOSDAC login validation error: {error_data.get('error', 'Unknown')}"
                )
                return False

            if resp.status_code == 503:
                logger.error("MOSDAC server unavailable (503). Will retry next cycle.")
                return False

            resp.raise_for_status()
            data = resp.json()
            self.access_token = data.get("access_token")
            self.refresh_token = data.get("refresh_token")
            logger.success(f"MOSDAC login successful for {MOSDAC_USERNAME}")
            return True

        except httpx.HTTPError as e:
            logger.error(f"MOSDAC login failed: {e}")
            return False

    async def _refresh_access_token(self) -> bool:
        """Refresh the access token using the refresh token."""
        if not self.refresh_token:
            return False

        client = await self._get_client()
        try:
            resp = await client.post(
                REFRESH_URL,
                json={"refresh_token": self.refresh_token},
            )
            if resp.status_code == 400:
                logger.error("MOSDAC token refresh failed: invalid refresh token.")
                return False
            resp.raise_for_status()
            data = resp.json()
            self.access_token = data.get("access_token")
            self.refresh_token = data.get("refresh_token")
            logger.info("MOSDAC token refreshed successfully.")
            return True
        except httpx.HTTPError as e:
            logger.error(f"MOSDAC token refresh failed: {e}")
            return False

    async def logout(self) -> None:
        """Logout from MOSDAC to clean up server-side session."""
        if not MOSDAC_USERNAME:
            return
        client = await self._get_client()
        try:
            await client.post(
                LOGOUT_URL,
                json={"username": MOSDAC_USERNAME},
                timeout=10.0,
            )
            logger.info("MOSDAC logout successful.")
        except Exception as e:
            logger.warning(f"MOSDAC logout failed (non-critical): {e}")

    # ─── Search ─────────────────────────────────────────────────

    async def search_recent(
        self, hours_back: int = 24, count: int = 48
    ) -> List[Dict[str, Any]]:
        """Search MOSDAC for recent satellite files.

        Args:
            hours_back: How many hours back to search from now.
            count: Max number of results to fetch.

        Returns:
            List of entry dicts with 'identifier', 'id', 'updated' keys.
        """
        client = await self._get_client()
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours_back)

        params = {
            "datasetId": MOSDAC_DATASET_ID,
            "startTime": start_time.strftime("%Y-%m-%d"),
            "endTime": end_time.strftime("%Y-%m-%d"),
            "count": str(count),
        }

        try:
            resp = await client.get(SEARCH_URL, params=params)
            if resp.status_code != 200:
                logger.error(
                    f"MOSDAC search failed with status {resp.status_code}: {resp.text[:200]}"
                )
                return []

            data = resp.json()
            entries = data.get("entries", [])
            total = data.get("totalResults", 0)
            logger.info(
                f"MOSDAC search returned {len(entries)} entries (total available: {total})"
            )
            return entries

        except httpx.HTTPError as e:
            logger.error(f"MOSDAC search failed: {e}")
            return []

    # ─── Download ───────────────────────────────────────────────

    async def download_file(self, record_id: str, filename: str) -> Optional[str]:
        """Download a single file from MOSDAC and upload to HF bucket.

        Returns:
            The bucket path (e.g. 'mosdac/filename.h5') on success, None on failure.
        """
        if not self.access_token:
            logger.error("No access token. Call login() first.")
            return None

        client = await self._get_client()
        headers = {"Authorization": f"Bearer {self.access_token}"}
        params = {"id": record_id}

        # Retry logic with exponential backoff
        retry_delays = [5, 10, 20, 30, 60]

        for attempt, delay in enumerate(retry_delays + [None]):
            try:
                # Stream download to temp file
                local_dir = Path(TEMP_STORAGE_DIR) / "mosdac_downloads"
                local_dir.mkdir(parents=True, exist_ok=True)
                tmp_path = local_dir / f"{filename}.part"
                final_path = local_dir / filename

                # Skip if already in bucket
                bucket_path = f"mosdac/{filename}"
                remote_path = f"hf://buckets/{HF_BUCKET_ID}/{bucket_path}"
                if self.fs.exists(remote_path):
                    logger.debug(
                        f"{filename} already exists in bucket. Skipping download."
                    )
                    return bucket_path

                async with client.stream(
                    "GET", DOWNLOAD_URL, headers=headers, params=params, timeout=120.0
                ) as resp:
                    # Handle auth errors
                    if resp.status_code == 401:
                        error_data_bytes = b""
                        async for chunk in resp.aiter_bytes():
                            error_data_bytes += chunk
                        try:
                            error_data = __import__("json").loads(error_data_bytes)
                        except Exception:
                            error_data = {}
                        if error_data.get("code") == "INVALID_TOKEN":
                            logger.warning("MOSDAC token expired. Refreshing...")
                            if await self._refresh_access_token():
                                headers = {
                                    "Authorization": f"Bearer {self.access_token}"
                                }
                                continue  # Retry with new token
                            else:
                                return None
                        return None

                    if resp.status_code == 404:
                        logger.warning(f"{filename}: Not available on MOSDAC server.")
                        return None

                    if resp.status_code == 429:
                        rate_data_bytes = b""
                        async for chunk in resp.aiter_bytes():
                            rate_data_bytes += chunk
                        try:
                            rate_data = __import__("json").loads(rate_data_bytes)
                        except Exception:
                            rate_data = {}
                        err_type = rate_data.get("type", "unknown")
                        err_msg = rate_data.get("message", "Rate limited")
                        if err_type == "daily_limit":
                            logger.error(f"MOSDAC daily limit reached: {err_msg}")
                            return None
                        else:
                            logger.warning(
                                f"MOSDAC rate limit ({err_type}): {err_msg}. Waiting 20s..."
                            )
                            await asyncio.sleep(20)
                            continue

                    resp.raise_for_status()

                    # Check Content-Disposition to verify file availability
                    content_disp = resp.headers.get("content-disposition", "")
                    if not content_disp or "filename=" not in content_disp:
                        logger.warning(
                            f"{filename}: No content-disposition header. File may not be available."
                        )
                        # Drain stream before returning
                        async for _ in resp.aiter_bytes():
                            pass
                        return None

                    # Stream to disk
                    total_size = int(resp.headers.get("content-length", 0))
                    downloaded = 0
                    with open(tmp_path, "wb") as f:
                        async for chunk in resp.aiter_bytes(chunk_size=1048576):
                            f.write(chunk)
                            downloaded += len(chunk)

                    # Rename .part to final
                    if tmp_path.exists():
                        tmp_path.rename(final_path)

                    size_mb = downloaded / (1024 * 1024)
                    logger.info(f"Downloaded {filename} ({size_mb:.1f} MB)")

                # Upload to HF bucket
                self.fs.put(str(final_path), remote_path)
                logger.info(f"Uploaded {filename} to bucket at {bucket_path}")

                # Clean up local file to save disk
                if final_path.exists():
                    final_path.unlink()

                return bucket_path

            except (httpx.ConnectError, httpx.TimeoutException) as e:
                if delay is None:
                    logger.error(
                        f"Download of {filename} failed after all retries: {e}"
                    )
                    return None
                logger.warning(
                    f"Network error downloading {filename}: {e}. Retrying in {delay}s..."
                )
                # Clean up partial file
                if tmp_path.exists():
                    tmp_path.unlink()
                await asyncio.sleep(delay)

            except httpx.HTTPError as e:
                logger.error(f"HTTP error downloading {filename}: {e}")
                if tmp_path.exists():
                    tmp_path.unlink()
                return None

            except Exception as e:
                logger.error(f"Unexpected error downloading {filename}: {e}")
                if tmp_path.exists():
                    tmp_path.unlink()
                return None

        return None

    # ─── Helpers ────────────────────────────────────────────────

    @staticmethod
    def extract_timestamp_from_filename(filename: str) -> Optional[str]:
        """Extract ISO timestamp from INSAT-3D/3S filename.

        Example filenames:
          3DIMG_01JUN2026_0600_L1B_STD.h5 -> 2026-06-01T06:00:00Z
          3SIMG_28JUN2026_1200_L1B_STD.h5 -> 2026-06-28T12:00:00Z
        """
        # Pattern: 3DIMG_DDMONYYYY_HHMM_...
        match = re.match(r"3[DS]IMG_(\d{2})([A-Z]{3})(\d{4})_(\d{4})_", filename)
        if not match:
            return None

        day, mon_str, year, hhmm = match.groups()
        month_map = {
            "JAN": 1,
            "FEB": 2,
            "MAR": 3,
            "APR": 4,
            "MAY": 5,
            "JUN": 6,
            "JUL": 7,
            "AUG": 8,
            "SEP": 9,
            "OCT": 10,
            "NOV": 11,
            "DEC": 12,
        }
        month = month_map.get(mon_str)
        if month is None:
            return None

        try:
            dt = datetime(
                year=int(year),
                month=month,
                day=int(day),
                hour=int(hhmm[:2]),
                minute=int(hhmm[2:]),
            )
            return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        except ValueError:
            return None

    @staticmethod
    def is_tir1_file(filename: str) -> bool:
        """Check if filename is a TIR1 channel file (or full-disk L1B that contains TIR1)."""
        # Full-disk L1B STD files contain all channels including TIR1
        # Channel-specific files have the channel name in the filename
        fn_upper = filename.upper()
        if "TIR1" in fn_upper:
            return True
        # Full-disk standard products contain TIR1
        if "L1B_STD" in fn_upper:
            return True
        return False
