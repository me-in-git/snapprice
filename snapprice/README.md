# SnapPrice — Automated Valuation Model (AVM)

> Real-time AI property valuation with SHAP explanations

## What it does
- Takes property features as input
- Returns estimated price + confidence range
- Explains every valuation factor in plain English
- Powered by XGBoost + SHAP explainability

## Quick Start (Windows)

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Visit: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit: http://localhost:5173

### Docker (optional)
```bash
cd backend
docker build -t snapprice .
docker run -p 8000:8000 snapprice
```

## Architecture

```
User Input → FastAPI /predict → XGBoost AVM → SHAP Explainer → Price Card UI
```

- **Model**: XGBoost regressor trained on California Housing (public MLS proxy)
- **Explainability**: SHAP TreeExplainer — every factor has a dollar-value impact
- **API**: FastAPI with Pydantic validation
- **Frontend**: React price card with factor breakdown
- **Fallback**: California Housing dataset if live API unavailable

## Pitch Notes

**Why XGBoost over neural net?**
Tabular data with mixed feature types — tree ensembles outperform NNs here consistently.
Also: SHAP works natively with tree models, making explainability trivial.

**Why SHAP?**
Sellers distrust black-box numbers. SHAP gives every prediction a dollar-attributed reason.
"Your neighborhood income adds $24,000 to the valuation" is actionable. A Zestimate isn't.

**What I left out and why:**
- Live MLS API calls (RealEstateAPI.com) — California Housing is a valid public comp proxy. Production would swap the data layer, not the model.
- Photo-based condition signals — would need a CV model; out of scope for 1hr
- Comp-level CMA report — doable with the same stack, just more data wrangling

**Revenue connection:**
Sellers with a trusted, explainable valuation have a concrete reason to list on Snaphomz.
Replaces 4hr agent CMA. As Snaphomz transaction data grows, model improves — data moat.
