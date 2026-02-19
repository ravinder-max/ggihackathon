# MEDLedger Upload API (Node.js)

Backend endpoint to:
1. Upload medical files to IPFS via Pinata
2. Store metadata in MongoDB
3. Anchor record hash on blockchain

## Setup

```bash
cd server
npm install
cp .env.example .env
```

Fill `.env` values for MongoDB, Pinata, RPC, wallet key, and contract address.
Also set `AI_SERVICE_URL` to your Python AI service URL (default `http://127.0.0.1:8000`).

## Run

```bash
npm run dev
```

## API

### `POST /api/records/upload`

Form-data fields:
- `patientAddress` (required, Ethereum address)
- `doctorAddress` (optional)
- `file` (required)

Response includes:
- `ipfsHash`
- `ipfsUrl`
- `chainHash`
- `txHash`
- `recordId`

### `GET /api/records/patient/:patientAddress`
Returns saved records from MongoDB for a patient.

### `POST /api/ai/predict-risk`
Proxy endpoint to the Python logistic regression service.

JSON body:
- `age`
- `bmi`
- `systolic_bp`
- `glucose`
- `smoker` (0/1)
- `family_history` (0/1)

Returns:
- `risk_probability`
- `risk_level`
- `model`

If `risk_level` is `High`, a risk alert is stored in MongoDB.

### `GET /api/ai/alerts`
Query params (optional):
- `patientAddress`
- `doctorAddress`

Returns recent AI-generated risk alerts.

### `POST /api/emergency/request-access`
Temporary break-glass access for emergencies.

JSON body:
- `patientAddress` (Ethereum address)
- `doctorAddress` (Ethereum address)
- `reason` (string)
- `durationMinutes` (number, default 30)

### `GET /api/emergency/active/:patientAddress`
Optional query:
- `doctorAddress`

Returns active non-expired emergency tickets.

### `POST /api/emergency/close/:id`
Closes an emergency ticket.

## Contract Notes

The blockchain service tries:
- `storeRecordHash(address patient, bytes32 recordHash)` if available
- otherwise falls back to `addRecordHash(bytes32)`

For strict per-patient on-chain ownership, prefer implementing `storeRecordHash` in your contract.
