# EcoTrade Rwanda — Backend API

Production-ready FastAPI backend for the EcoTrade Rwanda waste-trading marketplace. Fully implemented with 17 ORM models, 14 route modules, JWT authentication, role-based access control, Green Score calculation, and a comprehensive seed dataset of Kigali hotels with real GPS coordinates.

## Quick Start

```bash
cd backend

# 1. Create & activate virtual environment
python -m venv venv
# Windows
.\venv\Scripts\Activate.ps1
# macOS/Linux
source venv/bin/activate

# 2. Upgrade pip and install dependencies
pip install --upgrade pip setuptools wheel
pip install --prefer-binary -r requirements.txt

# 3. Seed comprehensive demo data (hotels, listings, bids, drivers, recyclers)
python seed_comprehensive.py

# Optional: add blog posts
python seed_blogs.py

# 4. Run development server
python -m uvicorn app.main:app --reload --port 8000
```

API: **http://localhost:8000** | Docs: **http://localhost:8000/api/docs**

> **Note**: The database (`ecotrade.db`) is created automatically from SQLAlchemy models on first run. No migration tool is required.

> **Windows + Python 3.12+**: Use `--prefer-binary` to avoid compilation issues with `pydantic-core` and other C extensions.

---

## Environment Variables (`.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./ecotrade.db` | SQLAlchemy URL |
| `SECRET_KEY` | auto-generated | JWT secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | Refresh token TTL |
| `PLATFORM_FEE_PERCENT` | `5.0` | Transaction fee % |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS origins |
| `UPLOAD_DIR` | `./uploads` | File upload dir |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app factory + router registration
│   ├── config.py            # pydantic-settings config
│   ├── database.py          # SQLAlchemy engine + session (auto-creates tables)
│   ├── auth/                # JWT, bcrypt, FastAPI dependency injection
│   ├── models/              # 17 SQLAlchemy ORM models
│   ├── schemas/             # 17 Pydantic v2 schema files
│   ├── crud/                # 13 CRUD operation modules
│   ├── routes/              # 14 API route modules
│   ├── services/            # notification, green score, payment services
│   └── utils/               # pagination, file upload helpers
├── seed.py                  # Minimal demo data seeder
├── seed_comprehensive.py    # Full Kigali hotels + real GPS coords + bids
├── seed_blogs.py            # Blog post seeder
├── test_blog_api.py         # Blog API smoke tests
└── requirements.txt
```

---

## Demo Credentials (after running `seed_comprehensive.py`, password: `Password123!`)

| Email | Role |
|---|---|
| admin@ecotrade.rw | Admin |
| hotel@kigali.rw | Hotel / Business |
| recycler@greencycle.rw | Recycler |
| driver@greencycle.rw | Driver |
| individual@example.com | Individual |

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [API Endpoints Overview](#api-endpoints-overview)
- [Database](#database)
- [License](#license)

---

## Introduction

The backend exposes a JSON REST API consumed by the web frontend (`src/services/api.ts`) and the mobile app (`lib/core/services/api_service.dart`). It provides JWT-based authentication, role-based access control, and full CRUD operations for all platform entities. The database schema is created automatically from SQLAlchemy ORM models — no migration tool is needed. All 33 hotel listings in the seed data are placed at real Kigali GPS coordinates so the Leaflet marketplace maps display accurate clustered pins.

---

## Prerequisites

Before running the backend, ensure the following are installed on your machine:

- Python 3.10 or higher
- pip (bundled with Python)
- Git

To verify:

```bash
python --version
pip --version
```

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Daniel-IRYIVUZE/EcoTrade_Rwanda.git
cd EcoTrade_Rwanda/backend
```

2. Create a Python virtual environment:

```bash
python -m venv venv
```

3. Activate the virtual environment:

On Windows:

```bash
venv\Scripts\activate
```

On Linux or macOS:

```bash
source venv/bin/activate
```

4. Install project dependencies:

```bash
pip install --prefer-binary -r requirements.txt
```

5. Seed demo data:

```bash
python seed_comprehensive.py
# Optional: add blog posts
python seed_blogs.py
```

> The SQLite database (`ecotrade.db`) is created automatically on first run. No migration tool is needed.

---

## Running the Application

### Development Server

Start the FastAPI development server with auto-reload:

```bash
# Ensure virtual environment is activated
python -m uvicorn app.main:app --reload --port 8000
```

The API will be available at http://localhost:8000

Interactive API documentation (Swagger UI) will be available at http://localhost:8000/api/docs

Alternative ReDoc documentation will be available at http://localhost:8000/redoc

### Running with a custom port

```bash
python -m uvicorn app.main:app --reload --port 8080
```

---

## Environment Variables

Create an optional `.env` file in the `backend/` directory to override defaults:

```
DATABASE_URL=sqlite:///./ecotrade.db
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30
PLATFORM_FEE_PERCENT=5.0
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
UPLOAD_DIR=./uploads
```

All variables have sensible defaults — the server starts without a `.env` file.

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app factory + router registration
│   ├── config.py            # pydantic-settings config
│   ├── database.py          # SQLAlchemy engine + session (auto-creates tables)
│   ├── auth/                # JWT, bcrypt, FastAPI dependency injection
│   ├── models/              # 17 SQLAlchemy ORM models
│   ├── schemas/             # 17 Pydantic v2 schema files
│   ├── crud/                # 13 CRUD operation modules
│   ├── routes/              # 14 API route modules
│   ├── services/            # notification, green score, payment services
│   └── utils/               # pagination, file upload helpers
├── seed.py                  # Minimal demo data seeder
├── seed_comprehensive.py    # Full Kigali hotels + real GPS coords + listings + bids
├── seed_blogs.py            # Blog post seeder
├── test_blog_api.py         # Blog API smoke tests
└── requirements.txt
```

---

## Technology Stack

| Layer | Technology |
|--------------------|---------------------|
| Framework | FastAPI |
| Language | Python 3.10+ |
| ORM | SQLAlchemy |
| Database | SQLite (auto-created) |
| Validation | Pydantic v2 |
| Authentication | JWT (python-jose) |
| Password Hashing | bcrypt (passlib) |
| Server | Uvicorn |
| File Uploads | python-multipart |

---

## API Endpoints Overview

| Group | Base Path | Description |
|---|---|---|
| Authentication | /api/auth | Login, register, token refresh, logout |
| Users | /api/users | Profile management and role admin |
| Hotels | /api/hotels | Hotel profile CRUD |
| Waste Listings | /api/listings | Create, read, update, delete, image upload |
| Bids | /api/bids | Recycler bids, accept/reject workflow |
| Collections | /api/collections | Pickup scheduling and status tracking |
| Drivers | /api/drivers | Driver profiles and vehicle management |
| Recyclers | /api/recyclers | Recycler company profiles |
| Transactions | /api/transactions | Payment records and history |
| Routes | /api/routes | Driver route stop assignments |
| Notifications | /api/notifications | In-app notification feed |
| Reviews | /api/reviews | User ratings and feedback |
| Blogs | /api/blogs | Blog post CRUD with admin moderation |
| Stats | /api/stats | Public platform statistics |
| Admin | /api/admin | Admin dashboard data |

Full request/response schemas are available at `/api/docs` once the server is running.

---

## Database

SQLite is used for local development. Tables are created automatically when the server starts (`database.py` calls `Base.metadata.create_all`). No migration tool is required. Run `seed_comprehensive.py` once to populate all demo data including 33 listings at real Kigali hotel GPS coordinates.

---

## License

MIT License. See the LICENSE file in the root of the repository for details.
