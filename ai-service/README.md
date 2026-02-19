# MEDLedger AI Risk Service (Python)

This service runs a Logistic Regression model to predict basic health risk.

## Features used
- `age`
- `bmi`
- `systolic_bp`
- `glucose`
- `smoker` (0/1)
- `family_history` (0/1)

## Setup

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

## API

### `POST /predict-risk`

Example body:

```json
{
  "age": 52,
  "bmi": 31.2,
  "systolic_bp": 148,
  "glucose": 190,
  "smoker": 1,
  "family_history": 1
}
```

Example response:

```json
{
  "risk_probability": 0.8421,
  "risk_level": "High",
  "model": "LogisticRegression"
}
```
