# EcoTrade Rwanda — Web Frontend

Production-ready React + TypeScript web application for the EcoTrade Rwanda circular-economy waste marketplace. Provides five role-specific dashboards (Admin, Business, Recycler, Driver, Individual), connects to the FastAPI backend for live data, supports offline fallback via localStorage, and features a fully responsive UI with dark mode.

**Live Demo:** https://ecotrade-rwanda.netlify.app
**Backend API:** https://api.ecotrade-rwanda.com/api/docs

---

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Demo Credentials](#demo-credentials)
- [Project Structure](#project-structure)
- [Dashboard Features](#dashboard-features)
- [Technology Stack](#technology-stack)
- [Deployment](#deployment)
- [Known Issues](#known-issues)
- [License](#license)

---

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

App → `http://localhost:5174`

> To use a local backend instead of the deployed one, set `VITE_API_URL=http://localhost:8000/api` in `frontend/.env`.

---

## Prerequisites

- Node.js **18.0** or higher
- npm **9.0** or higher

```bash
node --version   # 18.0+
npm --version    # 9.0+
```

---

## Installation

```bash
# Clone the repository
git clone https://github.com/Daniel-IRYIVUZE/EcoTrade_Rwanda.git
cd EcoTrade_Rwanda/frontend

# Install dependencies
npm install
```

---

## Running the Application

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR at `http://localhost:5174` |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint code check |
| `npm run test` | Run Vitest unit tests |

---

## Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=https://api.ecotrade-rwanda.com/api
VITE_APP_NAME=EcoTrade Rwanda
VITE_BRAND_COLOR=06b6d4
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `https://api.ecotrade-rwanda.com/api` | Backend API base URL |
| `VITE_APP_NAME` | `EcoTrade Rwanda` | App display name |
| `VITE_BRAND_COLOR` | `06b6d4` | Brand colour (hex, no #) |

---

## Demo Credentials

Run `python seed_comprehensive.py` in the backend first (password for all: **Password123!**).

| Role | Email | Password | Dashboard |
|---|---|---|---|
| Admin | admin@ecotrade.rw | Password123! | `/dashboard/admin` |
| Business | hotel@kigali.rw | Password123! | `/dashboard/business` |
| Recycler | recycler@greencycle.rw | Password123! | `/dashboard/recycler` |
| Driver | driver@greencycle.rw | Password123! | `/dashboard/driver` |
| Individual | individual@example.com | Password123! | `/dashboard/individual` |

---

## Project Structure

```
frontend/
├── public/
│   ├── images/               # SVG illustrations and logos
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── assets/               # Local images, icons, global CSS
│   ├── components/
│   │   ├── auth/             # Login, signup, OTP, forgot password
│   │   ├── blog/             # Blog listing and post detail
│   │   ├── common/           # Navbar, Footer, Modal, Toast, ScrollToTop
│   │   ├── contact/          # Contact page
│   │   ├── dashboard/
│   │   │   ├── admin/        # 14 admin dashboard components
│   │   │   │   ├── AdminOverview.tsx
│   │   │   │   ├── AdminAnalytics.tsx
│   │   │   │   ├── AdminUserManagement.tsx
│   │   │   │   ├── AdminListings.tsx
│   │   │   │   ├── AdminTransactions.tsx
│   │   │   │   ├── AdminGreenScores.tsx
│   │   │   │   ├── AdminBlogManagement.tsx
│   │   │   │   ├── AdminBlogEditor.tsx
│   │   │   │   ├── AdminAuditLogs.tsx
│   │   │   │   ├── AdminReports.tsx
│   │   │   │   ├── AdminSupportTickets.tsx
│   │   │   │   ├── AdminRouteMonitor.tsx
│   │   │   │   ├── AdminSettings.tsx
│   │   │   │   └── AdminVerificationQueue.tsx
│   │   │   ├── business/     # Hotel / HORECA dashboard
│   │   │   │   ├── BusinessGreenScore.tsx
│   │   │   │   └── ...
│   │   │   ├── recycler/     # Recycler dashboard with Leaflet map
│   │   │   │   ├── _shared.tsx         # computeGreenScore utility
│   │   │   │   ├── RecyclerOverview.tsx
│   │   │   │   ├── RecyclerMarketplace.tsx
│   │   │   │   ├── RecyclerGreenImpact.tsx
│   │   │   │   └── ...
│   │   │   ├── driver/       # Driver schedule, earnings, history
│   │   │   └── individual/   # Personal impact metrics
│   │   ├── home/             # Homepage sections
│   │   ├── layout/           # Sidebar, TopNav, DashboardLayout
│   │   ├── marketplace/      # Public marketplace listing cards + map
│   │   └── services/         # Services page
│   ├── context/
│   │   ├── AuthContext.tsx        # Auth state, login/logout, role enrichment
│   │   ├── ThemeContext.tsx       # Dark / light mode toggle
│   │   └── NotificationContext.tsx
│   ├── hooks/
│   │   └── useApi.ts              # Unified data-access hook
│   ├── pages/                     # Route-level page components
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Services.tsx
│   │   ├── Blog.tsx / BlogDetail.tsx
│   │   ├── Contact.tsx
│   │   ├── Marketplace.tsx
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx          # Picks correct sub-dashboard by role
│   │   ├── TermsPrivacy.tsx
│   │   └── NotFound.tsx
│   ├── services/
│   │   └── api.ts                 # Centralised API client (all endpoints)
│   ├── types/                     # TypeScript interfaces for all entities
│   ├── utils/
│   │   ├── dataStore.ts           # localStorage CRUD + seed data
│   │   ├── dataManagement.ts      # DataManager query class
│   │   ├── apiSync.ts             # Backend sync layer for offline mode
│   │   └── toast.ts               # Toast notification helpers
│   ├── App.tsx                    # Router setup, protected routes
│   └── main.tsx                   # React entry point
├── netlify.toml                   # Netlify build + SPA redirect config
├── vite.config.ts                 # Vite 6 build config
├── tsconfig.json
└── package.json
```

---

## Dashboard Features

### Admin Dashboard
- **Overview** — platform stats: total users, listings, revenue, CO₂ saved
- **User Management** — add, edit, suspend, delete users across all roles; verification queue
- **Listings** — view and moderate all waste listings platform-wide
- **Transactions** — financial oversight with revenue breakdown by waste type
- **Analytics** — charts for user growth, collection trends, GreenScore distribution
- **GreenScore Leaderboard** — ranked list of top hotels and recyclers
- **Blog Management** — CRUD for blog posts with draft / published moderation
- **Audit Logs** — timestamped activity log for all platform events
- **Reports** — PDF export for platform-wide statistics
- **Support Tickets** — manage and respond to user support requests
- **Route Monitor** — live view of all active driver routes
- **System Settings** — platform fee, SMTP config, feature flags

### Business / Hotel Dashboard
- **My Listings** — list-mode view with image left, details right; status pill; eye icon → full detail sheet; edit / delete (open and draft only; protected for assigned, collected, completed)
- **Bids Received** — accept or reject incoming recycler bids; bid history
- **Collections / Pickups** — scheduled and completed pickup tabs; live driver tracking map; call driver button
- **GreenScore** — circular progress (0–100), tier label (Eco Beginner → Eco Master), impact breakdown (waste diverted, CO₂ saved, collections, listings), downloadable certificate at score 100
- **Profile** — hotel details, logo, address, contact info

### Recycler Dashboard
- **Overview** — live stats: total bids, collections, revenue, GreenScore
- **Marketplace** — browse and bid on all open waste listings; **interactive Leaflet map** with hotel clustering by business name, colored pins by waste type, cyan distance lines with km labels
- **My Bids** — submitted bids with accept / withdraw actions
- **Collections** — pickups assigned to this recycler; assign driver; status tracking
- **Green Impact** — GreenScore history, CO₂ saved, waste types collected
- **Fleet** — manage vehicles and drivers in the recycler's organisation
- **Inventory** — stock management for collected and processed materials
- **Payment History** — transaction records

### Driver Dashboard
- **Schedule** — daily assigned collections with address, waste type, volume
- **Collection History** — all past collections with earnings
- **Earnings** — period filter (today / this week / this month); total earnings; PDF export
- **Profile** — vehicle info, rating, availability toggle

### Individual Dashboard
- **Environmental Impact** — personal CO₂ saved, waste diverted, collections count
- **My Listings** — personal waste listings
- **Order Tracking** — collection status for submitted listings

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 19.2 |
| Language | TypeScript | 5.9 |
| Build Tool | Vite | 6.3 |
| Styling | TailwindCSS | 4.1 |
| Routing | React Router | 7.13 |
| Animations | Framer Motion | 12.33 |
| Charts | Recharts | 3.7 |
| Charts (extra) | Chart.js | 4.5 |
| Maps | Leaflet.js + react-leaflet | 1.9 / 5.0 |
| Map clusters | leaflet.markercluster | 1.5 |
| UI Library | Ant Design | 6.2 |
| QR codes | qrcode | 1.5 |
| Icons | lucide-react | latest |
| State | React Context API | built-in |
| HTTP | fetch API + custom retry logic | built-in |
| Offline storage | localStorage | built-in |
| Testing | Vitest | 4.1 |
| Linting | ESLint | 9 |
| Deployment | Netlify | — |

---

## GreenScore (Frontend)

The frontend **always prefers the API value** from `/hotels/me` or `/recyclers/me`.

### Formula (fallback when API unavailable)
```
score = min(100, Math.round(totalWasteKg / 100))
```
Same formula as the backend: 1 point per 100 kg/L, capped at 100.

### Tiers

| Tier | Score |
|---|---|
| Eco Beginner | 0 – 39 |
| Eco Starter | 40 – 59 |
| Eco Champion | 60 – 79 |
| Eco Master | 80 – 100 |

A **downloadable text certificate** is offered when the score reaches 100.

---

## Deployment

### Netlify (current production)

```bash
npm run build        # outputs to dist/
netlify deploy --prod --dir=dist
```

`netlify.toml` (already in the repo) handles:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect: `/* → /index.html` (status 200)
- Build-time env: `VITE_API_URL`

Live URL: https://ecotrade-rwanda.netlify.app

### Vercel (alternative)

```bash
npm install -g vercel
vercel --prod
```

### Any Static Host

Upload the `dist/` folder and configure your host to serve `index.html` for all routes (SPA mode).

---

## Known Issues

- **Private / incognito browsing** — localStorage is cleared when the session ends; offline fallback data will be lost on next visit.
- **Real-time push** — WebSocket notifications are not yet implemented; the page must be refreshed to see bids or status changes made by other users.

---

## License

MIT License — see [LICENSE](../LICENSE) in the repository root for details.
