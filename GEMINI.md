# GEMINI.md - Project Context

## Project Overview
**my-iot-app** (also referred to as **Smart Aqua Monitor**) is a React-based web application designed for IoT device monitoring and management, specifically focused on water-related telemetry. It features a robust role-based access control (RBAC) system and real-time data visualization.

### Core Technology Stack
- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend/Database:** Firebase (Authentication & Realtime Database)
- **Routing:** React Router Dom (v7+)
- **Charts:** Recharts
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **Email:** EmailJS

## Architecture & Directory Structure
The project follows a modular React architecture:

- `src/components/`: Reusable UI components organized by feature (Analytics, Auth, Charts, Layout, Modals, etc.).
- `src/context/`: Contains `AuthContext.jsx` which manages global authentication state and user roles.
- `src/hooks/`: Custom hooks for fetching devices, user data, and managing chart logs.
- `src/services/`: The interface layer for external services (Firebase, EmailJS). Implements atomic multi-path updates for Firebase.
- `src/pages/`: Main view components organized by user role (Admin, User, Dashboard).
- `src/utils/`: Utility functions for error handling, formatting, and security metrics.
- `src/constants/`: Application-wide constants for routes and roles.

## Building and Running
The following commands are defined in `package.json`:

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles the application for production.
- `npm run lint`: Executes ESLint for code quality checks.
- `npm run preview`: Serves the production build locally.
- `npm run mobile-android`: Specialized script to build and run the application on Android via Cordova.

## Development Conventions
- **Authentication:** Users have roles (`superAdmin`, `admin`, `user`). Some accounts may require a mandatory password change on first login (`mustChangePassword`).
- **Firebase Patterns:**
    - Data is partitioned into `/users`, `/accounts`, and `/roles`.
    - Uses **Atomic Multi-path Updates** (via `update(ref(db), updates)`) to ensure data consistency across multiple nodes.
    - Real-time listeners (`onValue`) are used for dashboard telemetry.
- **Styling:** Uses Tailwind CSS for utility-first styling.
- **Environment Variables:** Critical configurations (Firebase API keys, EmailJS IDs) are managed via `.env` and accessed through `import.meta.env`.
- **Naming Conventions:** Service files use camelCase (e.g., `auth.service.js`), while components use PascalCase (e.g., `DashboardHeader.jsx`).

## Key Environment Variables
Ensure the following are configured in your local `.env` file:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_SUPER_ADMIN_EMAILS` (Comma-separated list of emails with superAdmin privileges)
- `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_PUBLIC_KEY`

## Project Standards
- **Grid System:** Always use a strict 8-point grid system for all margins, padding, and layout dimensions.
- **Coding Style:** Prioritize clean code and SOLID principles. Use descriptive naming and keep components small/decomposed.
- **UI Theme:** Use a **Glassmorphism** aesthetic for all UI components. 
    - Use semi-transparent backgrounds with a `backdrop-filter: blur()`.
    - Use thin, light borders (low opacity white/grey) to simulate glass edges.
    - Ensure text maintains high contrast against blurred backgrounds.

## 🛡️ Security & Privacy Protocol (Smart Aqua Standard)

### 1. Data Integrity & Authorization (NoSQL Protection)
- **Principle of Least Privilege (PoLP):** No global `.read` or `.write`. All access must be scoped to `auth.uid` or `superAdmin` role.
- **Strict Validation:** Every write operation to `/readings` and `/logs` must contain mandatory children (`timestamp`, `tds_ppm`) to prevent schema-less injection.
- **Auto-Reset Policy:** Account lockouts (Brute Force) must automatically reset in the database after the cooldown period (MM:SS) to ensure system availability.

### 2. Hardware Security (ESP32 Integration)
- **Secure Transport:** Telemetry must use `WiFiClientSecure` with TLS 1.3. No plain HTTP communication is allowed.
- **Command Freshness:** Every hardware command (e.g., relay toggle) must include a `serverTimestamp` to prevent Replay Attacks. Hardware should ignore commands older than 60 seconds.
- **Key Scoping:** Firebase API keys must be restricted via Google Cloud Console to specific services (Realtime Database only).

### 3. Privacy & Auditability
- **Data Minimization:** Strictly no storage of full names or addresses in the `roles` node. Use `residentID` as the primary key.
- **Administrative Transparency:** All "Disable/Enable" actions on user accounts must generate an entry in the `audit-logs` node containing the `adminEmail` and `timestamp`.
- **Session Governance:** Authentication persistence is set to `browserSessionPersistence` for control-center security.