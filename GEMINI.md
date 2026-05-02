# Project Gemini Context: iot-app

## Project Overview
`iot-app` is a React-based IoT monitoring and management dashboard. It allows users and administrators to monitor real-time data from IoT devices (like salinity, voltage, and power usage), manage device assignments, and handle user requests. The application is designed to be responsive and can be bundled for mobile (Android) via Cordova.

## Core Technologies
- **Frontend:** React 19 (Functional components, Hooks)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Backend/Database:** Firebase (Authentication & Realtime Database)
- **Routing:** React Router v7
- **Charts:** Recharts
- **Icons:** Lucide React
- **Mobile Integration:** Cordova

## Project Structure
```text
C:\Users\Admin\testcode\
├───src\
│   ├───components\      # Categorized UI components (auth, device, ui, etc.)
│   ├───constants\       # App-wide constants (routes, roles)
│   ├───context\         # React Context for global state (Auth, Notification, UI)
│   ├───hooks\           # Custom React hooks for business logic
│   ├───pages\           # Top-level page components (admin, dashboard, user)
│   ├───services\        # API/Firebase interaction logic
│   ├───utils\           # Utility functions (logger, RBAC, formatting)
│   └───firebaseConfig.js # Firebase initialization and config
└───vite.config.js       # Vite configuration with Cordova export logic
```

## Building and Running
| Task | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts the Vite development server. |
| **Build** | `npm run build` | Builds the project for production. |
| **Linting** | `npm run lint` | Runs ESLint for code quality. |
| **Testing** | `npm run test` | Runs unit tests via Vitest. |
| **Mobile Build** | `npm run mobile-android` | Builds the app and deploys to a sibling Cordova project. |

## Development Conventions
- **State Management:** Use React Context API (`src/context`) for global state.
- **Data Fetching:** Encapsulate Firebase logic within services in `src/services`.
- **Error Handling:** Use the `appError` utility for structured error reporting.
- **Logging:** Use the `logger` utility (`src/utils/logger.js`) instead of `console.log`. It automatically silences logs in production.
- **RBAC:** Use `checkRole`, `isAdmin`, etc., from `src/utils/rbac.js` for access control.
- **Email Service Protocol:** All communications use SendGrid REST API v3. 
- **Environment Variables:** Critical variables (Firebase, SendGrid) are required in `.env`. See `.env.example`. Required SendGrid keys: `VITE_SENDGRID_API_KEY`, `VITE_SENDGRID_SENDER_EMAIL`.
- **Styling:** Prefer Tailwind CSS utility classes. Custom styles should go in `src/index.css`.

## Key Files
- `src/firebaseConfig.js`: Entry point for Firebase services.
- `src/AppRoutes.jsx`: Centralizes all application routing and protection.
- `src/context/AuthContext.jsx`: Manages user authentication state and session duration.
- `src/utils/rbac.js`: Central logic for Role-Based Access Control.
- `vite.config.js`: Contains specific configuration for exporting to Cordova (`../saltwaterelectricity/www`).

## 🛡️ Unified Protocol (Saltwater Electricity Standard)

### 1. Data Integrity & NoSQL Protection
- **Mandatory Schema:** Every write operation to `/readings` and `/logs` MUST include `timestamp` (serverTimestamp) and `tds_ppm`. Partial records are schema violations.
- **PoLP:** No global `.read` or `.write`. All access scoped to `auth.uid` or administrative roles.
- **Auto-Reset:** Account lockouts (Brute Force) must automatically reset in the database after the cooldown period to ensure availability.

### 2. Hardware Security (ESP32 Integration)
- **Secure Transport:** Telemetry must use `WiFiClientSecure` with TLS 1.3.
- **Command Freshness:** Every hardware command (e.g., relay toggle) must include a `serverTimestamp`. Hardware should ignore commands older than 60 seconds to prevent Replay Attacks.
- **Anti-Overwrite:** Updates to hardware state must use atomic multi-path updates to keep `latest` and `logs` in sync.

### 3. Administrative Transparency & Audit
- **Unified Audit Trail:** All system-wide changes, device provisioning, and request processing MUST be logged to the `audit-logs` node. LEGACY: `system_audit` is deprecated.
- **Traceability:** "Disable/Enable" user actions MUST trigger a `logActivity` call containing the `adminEmail` and target `uid`.
- **Privacy:** Strictly no storage of full names or addresses in the `roles` node.

### 4. Email & Communication Protocol
- **Delivery Standard:** Use SendGrid REST API v3 (Axios-based).
- **Service Signature:** All service methods must return `{ success, error }` for consistent UI handling.
- **Verification:** Recipient email validation is mandatory before any mail trigger.

### 5. Engineering Standards
- **Logging:** Direct `console` methods are prohibited. Use `src/utils/logger.js`.
- **Persistence:** All authentication must use `browserSessionPersistence` for public terminal security.
- **Error Handling:** Use `appError` for all operational failures.
