import pandas as pd
import numpy as np
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.utils.class_weight import compute_class_weight


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

print("Loading dataset...")

df = pd.read_csv(os.path.join(BASE_DIR, "fertilizer_master_dataset.csv"))


# ============================================
# ADVANCED FERTILIZER ENGINE
# ============================================

def recommend_fertilizer(row):

    n = row["n_required"]
    p = row["p_required"]
    k = row["k_required"]

    total = n + p + k

    n_ratio = n / total
    p_ratio = p / total
    k_ratio = k / total

    # Nitrogen dominant
    if n_ratio > 0.50:
        return "Urea"

    # Phosphorus dominant
    elif p_ratio > 0.40:
        return "DAP"

    # Potassium dominant
    elif k_ratio > 0.40:
        return "MOP"

    # Balanced high nutrient demand
    elif total > 250:
        return "NPK_20_20_20"

    elif total > 180:
        return "NPK_19_19_19"

    elif total > 120:
        return "NPK_12_32_16"

    else:
        return "Organic"


df["recommended_fertilizer"] = df.apply(recommend_fertilizer, axis=1)


print(df["recommended_fertilizer"].value_counts())


# ============================================
# FEATURES
# ============================================

FEATURES = [

    "crop",
    "soil_type",
    "season",
    "irrigation_type",

    "ph_min",
    "ph_max",

    "n_required",
    "p_required",
    "k_required",

    "yield_ton_per_acre",
    "cost_rs_per_acre",
    "price_rs_per_ton",

    "climate_score",
    "risk_score"
]

TARGET = "recommended_fertilizer"


X = df[FEATURES].copy()
y = df[TARGET].copy()


# ============================================
# ENCODING
# ============================================

encoders = {}

for col in ["crop","soil_type","season","irrigation_type"]:

    le = LabelEncoder()

    X[col] = le.fit_transform(X[col])

    encoders[col] = le


target_encoder = LabelEncoder()

y = target_encoder.fit_transform(y)


# ============================================
# SCALE
# ============================================

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)


# ============================================
# CLASS BALANCING
# ============================================

weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(y),
    y=y
)

class_weights = dict(enumerate(weights))


# ============================================
# SPLIT
# ============================================

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled,
    y,
    test_size=0.2,
    random_state=42
)


# ============================================
# TRAIN ADVANCED MODEL
# ============================================

print("Training advanced fertilizer AI...")

model = RandomForestClassifier(

    n_estimators=800,
    max_depth=35,
    min_samples_split=3,
    min_samples_leaf=1,
    class_weight=class_weights,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)


# ============================================
# ACCURACY
# ============================================

pred = model.predict(X_test)

accuracy = accuracy_score(y_test, pred)

print("Accuracy:", accuracy*100, "%")


# ============================================
# SAVE
# ============================================

joblib.dump(model, os.path.join(BASE_DIR,"fertilizer_model.pkl"))
joblib.dump(scaler, os.path.join(BASE_DIR,"fertilizer_scaler.pkl"))
joblib.dump(encoders, os.path.join(BASE_DIR,"fertilizer_encoders.pkl"))
joblib.dump(target_encoder, os.path.join(BASE_DIR,"fertilizer_target_encoder.pkl"))

print("ADVANCED MODEL TRAINED SUCCESSFULLY")