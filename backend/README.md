# EcoTrade Rwanda — Backend API

EcoTrade Rwanda backend is a RESTful API server planned to be built with FastAPI and Python. It will serve as the data layer for both the web frontend and the mobile application, handling authentication, waste listing management, transaction processing, and analytics.

The backend is currently under development. The frontend and mobile applications operate in offline mode using localStorage and Hive respectively until the backend is connected.

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

The backend exposes a JSON REST API that the frontend consumes via the `src/services/api.ts` client and the mobile app consumes via Dio. It will include JWT-based authentication with OTP two-factor support, role-based access control, and full CRUD operations for all platform entities.

---

## Prerequisites

Before running the backend, ensure the following are installed on your machine:

- Python version 3.10 or higher
- pip (Python package manager, bundled with Python)
- Git
- A running PostgreSQL instance (or SQLite for local development)

To verify your Python installation:

```bash
python --version
pip --version
```

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Daniel-IRYIVUZE/kcem_platform.git
cd kcem_platform/backend
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
pip install -r requirements.txt
```

5. Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values (see the Environment Variables section below).

6. Apply database migrations:

```bash
alembic upgrade head
```

---

## Running the Application

### Development Server

Start the FastAPI development server with auto-reload:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

Interactive API documentation (Swagger UI) will be available at http://localhost:8000/docs

Alternative ReDoc documentation will be available at http://localhost:8000/redoc

### Running with a custom port

```bash
uvicorn app.main:app --reload --port 8080
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/ecotrade
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
OTP_EXPIRE_MINUTES=5
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-email-password
FRONTEND_URL=http://localhost:5174
```

For local development with SQLite (no PostgreSQL required):

```
DATABASE_URL=sqlite:///./ecotrade.db
```

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                # FastAPI application entry point
│   ├── config.py              # Environment and settings loader
│   ├── database.py            # Database connection and session
│   ├── models/                # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── listing.py
│   │   ├── transaction.py
│   │   ├── collection.py
│   │   └── ...
│   ├── schemas/               # Pydantic request and response schemas
│   ├── routers/               # API route handlers
│   │   ├── auth.py
│   │   ├── listings.py
│   │   ├── transactions.py
│   │   ├── collections.py
│   │   ├── users.py
│   │   └── ...
│   ├── services/              # Business logic layer
│   ├── dependencies.py        # Shared dependency injection
│   └── utils/                 # Helpers for OTP, email, PDF generation
├── alembic/                   # Database migration scripts
├── tests/                     # Automated tests
├── requirements.txt           # Python dependencies
├── .env.example               # Environment variable template
└── README.md
```

---

## Technology Stack

| Layer              | Technology          |
|--------------------|---------------------|
| Framework          | FastAPI             |
| Language           | Python 3.10+        |
| ORM                | SQLAlchemy          |
| Migrations         | Alembic             |
| Validation         | Pydantic v2         |
| Authentication     | JWT (python-jose)   |
| Password Hashing   | bcrypt (passlib)    |
| Server             | Uvicorn             |
| Database           | PostgreSQL / SQLite |
| Email              | SMTP via smtplib    |

---

## API Endpoints Overview

The following endpoint groups are planned:

| Group            | Base Path             | Description                          |
|------------------|-----------------------|--------------------------------------|
| Authentication   | /api/auth             | Login, register, OTP verify, refresh |
| Users            | /api/users            | User management and profile          |
| Waste Listings   | /api/listings         | Create, read, update, delete         |
| Collections      | /api/collections      | Collection scheduling and tracking   |
| Transactions     | /api/transactions     | Payment records and history          |
| Bids             | /api/bids             | Recycler bids on listings            |
| Routes           | /api/routes           | Driver route assignments             |
| Analytics        | /api/analytics        | Platform statistics and reports      |
| Support          | /api/support          | Customer support tickets             |

Full documentation with request and response schemas will be available at `/docs` once the server is running.

---

## Database

The backend uses PostgreSQL for production and supports SQLite for local development. All schema changes are managed through Alembic migrations.

To create a new migration after modifying models:

```bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

To reset the database during development:

```bash
alembic downgrade base
alembic upgrade head
```

---

## License

MIT License. See the LICENSE file in the root of the repository for details.
