import warnings
warnings.filterwarnings('ignore')
import os
os.environ['PYTHONWARNINGS'] = 'ignore'
import joblib
import pandas as pd
import sys
import numpy as np

# =========================================================
# PATH SETUP (ROBUST)
# =========================================================

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))

MODEL_DIR = os.path.join(
    BACKEND_ROOT,
    "src",
    "main",
    "java",
    "com",
    "agro",
    "decisionlab",
    "cropplanner",
    "model"
)

DATASET_PATH = os.path.join(
    BACKEND_ROOT,
    "data",
    "crop_recommendation_master_dataset.csv"
)

# =========================================================
# LOAD TRAINED COMPONENTS
# =========================================================

model = joblib.load(os.path.join(MODEL_DIR, "crop_model.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))

le_soil = joblib.load(os.path.join(MODEL_DIR, "le_soil.pkl"))
le_season = joblib.load(os.path.join(MODEL_DIR, "le_season.pkl"))
le_irrigation = joblib.load(os.path.join(MODEL_DIR, "le_irrigation.pkl"))
le_crop = joblib.load(os.path.join(MODEL_DIR, "le_crop.pkl"))

# =========================================================
# LOAD DATASET
# =========================================================

df = pd.read_csv(DATASET_PATH)

# =========================================================
# GET INPUT ARGUMENTS FROM SPRING BOOT
# =========================================================

soil = sys.argv[1].strip()
season = sys.argv[2].strip()
irrigation = sys.argv[3].strip()

# =========================================================
# SAFE ENCODING FUNCTION
# =========================================================

def safe_transform(encoder, value):

    try:
        return encoder.transform([value])[0]
    except:
        return encoder.transform([encoder.classes_[0]])[0]


# =========================================================
# FILTER DATASET BASED ON INPUT
# =========================================================

filtered = df[
    (df["soil_type"] == soil) &
    (df["season"] == season) &
    (df["irrigation_type"] == irrigation)
]

# fallback if empty
if filtered.empty:
    filtered = df.copy()

# =========================================================
# ENCODE CATEGORICAL FEATURES
# =========================================================

filtered = filtered.copy()

filtered["soil_type"] = filtered["soil_type"].apply(
    lambda x: safe_transform(le_soil, x)
)

filtered["season"] = filtered["season"].apply(
    lambda x: safe_transform(le_season, x)
)

filtered["irrigation_type"] = filtered["irrigation_type"].apply(
    lambda x: safe_transform(le_irrigation, x)
)

# =========================================================
# EXACT FEATURES USED IN TRAINING
# =========================================================

FEATURES = [
    "soil_type",
    "season",
    "ph_min",
    "ph_max",
    "nitrogen_req",
    "phosphorus_req",
    "potassium_req",
    "rainfall_min_mm",
    "rainfall_max_mm",
    "temp_min_c",
    "temp_max_c",
    "irrigation_type",
    "yield_ton_per_acre",
    "cost_rs_per_acre",
    "price_rs_per_ton",
    "profit_rs_per_acre",
    "risk_score",
    "climate_score"
]

X = filtered[FEATURES]

# =========================================================
# SCALE FEATURES
# =========================================================

X_scaled = scaler.transform(X)

# =========================================================
# PREDICT PROBABILITIES USING STACKING MODEL
# =========================================================

probs = model.predict_proba(X_scaled)

confidence_scores = np.max(probs, axis=1)

filtered["confidence"] = confidence_scores

# =========================================================
# SORT AND SELECT TOP CROPS
# =========================================================

filtered_sorted = filtered.sort_values(
    by="confidence",
    ascending=False
)

# REMOVE DUPLICATES
unique_crops = []

for _, row in filtered_sorted.iterrows():

    crop = str(row["crop"]).strip()

    if crop not in unique_crops:
        unique_crops.append(crop)

    if len(unique_crops) == 5:
        break


# =========================================================
# PRINT OUTPUT FOR SPRING BOOT
# =========================================================

for crop in unique_crops:
    print(crop)