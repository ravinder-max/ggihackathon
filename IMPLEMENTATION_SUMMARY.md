# MEDLedger Authentication Implementation Summary

## ✅ What Was Implemented

### 1. User Model & Database Schema
- **File**: `server/src/models/User.js`
- Fields: email, password (hashed), fullName, role, walletAddress, age, specialization (doctors), licenseNumber (doctors), hospital (doctors), isActive, timestamps
- Indexes on email (unique) and walletAddress (unique)

### 2. JWT Token Service
- **File**: `server/src/services/jwtService.js`
- Functions:
  - `generateToken()`: Creates 7-day JWT tokens
  - `verifyToken()`: Validates and decodes tokens
  - `decodeToken()`: Decodes without validation
- Payload includes: userId, email, role, walletAddress

### 3. Authentication Routes
- **File**: `server/src/routes/auth.js`
- Endpoints:
  - `POST /api/auth/register` - Create account
  - `POST /api/auth/login` - Get JWT token
  - `GET /api/auth/me` - Get current user profile
- Password hashing using SHA-256 (production should use bcrypt)
- Error handling for duplicate email, invalid credentials

### 4. Auth Middleware
- **File**: `server/src/middleware/authMiddleware.js`
- `authMiddleware()`: Validates JWT token on protected routes
- `requireRole(...roles)`: Role-based access control
- Rejects requests without valid token with 401/403 response

### 5. Protected Routes
- **File**: `server/src/server.js` (updated)
- Applied `authMiddleware` to:
  - `/api/records/*`
  - `/api/ai/*`
  - `/api/emergency/*`
- Auth routes remain public: `/api/auth/*`

### 6. Database Seeding
- **File**: `server/scripts/seedDatabase.js`
- Populated with:
  - **4 Patients**: Rajesh Kumar, Priya Singh, Amit Patel, Deepa Sharma
  - **2 Doctors**: Dr. Mohit Verma (Cardiology), Dr. Sneha Gupta (Endocrinology)
- Each user has unique wallet address (MetaMask)
- Run with: `npm run seed`

### 7. Frontend Login Page
- **File**: `frontend/src/pages/LoginPage.jsx` (updated)
- Features:
  - Email/password input
  - Demo credential quick-fill buttons
  - Role-aware dashboard redirect
  - Loading and error states

### 8. Frontend API Service
- **File**: `frontend/src/services/api.js` (updated)
- Functions:
  - `loginUser(email, password)`: Authenticate and store token
  - `registerUser(userData)`: Create new account
  - `getCurrentUser()`: Fetch user profile
  - `logoutUser()`: Clear auth data
- Auto-includes JWT in Authorization header for all requests

### 9. Documentation
- **File**: `AUTHENTICATION_GUIDE.md`
- Complete guide with credentials, API examples, workflow diagrams

---

## 🔑 Test Credentials

### Patients
| Email | Password | Wallet |
|-------|----------|--------|
| patient1@medledger.com | Patient@123 | 0x1234567890123456789012345678901234567890 |
| patient2@medledger.com | Patient@123 | 0x2345678901234567890123456789012345678901 |
| patient3@medledger.com | Patient@123 | 0x3456789012345678901234567890123456789012 |
| patient4@medledger.com | Patient@123 | 0x4567890123456789012345678901234567890123 |

### Doctors
| Email | Password | Wallet |
|-------|----------|--------|
| doctor1@medledger.com | Doctor@123 | 0x5678901234567890123456789012345678901234 |
| doctor2@medledger.com | Doctor@123 | 0x6789012345678901234567890123456789012345 |

---

## 📝 Files Created/Modified

### Created
- `server/src/models/User.js` - User database schema
- `server/src/services/jwtService.js` - JWT token functionality
- `server/src/routes/auth.js` - Authentication endpoints
- `server/src/middleware/authMiddleware.js` - Token validation middleware
- `server/scripts/seedDatabase.js` - Database seeding script
- `AUTHENTICATION_GUIDE.md` - Complete documentation

### Modified
- `server/src/server.js` - Added auth routes and middleware
- `server/package.json` - Added jsonwebtoken dependency and seed script
- `frontend/src/pages/LoginPage.jsx` - Updated login UI and logic
- `frontend/src/services/api.js` - Added auth functions and JWT interceptor

---

## 🚀 How to Use

### 1. Install Dependencies
```bash
cd server
npm install  # Already done - includes jsonwebtoken
```

### 2. Seed Test Users
```bash
npm run seed
```
Output shows all credentials and wallet addresses.

### 3. Start Backend
```bash
npm run dev
# Server on http://localhost:5000
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
# UI on http://localhost:8084
```

### 5. Login
1. Go to login page
2. Click "Patient Demo" or "Doctor Demo"
3. Click "Sign In"
4. Redirected to dashboard (patient-dashboard or doctor-dashboard)

---

## 🔐 Security Notes

### Current Implementation (Demo)
- Passwords hashed with SHA-256
- Tokens valid for 7 days
- Tokens stored in localStorage
- JW T_SECRET in environment variables

### Production Improvements Needed
1. Use `bcrypt` instead of SHA-256 for password hashing
2. Implement refresh tokens (separate from access tokens)
3. Use `httpOnly` cookies instead of localStorage for token storage
4. Add rate limiting on login endpoint
5. Implement token blacklist for logout
6. Add password strength validation
7. Enable HTTPS/TLS
8. Add CORS restrictions
9. Add request signing for sensitive operations

---

## 🧪 Testing

### Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient1@medledger.com","password":"Patient@123"}'
```

### Protected Request Test
```bash
# Replace TOKEN with actual JWT from login response
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Role-Based Access Test
```bash
# Doctor trying to access patient records
curl -X GET "http://localhost:5000/api/records/doctor?patientAddress=0x1234567890123456789012345678901234567890" \
  -H "Authorization: Bearer DOCTOR_TOKEN"
```

---

## 🔄 Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                  │
│  - LoginPage: Email/password input                  │
│  - API Service: Auto-includes JWT in requests       │
│  - Dashboard: Role-based redirect                   │
└────────────────────┬────────────────────────────────┘
                     │
          JWT Token in Authorization Header
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                  Backend (Express)                  │
│  ┌──────────────────────────────────────────────┐   │
│  │  Public Routes: /api/auth/*                  │   │
│  │  - POST /auth/login    → returns JWT         │   │
│  │  - POST /auth/register → creates user        │   │
│  └──────────────────────────────────────────────┘   │
│                     │                                │
│                     ▼                                │
│  ┌──────────────────────────────────────────────┐   │
│  │  authMiddleware: Validates JWT               │   │
│  └──────────────────────────────────────────────┘   │
│                     │                                │
│                     ▼                                │
│  ┌──────────────────────────────────────────────┐   │
│  │  Protected Routes: /api/records/*,            │   │
│  │                     /api/ai/*,                │   │
│  │                     /api/emergency/*          │   │
│  │  - Require valid JWT token                   │   │
│  │  - Check role permissions                    │   │
│  └──────────────────────────────────────────────┘   │
│                     │                                │
│                     ▼                                │
│  ┌──────────────────────────────────────────────┐   │
│  │  MongoDB: User Collection + Other Data       │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 📊 User Roles & Permissions

### Patient Role
Can access:
- Upload medical records
- View own records
- Run AI health predictions
- View risk alerts
- Grant/revoke doctor access
- Request emergency access (future)

Cannot access:
- Other patients' records
- Doctor-specific endpoints

### Doctor Role
Can access:
- View authorized patient records (with consent)
- Request emergency access to patient records
- View risk alerts for their patients
- Create advice/recommendations (future)

Cannot access:
- Upload patient records
- Access records without consent

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid email or password" | Check email spelling and password (case-sensitive) |
| "Missing or invalid authorization header" | Add `Authorization: Bearer {token}` to request |
| "Invalid or expired token" | Login again to get fresh token |
| "Access denied. Required role: doctor" | Switch to doctor account |
| "Email already registered" | Use different email for new account |
| CORS errors | Check frontend URL and backend CORS config |
| MongoDB connection failed | Ensure MongoDB is running: `mongosh` |

---

## ✨ Next Features to Add

1. **Profile Management**: Update user details, change password
2. **Two-Factor Authentication**: SMS/email OTP
3. **Refresh Tokens**: Extend session without re-login
4. **Password Reset**: Email-based recovery
5. **User Directory**: Search doctors/patients
6. **Activity Logging**: Track all user actions
7. **Notification System**: Real-time alerts
8. **Audit Trail**: Compliance and security

---

**Implementation Date**: February 19, 2026
**Status**: ✅ Complete and Tested
**Ready for**: Testing, Staging, Production (with security improvements)
