# EcoTrade Rwanda — Web Frontend

## Overview

React + TypeScript frontend for the EcoTrade Rwanda platform. A fully responsive, multi-dashboard web application for a waste-to-resource circular economy marketplace serving Kigali, Rwanda.

## Quick Start

```bash
# From the web-frontend folder
npm install        # Install dependencies
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Demo Login Credentials

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Admin | admin@ecotrade.rw | admin123 | /dashboard/admin |
| Business | business@ecotrade.rw | business123 | /dashboard/business |
| Recycler | recycler@ecotrade.rw | recycler123 | /dashboard/recycler |
| Driver | driver@ecotrade.rw | driver123 | /dashboard/driver |
| Individual | individual@ecotrade.rw | user123 | /dashboard/individual |

> OTP code (2FA): **123456**

## Technology Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 18+ with TypeScript |
| Build Tool | Vite |
| Styling | TailwindCSS |
| Routing | React Router v6 |
| Icons | Lucide React |
| Animations | Framer Motion |
| Charts | Chart.js (via ChartComponent) |
| State | React Context API + localStorage |

## Project Structure

```
web-frontend/
├── public/
│   ├── manifest.json
│   └── robots.txt
└── src/
    ├── assets/
    │   ├── images/
    │   │   ├── icons/
    │   │   ├── illustrations/
    │   │   └── logos/
    │   └── styles/
    │       └── global.css
    ├── components/
    │   ├── about/
    │   ├── auth/
    │   │   ├── ForgotPasswordModal.tsx
    │   │   ├── LoginForm.tsx
    │   │   ├── SignupWizard.tsx
    │   │   ├── TermsPrivacyModal.tsx
    │   │   └── TwoFactorModal.tsx      # OTP only
    │   ├── blog/
    │   ├── common/
    │   │   ├── Footer/
    │   │   ├── Modal/
    │   │   └── Navbar/
    │   ├── contact/
    │   ├── dashboard/
    │   │   ├── ChartComponent.tsx
    │   │   ├── DataTable.tsx
    │   │   ├── StatCard.tsx
    │   │   ├── Widget.tsx
    │   │   ├── admin/
    │   │   ├── business/
    │   │   ├── driver/
    │   │   ├── individual/
    │   │   └── recycler/
    │   ├── home/
    │   ├── layout/
    │   │   ├── Sidebar.tsx
    │   │   └── TopNav.tsx
    │   ├── marketplace/
    │   └── services/
    ├── context/
    │   └── AuthContext.tsx
    ├── pages/
    │   ├── About/
    │   ├── Blog/
    │   ├── Contact/
    │   ├── Dashboard/
    │   │   ├── AdminDashboard.tsx
    │   │   ├── BusinessDashboard.tsx
    │   │   ├── RecyclerDashboard.tsx
    │   │   ├── DriverPage.tsx
    │   │   └── UserDashboard.tsx
    │   ├── Home/
    │   ├── Login/
    │   ├── Marketplace/
    │   ├── NotFound/
    │   ├── Services/
    │   └── TermsPrivacy/
    ├── types/
    ├── utils/
    │   └── dataStore.ts          # localStorage CRUD + seedDataIfEmpty
    ├── App.tsx
    ├── main.tsx
    └── index.css
```

## Dashboard Pages

### Admin Dashboard (6 sections)
- Platform Overview — live stats from dataStore
- User Management — add/edit/delete/suspend users, export PDF
- Content Moderation
- Financial Oversight
- Analytics & Reports — charts + PDF export
- System Configuration

### Business Dashboard (10 sections)
- Overview, Waste Listings, Marketplace, Financial Dashboard
- Schedule & Pickups, Green Score, Reports (PDF), Transactions, Analytics, Settings

### Recycler Dashboard (9 sections)
- Overview, Marketplace, Logistics, Inventory, Financial Dashboard
- Supplier Network, Purchases, Analytics, Settings

### Driver Dashboard (8 sections)
- Today's Schedule, Assigned Routes, Collections History
- Earnings (PDF statement), Vehicle & Equipment, Offline Mode, Settings

### Individual Dashboard (8 sections)
- Overview, Marketplace, My Impact, Orders, Financial Dashboard
- Listings, Earnings, Settings

## Key Implementation Notes

- **Data layer:** All dashboard data reads from `localStorage` via `dataStore.ts`. `seedDataIfEmpty()` runs on first load populating 12 users, 5 listings, 5 transactions, 3 collections.
- **Auth:** Email + password check against stored users, followed by OTP (code: 123456). No Authenticator app.
- **PDF exports:** All report downloads (analytics, user list, earnings statements, business reports) generate styled HTML and trigger the browser print dialog — no CSV files.
- **Currency:** Rwandan Franc (RWF) throughout.
- **Phone:** +250 780 162 164

## Seeded Data Summary

| Type | Count | Notes |
|------|-------|-------|
| Users | 12 | 5 hotels, 2 recyclers, 3 drivers, 1 individual, 1 admin |
| Waste Listings | 5 | WL001–WL005 (UCO, Glass, Paper) |
| Transactions | 5 | Total completed: RWF 92,500 |
| Collections | 3 | Total earnings: RWF 13,000 |

## Deployment

### Netlify

```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod
```

Live URL: https://ecotrade-rwanda.netlify.app

## Responsive Breakpoints

| Breakpoint | Range |
|------------|-------|
| Mobile | 320px – 639px |
| Tablet | 640px – 1023px |
| Desktop | 1024px+ |

## License

MIT License — see [LICENSE](../LICENSE)

## Support

- Email: contact@ecotrade.rw
- Phone: +250 780 162 164
- Website: https://ecotrade-rwanda.netlify.app


## Project Structure

```
web-frontend/
├── public/
│   ├── images/
│   │   └── EcoTrade.png
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── styles/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Footer/
│   │   │   └── Navbar/
│   │   ├── dashboard/
│   │   │   ├── ChartComponent.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── Widget.tsx
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       └── TopNav.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── BusinessDashboard.tsx
│   │   │   ├── RecyclerDashboard.tsx
│   │   │   ├── DriverPage.tsx
│   │   │   └── UserDashboard.tsx
│   │   ├── Home/HomePage.tsx
│   │   ├── Login/terms-privacyPage.tsx
│   │   ├── Register/RegisterPage.tsx
│   │   ├── About/AboutPage.tsx
│   │   ├── Blog/BlogPage.tsx
│   │   ├── Contact/ContactPage.tsx
│   │   ├── Marketplace/MarketplacePage.tsx
│   │   ├── Services/ServicesPage.tsx
│   │   ├── TermsPrivacy/TermsPrivacy.tsx
│   │   └── Updates/UpdatesPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

## Technology Stack

- React 18+ with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router v6 for routing
- Lucide React for icons
- Framer Motion for animations
- Context API for state management

## Dashboard Features

### Admin Dashboard (6 Pages)
- Platform Overview
- User Management
- Content Moderation
- Financial Oversight
- Analytics & Reports
- System Configuration

### Business Dashboard (10 Pages)
- Overview
- Waste Listings
- Marketplace
- Financial Dashboard
- Schedule & Pickups
- cyan Score
- Reports
- Transactions
- Analytics
- Settings

### Recycler Dashboard (9 Pages)
- Overview
- Marketplace
- Logistics Management
- Inventory
- Financial Dashboard
- Supplier Network
- Purchases
- Analytics
- Settings

### Driver Dashboard (8 Pages)
- Today's Schedule
- Assigned Routes
- Collections History
- Earnings Dashboard
- Vehicle & Equipment
- Offline Mode
- Settings

### Individual Dashboard (8 Pages)
- Overview
- Marketplace
- My Impact
- Orders Management
- Financial Dashboard
- Listings
- Earnings
- Settings

## Development Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Run ESLint
```

## Deployment

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
npm run build
netlify deploy --prod
```

Live URL: https://ecotrade-rwanda.netlify.app

## Responsive Design

All components are mobile-first and responsive:
- Mobile: 320px - 639px
- Tablet: 640px - 1023px
- Desktop: 1024px+

Tested on iPhone SE, iPad, and desktop screens.

## Features

- Role-based authentication
- Protected routes
- Responsive design (320px - 1920px+)
- Enhanced modals with configurable overlays
- Data tables with sorting
- Charts and analytics
- Form validation
- Material-specific imagery per listing type
- CSV exports and filter actions

## License

MIT License - see LICENSE file

## Support

- Email: danieliryivuze4@gmail.com
- Website: https://ecotrade-rwanda.netlify.app
- Demo Video: link
