# HRM - Human Resource Management System

HRM is a web-based employee management application for company administration, employee profiles, attendance, leave requests, and leave allocation. It is implemented as a JavaScript monorepo with a React/Vite frontend and an Express/Mongoose backend backed by MongoDB.

## Contents

- [1. Product scope & Objectives](#product-scope)
- [2. Architecture](#architecture)
- [3. Repository structure](#repository-structure)
- [4. Technology stack](#technology-stack)
- [5. Functional modules](#functional-modules)
- [6. Roles and permissions](#roles-and-permissions)
- [7. Data model](#data-model)
- [8. API reference](#api-reference)
- [9. Authentication flow](#authentication-flow)
- [10. Local setup](#local-setup)
- [11. Environment variables](#environment-variables)
- [12. Development workflow](#development-workflow)
- [13. Deployment](#deployment)
- [14. Security and operational notes](#security-and-operational-notes)

## Product scope

The application supports:

- Company and administrator registration.
- Employee creation, listing, editing, and removal.
- Role-based access for `Admin`, `HR`, and `Employee` users.
- Login with email, login ID, or employee ID.
- Short-lived access tokens and refresh tokens.
- First-login/temporary-password replacement.
- Daily check-in and check-out.
- Attendance filtering, status calculation, and corrections.
- Leave application, cancellation, review, and approval.
- Leave balances by employee and leave type.
- Employee profile, resume, private information, avatar, and salary views.
- Company logo upload as validated base64 data.

## Architecture

### System overview

```text
                         HTTPS
        +---------------------------------------+
        |                                       |
        v                                       |
+-------------------+       JSON/REST      +----+----------------+
| React 19 + Vite   |  ------------------> | Express 5 API      |
| frontend/         |  <------------------ | backend/server.js  |
|                   |  JWT Authorization   |                    |
| - Auth            |                      | - CORS             |
| - Dashboard       |                      | - Security headers |
| - Profiles        |                      | - Rate limiting    |
| - Attendance      |                      | - Route middleware |
| - Leave screens   |                      | - Controllers      |
+-------------------+                      +----------+---------+
                                                       |
                                                       | Mongoose
                                                       v
                                             +-------------------+
                                             | MongoDB           |
                                             | Company           |
                                             | User              |
                                             | Attendance        |
                                             | Leave             |
                                             | LeaveAllocation   |
                                             +-------------------+
```

### Request lifecycle

1. Vite serves the React application in development or the built `frontend/dist` files in production.
2. The frontend sends requests to `VITE_API_URL + /api/...`. During local development, Vite proxies `/api` to `http://localhost:5000`.
3. Express loads environment variables, connects to MongoDB, applies security headers, CORS, JSON parsing, and route middleware.
4. Protected endpoints read the bearer access token from the `Authorization` header.
5. `authMiddleware.protect` verifies the JWT and loads the user without password or refresh-token fields.
6. Controllers enforce company boundaries and role permissions, apply business rules, and persist documents through Mongoose.
7. The API returns JSON consumed by the React components.

### Architectural boundaries

| Layer | Responsibility | Location |
| --- | --- | --- |
| Presentation | Screens, widgets, local UI state, API calls | `frontend/src/` |
| Client session | User information and token persistence in `localStorage` | `frontend/src/App.jsx`, `frontend/src/Auth.jsx` |
| HTTP/API | CORS, JSON parsing, route registration, health endpoint | `backend/server.js` |
| Authentication | JWT verification, password hashing, role authorization | `backend/middleware/`, `backend/controllers/authController.js` |
| Business logic | Attendance and leave rules, employee operations | `backend/controllers/` |
| Persistence | MongoDB schemas, indexes, and relationships | `backend/models/` |
| Deployment | Render backend and Vercel SPA configuration | `backend/render.yaml`, `frontend/vercel.json` |

## Repository structure

```text
HRM/
├── README.md
├── details.txt                  # Historical deployment/setup notes
├── ProjectStructure.txt         # Original project notes
├── backend/
│   ├── server.js                # Express application entry point
│   ├── package.json             # Backend scripts and dependencies
│   ├── .env.example             # Backend configuration template
│   ├── render.yaml              # Render web-service configuration
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Company, user, login, token operations
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   ├── Dashboard.js         # Dashboard-related legacy/experimental code
│   │   └── auto_id.js           # Legacy employee-creation code
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT and role guards
│   │   └── securityMiddleware.js
│   ├── models/
│   │   ├── company.js
│   │   ├── User.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   └── LeaveAllocation.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── leaveRoutes.js
│   │   └── profile.routes.js
│   └── utils/
│       └── idGenerator.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── .env.example
    ├── vite.config.js
    ├── vercel.json                # SPA fallback for client-side navigation
    ├── public/
    └── src/
        ├── main.jsx               # React bootstrap
        ├── App.jsx                # Session gate and top-level view switching
        ├── Auth.jsx               # Login, signup, and password-change flow
        ├── Dashboard.jsx
        ├── components/
        ├── context/
        ├── pages/
        └── assets/
```

`node_modules/`, build output, and `.env` files are intentionally ignored and should not be committed.

## Technology stack

### Frontend

- React 19
- Vite 8
- Tailwind CSS 4 with the Vite plugin
- React Icons
- Oxlint
- Browser `fetch` API
- `localStorage` for the current client session and local leave-document metadata

### Backend

- Node.js
- Express 5
- Mongoose 9
- MongoDB
- `bcryptjs` for password hashing
- `jsonwebtoken` for access and refresh tokens
- `cors` for origin control
- `dotenv` for environment configuration

## Functional modules

### Company onboarding and authentication

- `POST /api/auth/signup` creates a company and its first `Admin`.
- Passwords must contain at least eight characters, including uppercase, lowercase, number, and special character.
- A company logo may be sent as base64 data and must be a PNG, JPEG, WEBP, or SVG of at most 1 MB.
- Login accepts email, login ID, or employee ID.
- A successful login returns an access token, refresh token, and serialized user.
- Employees created by Admin/HR receive a generated temporary password and must change it on first login.

### Employee management

- Admin and HR users can list employees in their own company.
- Admin and HR users can create employees.
- Admin users alone can create another Admin or delete employees.
- Admin and HR users can update work-related employee fields.
- An employee can update their own personal profile, resume, private information, and avatar.
- Employees cannot access records belonging to another company.

### Attendance

- Employees check in and check out once per day.
- The default shift is 09:30-18:30, with eight required hours, a four-hour half-day threshold, and a one-hour break.
- Attendance status can be `Present`, `Late`, `Half Day`, `Leave`, `Holiday`, `Weekend`, or `Absent`.
- Admin/HR users can view company attendance, filter it, and correct records.
- Each record has an audit trail and a unique `(userId, date)` index.

### Leave and leave allocation

- Employees apply for Paid, Sick, Unpaid, or Casual Leave.
- Working days exclude Saturday, Sunday, and the holidays configured in `leaveController.js`.
- Overlapping pending/approved leave is rejected.
- Paid leave types are checked against the employee's remaining allocation.
- Admin/HR users approve or reject requests and manage allocations.
- Employees may cancel only pending requests; Admin/HR may cancel pending requests for their company.
- Leave and allocation records maintain audit entries.

### Profiles and salary

The profile UI contains resume, private information, and salary sections. Salary calculations are currently performed in the frontend from the configured monthly wage and percentage values; the backend profile model stores profile data but does not expose a separate payroll API.

## Roles and permissions

| Capability | Admin | HR | Employee |
| --- | :---: | :---: | :---: |
| Register a company | Yes | No | No |
| View company employees | Yes | Yes | Own record |
| Create employee | Yes | Yes | No |
| Create another Admin | Yes | No | No |
| Update work details | Yes | Yes | Own record |
| Delete employee | Yes | Yes | No |
| Check in/out | Yes | Yes | Yes |
| View company attendance | Yes | Yes | Own records |
| Correct attendance | Yes | Yes | No |
| Apply/cancel own leave | Yes | Yes | Yes |
| Review leave | Yes | Yes | No |
| Manage leave allocations | Yes | Yes | No |
| Update own private profile | Yes | Yes | Yes |

## Data model

### Company

Stores company identity and optional logo:

- `company_name`, `company_code`, `customId`
- `company_logo.data`, `company_logo.mimeType`, `company_logo.fileName`
- timestamps

### User

Stores tenant membership, credentials, role, and employee profile:

- `company_id` references `Company`
- `login_id` and `employeeId` are generated employee identifiers
- name, email, phone, password hashes, temporary-password state
- `role`: `Admin`, `HR`, or `Employee`
- `refresh_tokens`
- profile fields such as department, job position, manager, location, resume, private information, avatar, status, and salary

Important indexes:

- Unique `login_id`
- Unique `employeeId`
- Unique `email`
- Unique `(company_id, joining_year, serial_number)`

### Attendance

Stores one employee's daily attendance:

- employee/user reference and date
- shift configuration
- check-in/check-out timestamps
- break, work-hour, and extra-hour calculations
- attendance status and remarks
- correction details and audit trail

Important index: unique `(userId, date)`.

### Leave

Stores a leave request:

- employee identity and department
- leave type, date range, total working days, and reason
- optional attachment
- approval status and reviewer information
- audit trail

### LeaveAllocation

Stores the balance for one employee and leave type:

- allocated, used, and remaining days
- employee snapshot fields
- unique `(userId, leaveType)`
- audit trail

## API reference

All protected endpoints require:

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

### Health

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | Returns a backend-online message |

### Authentication and employees

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | No | Register a company and initial Admin |
| `POST` | `/api/auth/login` | No | Login with email, login ID, or employee ID |
| `POST` | `/api/auth/refresh-token` | Refresh token body | Issue a new access token |
| `POST` | `/api/auth/change-password` | Yes | Change current or temporary password |
| `POST` | `/api/auth/update-temporary-password` | Yes | Alias for password change |
| `POST` | `/api/auth/logout` | Yes | Remove a refresh token |
| `GET` | `/api/auth/me` | Yes | Return the authenticated user |
| `GET` | `/api/auth/employees` | Yes | List own employee record or company employees |
| `POST` | `/api/auth/create-employee` | Admin/HR | Create an employee |
| `PUT` | `/api/auth/employees/:id` | Yes | Update an employee subject to role/ownership rules |
| `DELETE` | `/api/auth/employees/:id` | Admin/HR | Remove an employee in the same company |

### Profile

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `PATCH` | `/api/profile/update` | Yes | Update profile fields for the authenticated user |

### Attendance

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/attendance/checkin` | Yes | Create today's check-in record |
| `POST` | `/api/attendance/checkout` | Yes | Complete today's attendance record |
| `GET` | `/api/attendance` | Yes | List attendance; Admin/HR can filter company records |
| `PATCH` | `/api/attendance/:id/correct` | Admin/HR | Correct an attendance record |

Supported attendance query parameters include `employeeId`, `status`, `department`, `date`, and `month`.

### Leave

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/leaves` | Yes | List own or company leave requests |
| `POST` | `/api/leaves` | Yes | Submit a leave request |
| `PATCH` | `/api/leaves/:id/review` | Admin/HR | Approve or reject a request |
| `PATCH` | `/api/leaves/:id/cancel` | Yes | Cancel a pending request |
| `GET` | `/api/leaves/allocations/list` | Yes | List own or company allocations |
| `POST` | `/api/leaves/allocations` | Admin/HR | Create or update an allocation |

Supported leave query parameters include `employeeId`, `status`, `leaveType`, `department`, `startDate`, and `endDate`.

## Authentication flow

```text
Signup/Login
    |
    v
API returns accessToken + refreshToken + user
    |
    v
Frontend stores tokens and userInfo in localStorage
    |
    v
Frontend sends accessToken as Bearer token
    |
    v
protect middleware verifies JWT and loads the user
    |
    +--> Role guard for Admin/HR-only operations
    |
    v
Controller executes tenant-scoped business operation
```

Access tokens default to 15 minutes and refresh tokens default to 7 days. The top-level React application checks the access-token expiry and clears the local session when it expires. The refresh endpoint can issue a replacement access token when the refresh token is valid and stored for that user.

## Local setup

### Prerequisites

- Node.js 18 or newer
- npm
- A MongoDB database, local or hosted
- Git

### 1. Clone and enter the project

```powershell
git clone <repository-url>
cd HRM
```

### 2. Configure the backend

```powershell
cd backend
Copy-Item .env.example .env
```

Edit `backend/.env` and provide a real MongoDB URI and long random JWT secrets. Never commit this file.

### 3. Install backend dependencies and start the API

```powershell
npm install
npm start
```

The API listens on `http://localhost:5000` by default. Verify it with:

```powershell
Invoke-WebRequest http://localhost:5000/
```

### 4. Configure and start the frontend

Open another terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

For local development, `VITE_API_URL` may remain empty because `vite.config.js` proxies `/api` to `http://localhost:5000`. If the frontend calls a separately hosted backend, set `VITE_API_URL` to that backend origin.

## Environment variables

### Backend

| Variable | Required | Purpose |
| --- | :---: | --- |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Access-token signing secret |
| `JWT_REFRESH_SECRET` | Recommended | Refresh-token signing secret; falls back to `JWT_SECRET` |
| `JWT_ACCESS_EXPIRES_IN` | No | Access-token lifetime; default `15m` |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh-token lifetime; default `7d` |
| `CORS_ORIGIN` | Yes in deployment | Comma-separated allowed frontend origins |
| `PORT` | No | API port; default `5000` |
| `NODE_ENV` | No | Runtime environment, set to `production` in Render |

### Frontend

| Variable | Required | Purpose |
| --- | :---: | --- |
| `VITE_API_URL` | No | Backend origin; empty uses the Vite `/api` proxy |

Vite exposes `VITE_*` values to browser code. Do not put passwords, database credentials, or JWT secrets in frontend environment files.

## Development workflow

### Backend

```powershell
cd backend
npm install
npm start
```

The backend currently has no automated test script. The package `test` command is the default placeholder and exits with an error.

### Frontend

```powershell
cd frontend
npm run dev       # Start Vite development server
npm run build     # Create production build in dist/
npm run preview   # Preview the production build
npm run lint      # Run Oxlint
```

Before opening a pull request, run at least:

```powershell
cd frontend
npm run lint
npm run build
```

## Deployment

### Backend on Render

`backend/render.yaml` defines a Node web service:

- Root directory: `HRM/backend`
- Build command: `npm install`
- Start command: `npm start`
- Required secret environment variables: `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `CORS_ORIGIN`

Set `CORS_ORIGIN` to the exact deployed frontend origin, without a trailing slash. The previously recorded backend URL is `https://odoo-project-1.onrender.com`.

### Frontend on Vercel

The frontend is deployed as a Vite static site:

- Root directory: `HRM/frontend`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- `frontend/vercel.json` rewrites requests to `index.html` for SPA fallback

Set `VITE_API_URL` to the Render backend origin. The previously recorded frontend URL is `https://hrm-ochre-eta.vercel.app`.

## Security and operational notes

- Passwords are hashed with `bcryptjs`; plaintext passwords should not be stored or logged.
- Protected responses exclude password hashes, temporary passwords, and refresh-token arrays.
- CORS allows only origins listed in `CORS_ORIGIN`.
- Login requests are limited to eight attempts per IP in a rolling 15-minute in-memory window.

- Base64 file storage increases document and response sizes; a managed object-storage service is a future improvement for larger files.
- `express.json` accepts request bodies up to 10 MB; individual company-logo validation remains limited to 1 MB.

Login:
Password:

ADARSA20260004
Hr@df13ddc18fA1

Login ID: ADTABA20260005
Temporary Password: Hr@7ad715b5e1A1
tanmoy

Login ID: ADSKFA20260006
Temporary Password: Hr@bab42ed15dA1
Nahid

Login ID: ADSOGH20260007
Temporary Password: Hr@1ab9ae25a9A1
sounak

Login ID: ADJYDA20260008
Temporary Password: Hr@6006de36ecA1
jyo

Login ID: ADSUMO20260009
Temporary Password: Hr@00e6e7d3c7A1
suman

ADSUMO20260009
Sandip@2004