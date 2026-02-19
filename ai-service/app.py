from typing import Literal

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


class PatientFeatures(BaseModel):
    age: float = Field(..., ge=0, le=120)
    bmi: float = Field(..., ge=10, le=80)
    systolic_bp: float = Field(..., ge=70, le=260)
    glucose: float = Field(..., ge=40, le=500)
    smoker: int = Field(..., ge=0, le=1)
    family_history: int = Field(..., ge=0, le=1)


class RiskPrediction(BaseModel):
    risk_probability: float
    risk_level: Literal["Low", "Moderate", "High"]
    model: str


app = FastAPI(title="MEDLedger AI Risk API", version="1.0.0")


def build_training_data(seed: int = 42):
    rng = np.random.default_rng(seed)
    n_samples = 1200

    age = rng.uniform(18, 90, n_samples)
    bmi = rng.uniform(16, 42, n_samples)
    systolic_bp = rng.uniform(90, 190, n_samples)
    glucose = rng.uniform(70, 280, n_samples)
    smoker = rng.integers(0, 2, n_samples)
    family_history = rng.integers(0, 2, n_samples)

    X = np.column_stack([age, bmi, systolic_bp, glucose, smoker, family_history])

    linear_score = (
        0.03 * (age - 40)
        + 0.07 * (bmi - 24)
        + 0.04 * (systolic_bp - 120)
        + 0.03 * (glucose - 110)
        + 0.9 * smoker
        + 0.7 * family_history
        - 2.8
    )

    probability = 1.0 / (1.0 + np.exp(-linear_score))
    y = (probability > 0.5).astype(int)
    return X, y


X_train, y_train = build_training_data()
model = Pipeline(
    steps=[
        ("scaler", StandardScaler()),
        ("logreg", LogisticRegression(max_iter=1000, random_state=42)),
    ]
)
model.fit(X_train, y_train)


@app.get("/health")
def health():
    return {"ok": True, "service": "medledger-ai-risk"}


@app.post("/predict-risk", response_model=RiskPrediction)
def predict_risk(payload: PatientFeatures):
    features = np.array(
        [[payload.age, payload.bmi, payload.systolic_bp, payload.glucose, payload.smoker, payload.family_history]],
        dtype=float,
    )
    risk_probability = float(model.predict_proba(features)[0][1])

    if risk_probability < 0.33:
        risk_level = "Low"
    elif risk_probability < 0.66:
        risk_level = "Moderate"
    else:
        risk_level = "High"

    return RiskPrediction(
        risk_probability=round(risk_probability, 4),
        risk_level=risk_level,
        model="LogisticRegression"
    )
