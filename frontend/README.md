# Fill the Frames

AI-powered temporal interpolation platform for geostationary satellite imagery.

Fill the Frames generates intermediate satellite observations between existing frames, enabling enhanced temporal resolution for weather monitoring and Earth observation workflows.

---

## Features

* Upload NetCDF and HDF5 satellite products
* Metadata inspection dashboard
* Scientific visualization interface
* AI-powered frame interpolation
* Frame comparison tools
* Quality metrics dashboard
* Animation generation
* Export generated outputs

---

## Tech Stack

### Frontend

* Next.js 15
* TypeScript
* Tailwind CSS v4
* shadcn/ui
* Framer Motion
* Zustand
* TanStack Query
* Recharts
* Plotly

### Backend

* FastAPI
* Python 3.11+
* Pydantic
* Uvicorn

### AI & Scientific Computing

* PyTorch
* Xarray
* NetCDF4
* NumPy
* Rioxarray
* SatPy

### Evaluation

* scikit-image
* image-similarity-measures

---

## Project Structure

```text
src/
│
├── app/
│
├── components/
│   ├── ui/
│   ├── common/
│   └── layout/
│
├── features/
│   ├── upload/
│   ├── metadata/
│   ├── visualization/
│   ├── interpolation/
│   ├── comparison/
│   ├── metrics/
│   ├── animation/
│   └── export/
│
├── hooks/
├── providers/
├── services/
├── store/
├── types/
└── lib/

backend/
│
├── api/
├── preprocessing/
├── inference/
├── visualization/
├── metrics/
├── exports/
├── models/
└── utils/
```

---

## Application Workflow

```text
Upload
   ↓
Metadata Inspection
   ↓
Visualization
   ↓
Interpolation
   ↓
Comparison
   ↓
Metrics
   ↓
Animation
   ↓
Export
```

---

## Prerequisites

### Frontend

* Node.js 20+
* pnpm

### Backend

* Python 3.11+
* CUDA-compatible GPU (recommended)

---

## Frontend Setup

Clone the repository:

```bash
git clone <repository-url>
cd satellite-interpolation-app
```

Install dependencies:

```bash
pnpm install
```

Start development server:

```bash
pnpm dev
```

Application:

```text
http://localhost:3000
```

---

## Backend Setup

Create virtual environment:

```bash
python -m venv venv
```

Activate environment:

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend:

```bash
uvicorn app.main:app --reload
```

API:

```text
http://localhost:8000
```

---

## Development Guidelines

### Frontend

* Use TypeScript only
* Use App Router
* Use shadcn/ui components
* Prefer Server Components
* Keep UI components reusable
* Follow feature-based architecture

### Backend

* Use FastAPI routers
* Use Pydantic schemas
* Keep inference isolated from API routes
* Preserve scientific metadata

---

## Environment Variables

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend:

```env
MODEL_PATH=models/rife.pth
CUDA_DEVICE=0
```

---

## Future Roadmap

* Real NetCDF ingestion
* FastAPI integration
* Modified RIFE inference
* Scientific metrics engine
* Multi-satellite support
* Cloud deployment
* Multi-GPU inference

---

## License

Specify your project license here.

---

