# SnapPrice

AI-powered automated valuation model that tells sellers what their home is worth — and exactly why.

Built for Snaphomz Hackathon 2.0.

---

## The Problem

Sellers distrust Zillow's Zestimate because it gives a number with no explanation. They overprice, sit on market for 90 days, then panic-cut. SnapPrice fixes this by showing not just the valuation, but the dollar-attributed reason behind every factor.

---

## What It Does

- Takes a property address as input
- Pulls live property data and neighbourhood demographics via RealEstateAPI
- Runs an XGBoost regression model to produce a price estimate + confidence range
- Uses SHAP to decompose the prediction into plain-English dollar contributions per feature
- Shows a what-if simulator (model sensitivity to bedrooms, bathrooms, sqft)
- Captures seller leads via a `/list-with-us` endpoint — the revenue connection

---

## Architecture

```
Address Input
     ↓
RealEstateAPI (PropertyDetail + PropertyComps + AVM)
     ↓
Feature Extraction → XGBoost Model → SHAP TreeExplainer
     ↓
FastAPI /predict → React Price Card UI
```

**Stack:**
- Backend: Python, FastAPI, XGBoost, SHAP, scikit-learn, Pydantic
- Frontend: React (Vite), vanilla CSS-in-JS
- Data: RealEstateAPI.com (live) with California Housing dataset as fallback
- Deployment: Railway (backend) + Vercel (frontend)

---

## Key Design Decisions

**Why XGBoost?**
Tree ensembles consistently outperform neural networks on tabular property data with mixed feature types. XGBoost also handles missing values natively — critical for real MLS data — and SHAP's TreeExplainer produces exact (not approximate) Shapley values for tree models.

**Why SHAP?**
Global feature importances tell you what matters on average. SHAP tells you why *this specific home* is valued the way it is, denominated in dollars. That is the difference between a data science report and a product a seller can act on.

**Why a fallback architecture?**
If RealEstateAPI is unavailable, the system falls back to California Housing medians and labels the result clearly. A broken demo is not a demo.

**What I left out and why:**
- Photo-based condition scoring — requires a separate CV model (CLIP/ResNet); 2-week task not 1-hour task
- Statistically valid confidence intervals — quantile regression is 3 extra lines; heuristic ±5% is honest and clearly labelled
- Comp-level CMA display — architecturally trivial, time-constrained; next step would be a `/comps` endpoint using nearest-neighbour search on feature vectors

---

## Revenue Connection

- Sellers get an explained valuation → they trust it → they list on Snaphomz instead of Zillow
- Replaces 4-hour manual agent CMA reports
- Every Snaphomz transaction improves the model — compounding data moat
- "What's my home worth?" is the highest-intent real estate query

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```
REAPI_KEY=your_realestateapi_backend_key
```

```bash
uvicorn main:app --reload
```

API docs available at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

UI available at `http://localhost:5173`

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/predict` | POST | Address → price estimate + SHAP explanation |
| `/sensitivity` | POST | Address → what-if impact per bedroom/bathroom/sqft |
| `/list-with-us` | POST | Capture seller lead with agent match |
| `/health` | GET | Model + API key status |
| `/docs` | GET | Interactive Swagger UI |

---

## Deployment

Backend on Railway, frontend on Vercel. See deployment notes in `/docs`.
