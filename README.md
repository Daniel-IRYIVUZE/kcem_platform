# EcoTrade Rwanda Platform

EcoTrade Rwanda is a digital B2B circular economy marketplace that connects waste generators (hotels, restaurants, and businesses) with recyclers, drivers, and individual collectors in Kigali, Rwanda. The platform enables transparent waste-to-resource transactions, promotes environmental sustainability, and creates economic opportunities.

The platform consists of three codebases:

- Web Frontend — a React and TypeScript single-page application
- Mobile Application — a Flutter app for Android, iOS, and Windows
- Backend API — a FastAPI REST API server (currently in development)

GitHub: https://github.com/Daniel-IRYIVUZE/EcoTrade_Rwanda.git
Live Demo: https://ecotrade-rwanda.netlify.app

---

## Table of Contents

- [Platform Overview](#platform-overview)
- [Repository Structure](#repository-structure)
- [Frontend — Quick Start](#frontend--quick-start)
- [Mobile — Quick Start](#mobile--quick-start)
- [Backend — Quick Start](#backend--quick-start)
- [Demo Login Credentials](#demo-login-credentials)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Deployment](#deployment)
- [Contact](#contact)
- [License](#license)

---

## Platform Overview

EcoTrade Rwanda addresses the waste management challenge in Kigali by providing a structured digital marketplace where:

- Businesses list recyclable waste materials (used cooking oil, glass, paper, plastic)
- Recyclers browse listings and submit bids
- Drivers are assigned collection routes and track their earnings
- Administrators oversee platform activity, users, and financial reporting
- Individual users participate in community waste collection initiatives

The platform tracks environmental impact metrics including CO2 savings, water saved, and total waste diverted from landfills.

---

## Repository Structure

```
EcoTrade_Rwanda/
├── README.md              # This file — combined platform overview
├── LICENSE
├── frontend/              # React + TypeScript web application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md          # Frontend-specific setup guide
├── mobile/                # Flutter mobile and desktop application
│   ├── lib/
│   ├── assets/
│   ├── pubspec.yaml
│   └── README.md          # Mobile-specific setup guide
└── backend/               # FastAPI Python backend (in development)
    └── README.md          # Backend-specific setup guide
```

---

## Frontend — Quick Start

The web frontend runs on Node.js. Full instructions are in [frontend/README.md](./frontend/README.md).

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Steps

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5174

4. Build for production:

```bash
npm run build
```

---

## Mobile — Quick Start

The mobile application runs on Flutter. Full instructions are in [mobile/README.md](./mobile/README.md).

### Prerequisites

- Flutter SDK 3.2.0 or higher
- Dart SDK 3.2.0 or higher (included with Flutter)
- Android Studio (for Android) or Xcode (for iOS)
- A connected device, emulator, or Windows desktop

### Steps

1. Navigate to the mobile directory:

```bash
cd mobile
```

2. Verify your Flutter setup:

```bash
flutter doctor
```

3. Install dependencies:

```bash
flutter pub get
```

4. List available devices:

```bash
flutter devices
```

5. Run on your chosen device:

```bash
flutter run -d <device-id>
```

Common device targets:

```bash
flutter run -d android     # Android emulator or device
flutter run -d windows     # Windows desktop
flutter run -d chrome      # Web browser
```

---

## Backend — Quick Start

The backend API is planned with FastAPI. Full instructions are in [backend/README.md](./backend/README.md).

### Prerequisites

- Python 3.10 or higher
- pip
- PostgreSQL (or SQLite for local development)

### Steps

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux or macOS
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your database and secret key settings
```

5. Apply database migrations:

```bash
alembic upgrade head
```

6. Start the development server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000
API documentation will be at http://localhost:8000/docs

---

## Demo Login Credentials

All demo accounts use OTP code 123456 for two-factor authentication.

| Role       | Email                    | Password     | Dashboard Path           |
|------------|--------------------------|--------------|--------------------------|
| Admin      | admin@ecotrade.rw        | admin123     | /dashboard/admin         |
| Business   | business@ecotrade.rw     | business123  | /dashboard/business      |
| Recycler   | recycler@ecotrade.rw     | recycler123  | /dashboard/recycler      |
| Driver     | driver@ecotrade.rw       | driver123    | /dashboard/driver        |
| Individual | marieclaire@gmail.com    | user123      | /dashboard/individual    |

---

## Key Features

### Multi-Role Dashboards
- Admin — platform oversight, user management, analytics, PDF reports
- Business — waste listings, pickup scheduling, Green Score, financials
- Recycler — marketplace browsing, inventory, supplier network
- Driver — route assignments, daily schedule, earnings statements
- Individual — impact metrics, waste listings, community participation

### Waste Marketplace
- Listings for used cooking oil, glass, paper, plastic, and mixed waste
- Bid submission and acceptance workflow
- Status tracking from open through assigned, collected, and completed

### Environmental Impact
- Green Score certification per business
- CO2 savings, water saved, and waste diverted tracking
- Monthly sustainability reports with PDF export

### Security
- Email and password authentication
- Two-factor authentication with OTP
- Role-based access control on all routes
- JWT token authentication for API requests

### Offline Support
- Web frontend works fully offline using localStorage
- Mobile app works offline using Hive local storage
- Data syncs to the backend when connectivity is restored

---

## Technology Stack

| Layer             | Technology                    |
|-------------------|-------------------------------|
| Web Framework     | React 19 with TypeScript      |
| Web Build Tool    | Vite 7                        |
| Web Styling       | TailwindCSS 4                 |
| Web State         | React Context API             |
| Mobile Framework  | Flutter 3.2+                  |
| Mobile Language   | Dart 3.2+                     |
| Mobile State      | Riverpod                      |
| Mobile Storage    | Hive + SQLite                 |
| Backend Framework | FastAPI (Python)              |
| Backend Database  | SQLite                        |
| Backend Auth      | JWT + bcrypt                  |

---

## Deployment

### Web Frontend

The frontend is deployed on Netlify:

```bash
cd frontend
npm run build
netlify deploy --prod
```

Live URL: https://ecotrade-rwanda.netlify.app

### Mobile Application

Build a release APK for Android:

```bash
cd mobile
flutter build apk --release
```

Build for Windows:

```bash
flutter build windows --release
```

### Backend API

Deploy the FastAPI server using a WSGI-compatible host (Railway, Render, or a VPS with Gunicorn behind Nginx):

```bash
gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## Contact

- Email: contact@ecotrade.rw
- Phone: +250 780 162 164
- Website: https://ecotrade-rwanda.netlify.app
- GitHub: https://github.com/Daniel-IRYIVUZE/EcoTrade_Rwanda.git

---

## License

MIT License. See the [LICENSE](./LICENSE) file for details.

