# EcoTrade Rwanda — Web Frontend

EcoTrade Rwanda is a production-ready React and TypeScript circular economy marketplace platform. It connects waste generators such as hotels and restaurants with recyclers and drivers in Kigali, Rwanda. The frontend provides multi-role dashboards, connects to the FastAPI backend for live data, falls back to localStorage in offline mode, and features a fully responsive UI with dark mode support.

Live Demo: https://ecotrade-rwanda.netlify.app


## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Demo Login Credentials](#demo-login-credentials)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Dashboard Features](#dashboard-features)
- [Deployment](#deployment)
- [Known Issues](#known-issues)
- [License](#license)

---

## Introduction

The EcoTrade Rwanda web frontend is a multi-role dashboard platform built with React 19 and TypeScript. It supports five user roles: Admin, Business, Recycler, Driver, and Individual. The app connects to the FastAPI backend at `http://localhost:8000/api` when available and falls back to localStorage-seeded data when the backend is unreachable, making it usable both with and without a running server.

---

## Prerequisites

Before running the frontend, ensure the following are installed on your machine:

- Node.js version 18.0.0 or higher
- npm version 9.0.0 or higher
- Git

To verify your Node.js version:

```bash
node --version
npm --version
```

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Daniel-IRYIVUZE/EcoTrade_Rwanda.git
cd EcoTrade_Rwanda/frontend
```

2. Install project dependencies:

```bash
npm install
```

---

## Running the Application

### Development Server

Start the local development server with hot module replacement:

```bash
npm run dev
```

The application will be available at http://localhost:5174

### Production Build

Compile and bundle the application for production:

```bash
npm run build
```

The output will be placed in the `dist/` directory.

### Preview Production Build Locally

After building, preview the production bundle locally before deploying:

```bash
npm run preview
```

### Lint the Code

Check the codebase for linting errors:

```bash
npm run lint
```

---

## Demo Login Credentials

Use the following credentials to log in and explore each role's dashboard.

| Role | Email | Password | Dashboard Path |
|------------|--------------------------------|--------------|---------------------------|
| Admin | admin@ecotrade.rw | Password123! | /dashboard/admin |
| Business | hotel@kigali.rw | Password123! | /dashboard/business |
| Recycler | recycler@greencycle.rw | Password123! | /dashboard/recycler |
| Driver | driver@greencycle.rw | Password123! | /dashboard/driver |
| Individual | individual@example.com | Password123! | /dashboard/individual |

> These credentials work against the live backend. Run `python seed_comprehensive.py` in the backend directory first.

---

## Project Structure

```
frontend/
├── public/
│   ├── images/           # SVG illustrations and logos
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── assets/           # Local images, icons, and global styles
│   ├── components/
│   │   ├── about/        # About page sections
│   │   ├── auth/         # Login, signup, OTP, forgot password
│   │   ├── blog/         # Blog listing and detail components
│   │   ├── common/       # Shared: Navbar, Footer, Modal, Toast
│   │   ├── contact/      # Contact page components
│   │   ├── dashboard/    # Role-specific dashboard sections
│   │   │   ├── admin/
│   │   │   ├── business/
│   │   │   ├── recycler/
│   │   │   ├── driver/
│   │   │   └── individual/
│   │   ├── home/         # Homepage sections
│   │   ├── layout/       # Sidebar, TopNav, DashboardLayout
│   │   ├── marketplace/  # Marketplace listing and map
│   │   └── services/     # Services page components
│   ├── context/
│   │   ├── AuthContext.tsx        # Authentication state and actions
│   │   ├── ThemeContext.tsx       # Dark/light mode
│   │   └── NotificationContext.tsx
│   ├── hooks/
│   │   └── useApi.ts              # Data access hook
│   ├── pages/                     # Top-level page components
│   ├── services/
│   │   └── api.ts                 # API client configuration
│   ├── types/                     # TypeScript interfaces
│   ├── utils/
│   │   ├── dataStore.ts           # localStorage CRUD and seed data
│   │   ├── dataManagement.ts      # DataManager query class
│   │   ├── apiSync.ts             # Backend sync layer
│   │   └── toast.ts               # Toast notification helpers
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## Technology Stack

| Layer | Technology | Version |
|---------------|-------------------|----------|
| Framework | React | 19.2.0 |
| Language | TypeScript | 5.0 |
| Build Tool | Vite | 7.2.5 |
| Styling | TailwindCSS | 4.1 |
| Routing | React Router | 7.13 |
| Animations | Framer Motion | Latest |
| Charts | Chart.js | Latest |
| Maps | Leaflet.js + react-leaflet | Latest |
| State | React Context API | Built-in |
| Storage | localStorage (offline fallback) | Built-in |

---

## Dashboard Features

### Admin Dashboard
- Platform overview with live stats and user growth
- User management: add, edit, suspend, and remove users
- Financial oversight: revenue, fees, and payouts
- Analytics and PDF report exports
- System configuration and settings

### Business Dashboard
- Waste listing management with status tracking
- Marketplace to browse recyclers and drivers
- Financial dashboard with revenue by waste type
- Scheduling and driver assignment calendar
- Green Score sustainability metrics

### Recycler Dashboard
- Marketplace to browse and bid on available waste listings
- **Interactive Leaflet map** with hotel clustering by business name, colored pins per waste type, cyan distance lines with km labels, and `maxZoom: 13` so clusters are visible before zooming
- Marketplace list toggles between card view and map view
- Distance and waste-type filter chips
- Inventory management and supplier network
- Financial dashboard with payment history

### Driver Dashboard
- Daily schedule and route assignments
- Collection history with timestamps
- Earnings statements with PDF export
- Offline mode for areas with low connectivity

### Individual Dashboard
- Personal environmental impact metrics
- Waste listing creation and management
- Order tracking and payment history

---

## Deployment

### Netlify

1. Install the Netlify CLI:

```bash
npm install -g netlify-cli
```

2. Log in to your Netlify account:

```bash
netlify login
```

3. Build and deploy:

```bash
npm run build
netlify deploy --prod
```

Live URL: https://ecotrade-rwanda.netlify.app

### Vercel

```bash
npm install -g vercel
vercel --prod
```

---

## Known Issues

- localStorage data is cleared in private/incognito browsing mode upon exit.
- Real-time push features (WebSocket) are not yet implemented; the page must be refreshed to see new bids from other users.

---

## License

MIT License. See the LICENSE file in the root of the repository for details.
