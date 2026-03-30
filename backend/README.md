# EcoTrade Rwanda — Backend API

Production-ready FastAPI REST API for the EcoTrade Rwanda waste-trading marketplace. Implements 17 SQLAlchemy ORM models, 18 route modules, JWT authentication with role-based access control, GreenScore calculation, auto driver assignment (Haversine distance), SMTP email notifications, and a comprehensive Kigali demo dataset with real GPS coordinates.

**Deployed API:** https://api.ecotrade-rwanda.com/api
**Swagger UI:** https://api.ecotrade-rwanda.com/api/docs

---

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [GreenScore System](#greenscore-system)
- [Database](#database)
- [Demo Credentials](#demo-credentials)
- [Technology Stack](#technology-stack)
- [License](#license)

---

## Quick Start

```bash
cd backend

# 1. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS / Linux

# 2. Install dependencies
pip install --upgrade pip setuptools wheel
pip install --prefer-binary -r requirements.txt

# 3. Seed demo data
python seed_comprehensive.py   # hotels, listings, bids, drivers, recyclers
python seed_blogs.py           # optional: blog posts

# 4. Start development server
python -m uvicorn app.main:app --reload --port 8000
```

| Endpoint | URL |
|---|---|
| API root | http://localhost:8000 |
| Swagger UI | http://localhost:8000/api/docs |
| ReDoc | http://localhost:8000/redoc |
| Deployed API | https://api.ecotrade-rwanda.com/api/docs |

---

## Prerequisites

- Python 3.11 or higher
- pip (bundled with Python)
- Git

```bash
python --version   # must be 3.11+
pip --version
```

> **Windows + Python 3.12+**: Use `--prefer-binary` during install to avoid compilation issues with `pydantic-core` and other C extensions.

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/Daniel-IRYIVUZE/EcoTrade_Rwanda.git
cd EcoTrade_Rwanda/backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate it
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS / Linux

# 4. Install all dependencies
pip install --upgrade pip setuptools wheel
pip install --prefer-binary -r requirements.txt

# 5. (Optional) Copy and configure environment file
cp .env.example .env
# Edit .env with your SMTP credentials and desired settings
```

---

## Running the Server

### Development (with auto-reload)

```bash
python -m uvicorn app.main:app --reload --port 8000
```

### Custom port

```bash
python -m uvicorn app.main:app --reload --port 8080
```

### Production

```bash
# Single worker (suitable for SQLite)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Behind Nginx + SSL (recommended)
gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## Environment Variables

Create `backend/.env` to override any default. The server starts with no `.env` file.

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./ecotrade.db` | SQLAlchemy connection string |
| `SECRET_KEY` | auto-generated | JWT signing secret (set explicitly in production) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `240` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `60` | Refresh token lifetime |
| `PLATFORM_FEE_PERCENT` | `5.0` | Fee taken on each transaction |
| `ALLOWED_ORIGINS` | `["http://localhost:5173","http://localhost:5174"]` | CORS allowed origins |
| `SMTP_HOST` | — | SMTP server hostname |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | — | SMTP username / sender email |
| `SMTP_PASSWORD` | — | SMTP password |
| `EMAIL_FROM` | — | From address for outgoing mail |
| `EMAIL_FROM_NAME` | `EcoTrade Rwanda` | Display name for outgoing mail |
| `UPLOAD_DIR` | `./uploads` | Directory for uploaded files |

Example `.env`:

```env
DATABASE_URL=sqlite:///./ecotrade.db
SECRET_KEY=change-me-to-a-long-random-string
ACCESS_TOKEN_EXPIRE_MINUTES=240
REFRESH_TOKEN_EXPIRE_DAYS=60
PLATFORM_FEE_PERCENT=5.0
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:5174","https://ecotrade-rwanda.netlify.app"]
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=no-reply@ecotrade.rw
EMAIL_FROM_NAME=EcoTrade Rwanda
UPLOAD_DIR=./uploads
```

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                # FastAPI app factory, router registration, lifespan
│   ├── config.py              # pydantic-settings — reads from .env
│   ├── database.py            # SQLAlchemy engine, SessionLocal, auto table creation
│   ├── auth/
│   │   ├── jwt.py             # Token generation and validation
│   │   ├── password.py        # bcrypt hashing helpers
│   │   └── dependencies.py    # FastAPI dependency injection (get_current_user, require_role)
│   ├── models/                # 17 SQLAlchemy ORM models
│   │   ├── user.py            # Base user (all roles)
│   │   ├── hotel.py           # Hotel / business profiles
│   │   ├── recycler.py        # Recycler company profiles
│   │   ├── driver.py          # Driver profiles + vehicle
│   │   ├── listing.py         # Waste listings
│   │   ├── bid.py             # Recycler bids
│   │   ├── collection.py      # Pickup schedules + status
│   │   ├── transaction.py     # Financial records
│   │   ├── notification.py    # In-app notifications
│   │   ├── message.py         # Direct messages
│   │   ├── review.py          # User ratings
│   │   ├── inventory.py       # Recycler stock
│   │   ├── green_score.py     # Monthly sustainability metrics
│   │   ├── audit_log.py       # Platform activity log
│   │   ├── system_settings.py # Global configuration
│   │   ├── blog.py            # Blog posts
│   │   └── support.py         # Support tickets
│   ├── schemas/               # Pydantic v2 request/response models (mirrors models/)
│   ├── crud/                  # 13 CRUD modules (create, read, update, delete)
│   ├── routes/                # 18 API route files
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── hotels.py
│   │   ├── recyclers.py
│   │   ├── drivers.py
│   │   ├── listings.py        # + photo upload endpoint
│   │   ├── bids.py
│   │   ├── collections.py     # + QR verify, GPS tracking, auto-assign
│   │   ├── transactions.py
│   │   ├── notifications.py
│   │   ├── messages.py
│   │   ├── reviews.py
│   │   ├── inventory.py
│   │   ├── admin.py
│   │   ├── blog.py
│   │   ├── support.py
│   │   ├── stats.py
│   │   └── recycling.py
│   ├── services/
│   │   ├── green_score_service.py   # GreenScore calculation (1 pt / 100 kg)
│   │   ├── notification_service.py  # In-app notification triggers
│   │   ├── assignment_service.py    # Auto driver assignment (Haversine)
│   │   ├── payment_service.py       # Transaction creation
│   │   └── email_service.py         # SMTP email delivery
│   └── utils/
│       ├── file_upload.py     # Multipart file saving
│       └── pagination.py      # Offset/limit helpers
├── seed_comprehensive.py      # Full demo dataset — 33 Kigali hotels, real GPS
├── seed_blogs.py              # Blog post seeder
├── test_blog_api.py           # Blog API smoke tests
├── requirements.txt
└── .env.example               # Environment variable template
```

---

## Data Models

| Model | Key Fields |
|---|---|
| `User` | id, email, full_name, role (admin / business / recycler / driver / individual), is_verified |
| `Hotel` | hotel_name, address, city, latitude, longitude, green_score, total_waste_listed |
| `Recycler` | company_name, green_score, total_collected, fleet info |
| `Driver` | full_name, vehicle, current_lat, current_lng, is_available |
| `WasteListing` | waste_type, volume, unit, quality, min_bid, reserve_price, status, photos, qr_token |
| `Bid` | amount, note, status (active / accepted / rejected / withdrawn) |
| `Collection` | scheduled_date, status (scheduled → en_route → collected → verified → completed), actual_volume, driver_fee |
| `Transaction` | gross_amount, platform_fee, net_amount, type |
| `GreenScore` | user_id, period (YYYY-MM), waste_diverted, co2_saved, score |
| `Notification` | user_id, title, body, is_read |
| `Message` | sender_id, receiver_id, body, is_read |

---

## API Endpoints

All routes are prefixed with `/api`.

| Group | Prefix | Key Operations |
|---|---|---|
| **Auth** | `/auth` | `POST /login`, `POST /register`, `POST /refresh`, `POST /logout` |
| **Users** | `/users` | `GET /me`, `PATCH /me`, `GET /` (admin), role management |
| **Hotels** | `/hotels` | `GET /me`, `PATCH /me`, `GET /` (public list) |
| **Recyclers** | `/recyclers` | `GET /me`, `PATCH /me`, fleet endpoints |
| **Drivers** | `/drivers` | `GET /me`, `PATCH /me`, GPS update, availability toggle |
| **Listings** | `/listings` | `POST /`, `GET /mine`, `PATCH /{id}`, `DELETE /{id}`, `POST /{id}/photos` |
| **Bids** | `/bids` | `POST /`, `GET /mine`, `POST /{id}/accept`, `POST /{id}/reject`, `POST /{id}/withdraw` |
| **Collections** | `/collections` | `GET /mine`, `POST /{id}/advance`, `POST /{id}/assign-driver`, `GET /{id}/tracking`, `POST /auto-assign` |
| **Transactions** | `/transactions` | `GET /mine`, `GET /` (admin) |
| **Notifications** | `/notifications` | `GET /`, `POST /{id}/read`, `POST /read-all` |
| **Messages** | `/messages` | `GET /conversations`, `GET /{user_id}`, `POST /` |
| **Reviews** | `/reviews` | `POST /`, `GET /user/{user_id}` |
| **Inventory** | `/inventory` | `POST /`, `GET /mine`, `PATCH /{id}`, `DELETE /{id}` |
| **Admin** | `/admin` | Users, listings, transactions, analytics, system settings |
| **Blog** | `/blog` | `GET /`, `GET /{id}`, `POST /` (admin), `PATCH /{id}` (admin) |
| **Support** | `/support` | `POST /`, `GET /mine`, `GET /` (admin), `PATCH /{id}` (admin) |
| **Stats** | `/stats` | Public platform metrics (total waste, collections, users) |
| **Recycling** | `/recycling` | Recycling event records |

Full interactive documentation at https://api.ecotrade-rwanda.com/api/docs

---

## Authentication

The API uses **JWT Bearer tokens** with a two-token pattern:

1. **Login** → `POST /api/auth/login` → returns `access_token` (4 h) + `refresh_token` (60 days)
2. Every authenticated request must include: `Authorization: Bearer <access_token>`
3. **Refresh** → `POST /api/auth/refresh` with the refresh token → new access token
4. **Logout** → `POST /api/auth/logout` → invalidates the refresh token

### Role-based Access

Routes are protected by `require_role(UserRole.xxx)` FastAPI dependencies:

| Role | Access Level |
|---|---|
| `admin` | Full platform access |
| `business` | Own listings, bids, collections, profile |
| `recycler` | Marketplace, bidding, own collections, fleet management |
| `driver` | Assigned collections, GPS update, earnings |
| `individual` | Own listings and impact metrics |

---

## GreenScore System

GreenScore is calculated automatically on every completed collection.

**Formula:**
```python
score = min(100.0, total_kg_or_litres / 100.0)
# 1 point per 100 kg/L collected, capped at 100
```

**Triggered by:** `POST /api/collections/{id}/advance` when status reaches `completed`

**Updated for:**
- **Hotel** — `hotel.green_score` based on `hotel.total_waste_listed`
- **Recycler** — `recycler.green_score` based on `recycler.total_collected`
- Monthly entry also written to `green_scores` table for history

**Score tiers (same across all platforms):**

| Tier | Range |
|---|---|
| Eco Beginner | 0 – 39 |
| Eco Starter | 40 – 59 |
| Eco Champion | 60 – 79 |
| Eco Master | 80 – 100 |

---

## Database

- **Engine**: SQLite (`ecotrade.db` in the backend directory)
- **ORM**: SQLAlchemy 2.0 with declarative base
- **Tables**: Created automatically on server startup via `Base.metadata.create_all()`
- **No migration tool required** for development
- **Seed data**: Run `python seed_comprehensive.py` once — creates 33 Kigali hotel listings with real GPS coordinates, recyclers, drivers, and bids

To reset and re-seed:

```bash
rm ecotrade.db               # delete database
python seed_comprehensive.py  # recreate and re-seed
```

---

## Demo Credentials

After running `seed_comprehensive.py` (password for all: **Password123!**):

| Email | Role |
|---|---|
| admin@ecotrade.rw | Admin |
| hotel@kigali.rw | Hotel / Business |
| recycler@greencycle.rw | Recycler |
| driver@greencycle.rw | Driver |
| individual@example.com | Individual |

---

## Technology Stack

| Component | Technology | Version |
|---|---|---|
| Framework | FastAPI | 0.115+ |
| Language | Python | 3.11+ |
| ORM | SQLAlchemy | 2.0+ |
| Database | SQLite | (auto-created) |
| Validation | Pydantic v2 | 2.9+ |
| Authentication | PyJWT | 2.9+ |
| Password Hashing | bcrypt | 4.2+ |
| Server | Uvicorn | 0.30+ |
| File Uploads | python-multipart | 0.0.12+ |
| Email | Python smtplib (via email_service.py) | built-in |
| Image Processing | Pillow | 11.0+ |
| Settings | pydantic-settings | 2.5+ |

---

## License

MIT License — see the [LICENSE](../LICENSE) file in the repository root for details.
