# schemas/metrics.py
# NOTE: MetricsRequest and MetricsResponse Pydantic models were removed as dead code.
# The /api/v1/metrics/compare endpoint uses `response_model=ApiResponse[dict]` and
# accepts query params directly — not these request/response bodies.
# If a typed Pydantic contract is needed in future, re-add here and update api/metrics.py.
