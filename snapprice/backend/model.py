import pandas as pd
import xgboost as xgb
import joblib
import numpy as np

#synth training data
np.random.seed(42)
n_samples = 10000

data = {
    'beds': np.random.randint(1, 6, n_samples),
    'baths': np.random.uniform(1, 4.5, n_samples).round(1),
    'sqft': np.random.randint(800, 4000, n_samples),
    'median_comp_price': np.random.randint(300000, 1200000, n_samples),
    'median_comp_sqft': np.random.randint(800, 3500, n_samples),
}

df = pd.DataFrame(data)
df['price_per_sqft_comp'] = df['median_comp_price'] / df['median_comp_sqft']

# Generate target price (with realistic non-linear relationships)
df['price'] = (
    df['sqft'] * 450 +  # Base $450/sqft
    df['beds'] * 25000 +  # $25k per bedroom
    df['baths'] * 15000 +  # $15k per bathroom
    df['median_comp_price'] * 0.7 +  # 70% weight to comps
    np.random.normal(0, 30000, n_samples)  # Noise
)

# Train model
X = df[['beds', 'baths', 'sqft', 'median_comp_price', 'median_comp_sqft', 'price_per_sqft_comp']]
y = df['price']

model = xgb.XGBRegressor(n_estimators=100, max_depth=6)
model.fit(X, y)

# Save
joblib.dump(model, 'model.pkl')
print("Model saved! ✅")