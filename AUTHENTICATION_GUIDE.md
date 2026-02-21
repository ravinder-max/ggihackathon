# MEDLedger - User Authentication & Credentials Guide

## Overview
MEDLedger now includes JWT-based authentication and authorization with test users already seeded in the database. Each user has a unique MetaMask wallet address for blockchain operations.

---

## 🔐 Authentication System

### Technology Stack
- **JWT Tokens**: 7-day expiry, stored in localStorage
- **Password Hashing**: SHA-256 (in production, use bcrypt)
- **Protected Routes**: All API endpoints (except `/auth/*`) require valid JWT token
- **Role-Based Access**: Patient and Doctor roles with different permissions
- **Middleware**: `authMiddleware` validates token on every protected request

### JWT Token Structure
```json
{
  "userId": "mongodb_user_id",
  "email": "user@example.com",
  "role": "patient|doctor",
  "walletAddress": "0x...",
  "iat": 1708267800,
  "exp": 1708872600
}
```

---

## 👥 Test Users & Login Credentials

### PATIENTS (4 Users)

| Name | Email | Password | MetaMask Wallet | Age |
|------|-------|----------|-----------------|-----|
| Rajesh Kumar | patient1@medledger.com | Patient@123 | 0x1234567890123456789012345678901234567890 | 45 |
| Priya Singh | patient2@medledger.com | Patient@123 | 0x2345678901234567890123456789012345678901 | 52 |
| Amit Patel | patient3@medledger.com | Patient@123 | 0x3456789012345678901234567890123456789012 | 38 |
| Deepa Sharma | patient4@medledger.com | Patient@123 | 0x4567890123456789012345678901234567890123 | 48 |

### DOCTORS (2 Users)

| Name | Email | Password | MetaMask Wallet | Specialization | Hospital |
|------|-------|----------|-----------------|-----------------|----------|
| Dr. Mohit Verma | doctor1@medledger.com | Doctor@123 | 0x5678901234567890123456789012345678901234 | Cardiology | Max Healthcare Delhi |
| Dr. Sneha Gupta | doctor2@medledger.com | Doctor@123 | 0x6789012345678901234567890123456789012345 | Endocrinology | Apollo Hospitals Mumbai |

---

## 🚀 How to Use

### 1. Start Backend Server
```bash
cd server
npm run dev
```
Server runs on: `http://localhost:5000`

### 2. Login via UI
1. Open frontend at `http://localhost:8084`
2. You'll see the login page with demo credentials
3. Click "Patient Demo" or "Doctor Demo" to autofill credentials
4. Click "Sign In"

**JWT Token Flow:**
```
User enters credentials → POST /api/auth/login → Server validates → Returns JWT token
→ Token stored in localStorage → Token sent in Authorization header for all requests
```

### 3. Make API Requests with Token

**Login Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient1@medledger.com",
    "password": "Patient@123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "patient1@medledger.com",
    "fullName": "Rajesh Kumar",
    "role": "patient",
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "age": 45
  }
}
```

**Protected Request (with token):**
```bash
curl -X GET http://localhost:5000/api/records/patient \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔑 API Authentication Endpoints

### POST `/api/auth/register`
Create new user account.

**Request:**
```json
{
  "email": "newuser@medledger.com",
  "password": "SecurePass@123",
  "fullName": "John Doe",
  "role": "patient",
  "walletAddress": "0x...",
  "age": 35
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "token": "jwt_token_here",
  "user": { ... }
}
```

### POST `/api/auth/login`
Authenticate user and get JWT token.

**Request:**
```json
{
  "email": "patient1@medledger.com",
  "password": "Patient@123"
}
```

**Response:** (See above)

### GET `/api/auth/me`
Get current authenticated user details.

**Request:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "patient1@medledger.com",
    "fullName": "Rajesh Kumar",
    "role": "patient",
    "walletAddress": "0x1234567890123456789012345678901234567890"
  }
}
```

---

## 📱 Frontend Integration

### Login Page (`src/pages/LoginPage.jsx`)
- Email/password input fields
- Demo credential buttons for quick testing
- Displays error messages
- Redirects to dashboard based on role

### API Service Updates (`src/services/api.js`)
```javascript
// Automatically includes JWT token in all requests
const api = axios.create({...});
api.interceptors.request.use(config => {
  const token = localStorage.getItem("medledger_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login function
await loginUser(email, password);

// Get current user
await getCurrentUser();

// Logout function
await logoutUser();
```

---

## 🛡️ Role-Based Authorization

Different API endpoints require different roles:

### Patient-Only Endpoints
- `GET /api/records/patient` - View own records
- `POST /api/records/upload` - Upload medical records
- `POST /api/ai/predict-risk` - Run AI predictions
- `GET /api/ai/alerts` - View risk alerts

### Doctor-Only Endpoints
- `GET /api/records/doctor?patientAddress=...` - View patient records (with consent)
- `POST /api/emergency/request-access` - Request emergency access

### Both Patient & Doctor
- `GET /api/auth/me` - Get own profile
- `PATCH /api/consents/{id}` - Manage consent

---

## 💾 Database

### User Collection Schema
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  password: String (SHA-256 hashed),
  fullName: String,
  role: "patient" | "doctor",
  walletAddress: String (unique, lowercase),
  specialization: String (doctors only),
  licenseNumber: String (doctors only),
  hospital: String (doctors only),
  age: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Check Users in MongoDB
```bash
# Connect to MongoDB
mongosh mongodb://127.0.0.1:27017/medledger

# List all users
db.users.find().pretty()

# Find specific user
db.users.findOne({ email: "patient1@medledger.com" })

# Count total users
db.users.countDocuments()
```

---

## 🔄 Workflow: Patient Upload and Doctor Access

### 1. Patient Uploads Record
```
Patient logs in (JWT token) 
→ Uploads file via /api/records/upload 
→ Record stored with patientAddress 
→ Doctor gets notification
```

### 2. Doctor Requests Access
```
Doctor logs in (JWT token) 
→ Queries /api/records/doctor?patientAddress=0x... 
→ Checks patient-doctor relationship 
→ Returns only authorized records
```

### 3. Emergency Access
```
Doctor requests emergency access via /api/emergency/request-access 
→ Ticket created with 30-min expiry 
→ Patient notified 
→ Doctor can see records during emergency window
```

---

## 🚨 Error Handling

### 401 Unauthorized
```json
{ "message": "Invalid or expired token" }
```
**Solution:** Login again to get a fresh token.

### 403 Forbidden
```json
{ "message": "Access denied. Required role: doctor" }
```
**Solution:** This endpoint requires doctor role.

### 400 Bad Request
```json
{ "message": "Email and password required" }
```
**Solution:** Provide all required fields.

---

## 📝 Environment Variables

Add to `server/.env`:
```
MONGO_URI=mongodb://127.0.0.1:27017/medledger
JWT_SECRET=medledger-secret-key-change-in-production
PORT=5000
PINATA_JWT=placeholder
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x0000...0000
AI_SERVICE_URL=http://127.0.0.1:8000
```

---

## 🧪 Testing with Postman/Curl

### 1. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient1@medledger.com","password":"Patient@123"}'
```

Copy the `token` from response.

### 2. Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Upload Record (Patient)
```bash
curl -X POST http://localhost:5000/api/records/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@lab_report.pdf" \
  -F "recordType=Lab Result" \
  -F "notes=Annual checkup results"
```

### 4. Get Doctor's Records
```bash
curl -X GET "http://localhost:5000/api/records/doctor?patientAddress=0x1234567890123456789012345678901234567890" \
  -H "Authorization: Bearer DOCTOR_TOKEN_HERE"
```

---

## 🎯 Next Steps

1. **Test Login**: Use demo credentials to verify authentication
2. **Patient Actions**: Upload records, check AI predictions
3. **Doctor Actions**: Search patient records, request emergency access
4. **Blockchain**: Each action triggers demo blockchain hash
5. **Production**: Replace JWT_SECRET, use bcrypt for passwords, enable HTTPS

---

## 📞 Support

For issues:
1. Check MongoDB is running: `mongosh`
2. Verify backend is running: `npm run dev` in `server/`
3. Check browser console for API errors
4. Verify request includes `Authorization: Bearer {token}` header

---

**Last Updated:** February 19, 2026
**Version:** 1.0.0
