import warnings
warnings.filterwarnings('ignore')
import os
os.environ['PYTHONWARNINGS'] = 'ignore'
import sys
import json
import joblib
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# LOAD FILES
model = joblib.load(os.path.join(BASE_DIR,"fertilizer_model.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR,"fertilizer_scaler.pkl"))
encoders = joblib.load(os.path.join(BASE_DIR,"fertilizer_encoders.pkl"))
target_encoder = joblib.load(os.path.join(BASE_DIR,"fertilizer_target_encoder.pkl"))

# READ INPUT
if os.path.exists(os.path.join(BASE_DIR,"input.json")):
    with open(os.path.join(BASE_DIR,"input.json")) as f:
        data = json.load(f)
else:
    data = json.loads(sys.argv[1])

# ============================================
# RULE ENGINE (PRIMARY DECISION)
# ============================================

n = float(data["nitrogen"])
p = float(data["phosphorus"])
k = float(data["potassium"])

total = n + p + k

n_ratio = n / total
p_ratio = p / total
k_ratio = k / total

if n_ratio > 0.5:
    rule_fertilizer = "Urea"

elif p_ratio > 0.4:
    rule_fertilizer = "DAP"

elif k_ratio > 0.4:
    rule_fertilizer = "MOP"

elif total > 250:
    rule_fertilizer = "NPK_20_20_20"

elif total > 180:
    rule_fertilizer = "NPK_19_19_19"

elif total > 120:
    rule_fertilizer = "NPK_12_32_16"

else:
    rule_fertilizer = "Organic"


# ============================================
# ML CONFIDENCE ENGINE
# ============================================

df = pd.DataFrame([{

    "crop": data["crop"],
    "soil_type": data["soil_type"],
    "season": data["season"],
    "irrigation_type": data["irrigation"],

    "ph_min": data["ph"],
    "ph_max": data["ph"],

    "n_required": n,
    "p_required": p,
    "k_required": k,

    "yield_ton_per_acre": data["expected_yield"],
    "cost_rs_per_acre": data["budget"],
    "price_rs_per_ton": data["market_price"],

    "climate_score": data["climate_score"],
    "risk_score": data["risk_score"]
}])


for col in ["crop","soil_type","season","irrigation_type"]:
    df[col] = encoders[col].transform(df[col])

X_scaled = scaler.transform(df)

probs = model.predict_proba(X_scaled)[0]

confidence = round(float(np.max(probs)) * 100,2)

# ============================================
# OUTPUT FINAL RESULT
# ============================================

result = {

    "recommended_fertilizer": rule_fertilizer,
    "confidence": confidence,

    "npk_ratio": {
        "N": n,
        "P": p,
        "K": k
    },

    "dominant": max(
        {"N":n_ratio,"P":p_ratio,"K":k_ratio},
        key={"N":n_ratio,"P":p_ratio,"K":k_ratio}.get
    )
}

print(json.dumps(result))