# EcoTrade Rwanda

**A circular-economy waste marketplace connecting HORECA businesses, recyclers, and drivers across Rwanda.**

EcoTrade Rwanda digitises waste collection — hotels and restaurants list their recyclable waste, licensed recyclers bid to collect it, and drivers are routed to each pickup. Every completed collection earns GreenScore points, closing the loop between environmental impact and business incentive.

---

## Important Links

| Resource | URL |
|---|---|
| **Live Web App** | https://ecotrade-rwanda.netlify.app |
| **Backend API** | https://api.ecotrade-rwanda.com/api |
| **API Docs (Swagger)** | https://api.ecotrade-rwanda.com/api/docs |
| **GitHub Repository** | https://github.com/Daniel-IRYIVUZE/EcoTrade_Rwanda.git |
| **Project Report** | _[Insert report link here]_ |
| **Demo Video** | _[Insert demo video link here]_ |
| **Presentation Slides** | _[Insert slides link here]_ |

---

## Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Demo Credentials](#demo-credentials)
- [User Roles](#user-roles)
- [Key Features](#key-features)
- [GreenScore System](#greenscore-system)
- [Technology Stack](#technology-stack)
- [API Overview](#api-overview)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contact](#contact)
- [License](#license)

---

## Project Overview

EcoTrade Rwanda addresses the waste management challenge in Kigali by providing a structured digital marketplace where:

- **HORECA businesses** (Hotels, Restaurants, Cafes) list recyclable waste — used cooking oil, glass, paper, plastic, metal, e-waste, textiles, and organic material
- **Recyclers** browse all open listings on an interactive map and submit bids through an auction system with minimum bids, reserve prices, and auto-accept thresholds
- **Drivers** are assigned to collection routes, scan QR codes on arrival to verify each pickup, and track daily earnings
- **Administrators** oversee platform activity — users, listings, bids, transactions, blog posts, support tickets, and system configuration
- **Individual users** participate in community waste listings and track their personal environmental impact

The platform is built on three independent but connected codebases (backend API, web frontend, Flutter mobile) all sharing a single JWT-based authentication system.

---

## System Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                         EcoTrade Rwanda                           │
│                                                                   │
│  ┌─────────────────┐   ┌─────────────────┐   ┌───────────────┐  │
│  │  Web Frontend   │   │  Mobile (Flutter)│   │  Mobile Build │  │
│  │  React + TS     │   │  Chrome / Web    │   │  Android APK  │  │
│  │  Netlify        │   │  (flutter run)   │   │  Windows EXE  │  │
│  └────────┬────────┘   └────────┬─────────┘   └───────┬───────┘  │
│           │                    │                      │           │
│           └────────────────────┴──────────────────────┘           │
│                                │  HTTPS + JWT                     │
│                     ┌──────────▼──────────┐                       │
│                     │   FastAPI Backend    │                       │
│                     │   Python 3.11+       │                       │
│                     │   SQLAlchemy ORM     │                       │
│                     │   SQLite database    │                       │
│                     │   18 route modules   │                       │
│                     └─────────────────────┘                       │
└───────────────────────────────────────────────────────────────────┘
```

---

## Repository Structure

```
EcoTrade_Rwanda/
├── README.md                  # This file — platform overview and all links
├── LICENSE                    # MIT License
├── .gitignore
├── alembic/                   # Database migration scripts
├── alembic.ini                # Alembic configuration
├── run_tests.sh               # Test runner script
├── backend/                   # FastAPI REST API (Python)
│   ├── app/
│   │   ├── main.py            # App factory + router registration
│   │   ├── config.py          # Environment config (pydantic-settings)
│   │   ├── database.py        # SQLAlchemy engine + auto table creation
│   │   ├── auth/              # JWT, bcrypt, role dependencies
│   │   ├── models/            # 17 ORM models
│   │   ├── schemas/           # 17 Pydantic v2 schemas
│   │   ├── crud/              # 13 CRUD modules
│   │   ├── routes/            # 18 API route files
│   │   └── services/          # green_score, notifications, payments, email
│   ├── seed_comprehensive.py  # Full Kigali demo data with real GPS
│   ├── seed_blogs.py          # Blog post seeder
│   ├── requirements.txt
│   └── README.md              # Backend setup guide
├── frontend/                  # React + TypeScript web application
│   ├── src/
│   │   ├── components/        # 150+ React components (5 dashboards)
│   │   ├── context/           # Auth, Theme, Notification contexts
│   │   ├── services/api.ts    # Centralised API client
│   │   ├── pages/             # Route-level page components
│   │   └── utils/             # Data store, offline sync, toast helpers
│   ├── netlify.toml           # Netlify build + redirect config
│   ├── package.json
│   └── README.md              # Frontend setup guide
└── mobile/                    # Flutter mobile / desktop / web app
    ├── lib/
    │   ├── main.dart           # App entry point (Hive + Riverpod init)
    │   ├── core/               # Models, providers, services, router, theme
    │   └── features/           # hotel/, recycler/, driver/, auth/, shared/
    ├── assets/                 # Images, icons, Lottie animations
    ├── pubspec.yaml
    └── README.md               # Mobile setup guide
```

---

## Quick Start

### Prerequisites

| Tool | Minimum Version |
|---|---|
| Python | 3.11 |
| Node.js | 18.0 |
| npm | 9.0 |
| Flutter SDK | 3.2 |
| Dart SDK | 3.2 (bundled with Flutter) |

---

### 1 — Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS / Linux

# Install dependencies
pip install --upgrade pip setuptools wheel
pip install --prefer-binary -r requirements.txt

# Seed demo data (hotels, listings, bids, drivers, recyclers at real Kigali GPS)
python seed_comprehensive.py
python seed_blogs.py           # optional: adds blog posts

# Start the development server
python -m uvicorn app.main:app --reload --port 8000
```

API → `http://localhost:8000`
Swagger UI → `http://localhost:8000/api/docs`
ReDoc → `http://localhost:8000/redoc`

> The SQLite database (`ecotrade.db`) is created automatically from ORM models on first run — no migration step needed.

---

### 2 — Web Frontend

```bash
cd frontend
npm install
npm run dev
```

Web app → `http://localhost:5174`

> The frontend points to the deployed API (`https://api.ecotrade-rwanda.com/api`) by default.
> To use your local backend, set `VITE_API_URL=http://localhost:8000/api` in `frontend/.env`.

---

### 3 — Mobile App

```bash
cd mobile
flutter pub get

# Run on your preferred target
flutter run -d chrome          # Web browser
flutter run -d android         # Android emulator or device
flutter run -d windows         # Windows desktop
```

> The mobile app points to the deployed backend by default. To use local backend, update `_baseUrl` in `mobile/lib/core/services/api_service.dart`.

---

## Demo Credentials

All demo accounts use the same password after running `seed_comprehensive.py`.

| Role | Email | Password | Notes |
|---|---|---|---|
| **Admin** | admin@ecotrade.rw | Password123! | Full platform control |
| **Business / Hotel** | hotel@kigali.rw | Password123! | List waste, manage bids |
| **Recycler** | recycler@greencycle.rw | Password123! | Browse marketplace, bid |
| **Driver** | driver@greencycle.rw | Password123! | Route map, scan QR codes |
| **Individual** | individual@example.com | Password123! | Personal listings |

---

## User Roles

| Role | What They Do |
|---|---|
| **HORECA Business** | Create waste listings, view and accept bids, track pickups, earn GreenScore |
| **Recycler** | Browse listings on map, place bids, manage drivers and fleet, track inventory |
| **Driver** | Follow assigned pickup routes, scan QR codes to verify collections, view earnings |
| **Admin** | Manage all users, listings, transactions, blog, support tickets, and settings |
| **Individual** | Create personal waste listings, view environmental impact |

---

## Key Features

### Waste Marketplace
- Listings for: **UCO** (Used Cooking Oil), Glass, Paper/Cardboard, Plastic, Metal, Electronic, Textile, Organic, Mixed
- Configurable auction: minimum bid, reserve price, auto-accept-above threshold, auction duration
- Recycler marketplace with interactive map — colored pins per waste type, hotel clustering, distance lines
- Bid workflow: submit → accept/reject → assign driver → collect → complete

### Collection Lifecycle
```
Open → Assigned → En Route → Collected → Verified → Completed
```
- QR code generated per listing; driver scans on arrival to confirm pickup
- Live GPS tracking — hotel sees driver position and ETA in real time
- Auto driver assignment using Haversine (nearest available driver)
- Driver fee: 10% of bid amount (minimum RWF 500 per collection)

### My Listings (Hotel — List Mode)
- Image on the left (84 px), full details on the right
- Status pill, min-bid price, waste type, volume, quality, pickup date, bids count
- Eye icon → full detail sheet (photo strip, all fields, bids list)
- Edit / Delete — only available for **Open** and **Draft** listings
- Assigned, Collected, and Completed listings are **protected from deletion**

### GreenScore System _(see section below)_

### PDF Reports
- Driver collection history and earnings exported as A4 PDF with EcoTrade logo
- All dates and times displayed in **Central African Time (CAT = UTC+2)**

### Offline Support
- **Mobile**: Hive local cache (24-hour TTL) + offline mutation queue; auto-syncs on reconnect
- **Web**: localStorage fallback for read data; mutations queued and replayed on reconnect

### Multi-Platform
- Web (Netlify SPA), Android APK, Windows desktop, Flutter web (Chrome)

---

## GreenScore System

GreenScore rewards HORECA businesses and recyclers for every completed waste collection.

### Formula

```
score = min(100, total_kg_or_litres_collected / 100)
```

**Every 100 kg / L of waste collected = 1 GreenScore point, capped at 100.**

### How It Works
1. Driver marks collection as **Completed** via the advance-status API
2. Backend automatically:
   - Adds the collected volume to the hotel's `total_waste_listed`
   - Recomputes `hotel.green_score = min(100, total_waste_listed / 100)`
   - Adds the same volume to the recycler's `total_collected`
   - Recomputes `recycler.green_score = min(100, total_collected / 100)`
3. A monthly entry is also written to the `green_scores` table for history tracking

### Tiers (consistent across mobile and web)

| Tier | Score Range | Waste Required |
|---|---|---|
| Eco Beginner | 0 – 39 | < 3,900 kg/L |
| Eco Starter | 40 – 59 | 4,000 – 5,900 kg/L |
| Eco Champion | 60 – 79 | 6,000 – 7,900 kg/L |
| Eco Master | 80 – 100 | ≥ 8,000 kg/L |

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Backend framework** | FastAPI | 0.115+ |
| **Backend language** | Python | 3.11+ |
| **ORM** | SQLAlchemy | 2.0+ |
| **Database** | SQLite (auto-created) | — |
| **Validation** | Pydantic v2 | 2.9+ |
| **Authentication** | JWT (PyJWT) + bcrypt | — |
| **Web framework** | React | 19.2 |
| **Web language** | TypeScript | 5.9 |
| **Web build tool** | Vite | 6.3 |
| **Web styling** | TailwindCSS | 4.1 |
| **Web routing** | React Router | 7.13 |
| **Web maps** | Leaflet.js + react-leaflet | 1.9 / 5.0 |
| **Web charts** | Recharts + Chart.js | 3.7 / 4.5 |
| **Web UI library** | Ant Design | 6.2 |
| **Web animations** | Framer Motion | 12.33 |
| **Mobile framework** | Flutter | 3.2+ |
| **Mobile language** | Dart | 3.2+ |
| **Mobile state** | flutter_riverpod | 2.5 |
| **Mobile routing** | go_router | 13.2 |
| **Mobile maps** | flutter_map + OpenStreetMap | 6.1 |
| **Mobile offline** | Hive | 2.2 |
| **Mobile QR** | mobile_scanner + qr_flutter | 5.2 / 4.1 |
| **Mobile PDF** | pdf + printing | 3.10 / 5.13 |
| **Deployment (web)** | Netlify | — |

---

## API Overview

All 18 route groups are served under `/api`:

| Group | Prefix | Key Operations |
|---|---|---|
| Auth | `/auth` | Login, register, refresh token, logout |
| Users | `/users` | Profile CRUD, role management |
| Hotels | `/hotels` | Business profiles, stats, logo upload |
| Recyclers | `/recyclers` | Company profiles, fleet info |
| Drivers | `/drivers` | Profiles, GPS updates, vehicle management |
| Listings | `/listings` | Waste listing CRUD, photo upload, QR tokens |
| Bids | `/bids` | Place, accept, reject, withdraw, increase bids |
| Collections | `/collections` | Pickup scheduling, status advance, QR verify, tracking |
| Transactions | `/transactions` | Payment records and history |
| Notifications | `/notifications` | In-app notification feed, mark read |
| Messages | `/messages` | Direct messaging between users |
| Reviews | `/reviews` | User ratings and feedback |
| Inventory | `/inventory` | Recycler waste stock management |
| Admin | `/admin` | Platform-wide administration |
| Blog | `/blog` | Blog CRUD with admin moderation |
| Support | `/support` | Support ticket system |
| Stats | `/stats` | Public platform metrics |
| Recycling | `/recycling` | Recycling event records |

Full interactive documentation → https://api.ecotrade-rwanda.com/api/docs

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=sqlite:///./ecotrade.db
SECRET_KEY=<random-secret-at-least-32-chars>
ACCESS_TOKEN_EXPIRE_MINUTES=240
REFRESH_TOKEN_EXPIRE_DAYS=60
PLATFORM_FEE_PERCENT=5.0
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:5174","https://ecotrade-rwanda.netlify.app"]
SMTP_HOST=<your-smtp-host>
SMTP_PORT=587
SMTP_USER=<sender-email>
SMTP_PASSWORD=<smtp-password>
EMAIL_FROM=no-reply@ecotrade.rw
EMAIL_FROM_NAME=EcoTrade Rwanda
UPLOAD_DIR=./uploads
```

All variables have sensible defaults — the server starts with no `.env` file.

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://api.ecotrade-rwanda.com/api
VITE_APP_NAME=EcoTrade Rwanda
VITE_BRAND_COLOR=06b6d4
```

### Mobile

API URL is configured in `mobile/lib/core/services/api_service.dart` (`_baseUrl`).

---

## Deployment

### Frontend — Netlify

```bash
cd frontend
npm run build        # outputs to dist/
netlify deploy --prod --dir=dist
```

`netlify.toml` handles the SPA redirect rule (`/* → /index.html`) and build config automatically.

Live URL: https://ecotrade-rwanda.netlify.app

### Backend — VPS / Server

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
# Production: run behind Nginx with SSL (Let's Encrypt)
```

Deployed API: https://api.ecotrade-rwanda.com

### Mobile — Release Builds

```bash
# Android APK
cd mobile && flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk

# Windows executable
flutter build windows --release
# Output: build/windows/x64/runner/Release/

# Web (deploy build/web/ to any static host)
flutter build web --release
```

---

## Contact

- **Website**: https://ecotrade-rwanda.netlify.app
- **API**: https://api.ecotrade-rwanda.com
- **GitHub**: https://github.com/Daniel-IRYIVUZE/EcoTrade_Rwanda.git
- **Email**: contact@ecotrade.rw
- **Phone**: +250 780 162 164
- **Location**: Kigali, Rwanda

---

## License

MIT License — see [LICENSE](./LICENSE) for details.
