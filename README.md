# Learning Management System (LMS)

A full-stack Learning Management System (LMS) built with a modern, spec-driven architecture featuring a **Go** backend API and a **React 19 / React Router 8** frontend interface, backed by **PostgreSQL**.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 19 + React Router v8 + Vite
- **Language:** TypeScript
- **State Management & Data Fetching:** TanStack Query (React Query) v5
- **Styling:** Tailwind CSS + Lucide Icons + `clsx` & `tailwind-merge`
- **Validation:** Zod

### **Backend**
- **Language:** Go 1.22+
- **Router:** Chi Router (`github.com/go-chi/chi/v5`)
- **ORM / Database Access:** GORM (`gorm.io/gorm`) with PostgreSQL driver
- **Authentication:** JWT (JSON Web Tokens) & Role-Based Access Control (RBAC)
- **CORS:** Configured cross-origin resource sharing middleware

### **Database & Infrastructure**
- **Database:** PostgreSQL 16
- **Containerization:** Docker & Docker Compose
- **Migrations:** Raw SQL schema migrations (`database/migrations`)
- **Seeding:** SQL Seed scripts (`database/seeds`)

---

## 📁 Project Structure

```text
LMS/
├── backend/                  # Go REST API Backend
│   ├── cmd/                  # Application Entry Points (main.go)
│   ├── internal/             # Core Business Logic & Domain Handlers
│   │   ├── auth/             # Auth middleware & handlers
│   │   ├── config/           # Environment configuration loader
│   │   ├── database/         # DB connection setup
│   │   ├── enrollment/       # Course enrollment logic
│   │   ├── server/           # HTTP Server & Router routing setup
│   │   └── user/             # User management & profile handlers
│   ├── Dockerfile            # Multi-stage Go build
│   ├── go.mod                # Go module dependencies
│   └── .env.example          # Sample environment configuration
├── frontend/                 # React 19 Frontend
│   ├── src/                  # React Application source code
│   │   ├── components/       # Reusable UI components & layouts
│   │   └── routes/           # React Router route pages
│   ├── Dockerfile            # Frontend container build
│   ├── package.json          # Node dependencies & scripts
│   └── .env.example          # Sample frontend environment config
├── database/                 # Database scripts
│   ├── migrations/           # SQL migration files (.up.sql / .down.sql)
│   └── seeds/                # Seed data scripts
├── docker-compose.yml        # Multi-container orchestrator (Postgres, Backend, Frontend)
├── setup-portforward.ps1     # PowerShell script for dev port forwarding
└── README.md                 # Project Setup & Documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Docker](https://www.docker.com/) & Docker Compose
- [Go](https://go.dev/) (v1.22 or higher) *(if running locally without Docker)*
- [Node.js](https://nodejs.org/) (v20+ recommended) & `npm` *(if running frontend locally)*
- [PostgreSQL](https://www.postgresql.org/) (v16) *(if running DB locally)*

---

### Option 1: Quick Setup with Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd LMS
   ```

2. **Start all services (PostgreSQL, Backend API, Frontend):**
   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   - **Frontend App:** [http://localhost:3001](http://localhost:3001)
   - **Backend REST API:** [http://localhost:8081/api/v1](http://localhost:8081/api/v1)
   - **PostgreSQL Database:** `localhost:5433` (User: `lms_user`, Pass: `lms_password`, DB: `lms_db`)

---

### Option 2: Local Development Setup (Manual)

#### 1. Setup Database
Ensure PostgreSQL is running locally. You can spin up just PostgreSQL via Docker:
```bash
docker compose up postgres -d
```
The database will be initialized automatically with `database/migrations/000001_init_schema.up.sql`.

To seed initial test data into the database:
```bash
docker exec -i lms-postgres-1 psql -U lms_user -d lms_db < database/seeds/seed.sql
```

#### 2. Setup & Run Backend (Go)
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Install Go dependencies and start the server:
   ```bash
   go mod download
   go run cmd/main.go
   ```
   The backend API will run at `http://localhost:8080`.

#### 3. Setup & Run Frontend (React / Vite)
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Install packages and start the Vite development server:
   ```bash
   npm install
   npm run dev
   ```
   The frontend will be live at `http://localhost:5173` (or the port specified in terminal).

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `APP_ENV` | `development` | Environment mode |
| `APP_PORT` | `8080` | Port for backend server |
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `5433` | Database port |
| `DB_USER` | `lms_user` | Database user |
| `DB_PASSWORD` | `lms_password` | Database password |
| `DB_NAME` | `lms_db` | Database name |
| `JWT_SECRET` | `super-secret-dev-key` | Secret key for JWT signing |

### Frontend (`frontend/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api/v1` | Backend API base URL |

---

## 🔐 Features & Architecture

- **User Authentication:** JWT token auth with secure claims, password hashing, and login/register endpoints.
- **RBAC Authorization:** Roles for Student, Instructor, and Admin.
- **Course & Enrollment Management:** APIs for browsing courses, enrolling students, and fetching user progress.
- **Spec-Driven Architecture:** Code organized clearly by domain package in `backend/internal/`.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
