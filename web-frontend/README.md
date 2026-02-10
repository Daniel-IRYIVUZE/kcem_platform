# KCEM Platform - Web Frontend

## Overview

React + TypeScript frontend for the KCEM (Kigali Circular Economy Marketplace) platform. A fully responsive, multi-dashboard web application for waste-to-resource circular economy marketplace.

## Quick Start

### Installation

```bash
# From the web-frontend folder
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Access

- Development: http://localhost:5173
- Production: https://kcem-platform.netlify.app
- Demo Video: https://youtu.be/your-demo-video-id

## Demo Login Credentials

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Admin | admin@kcem.com | admin123 | /dashboard/admin |
| Business | business@kcem.com | business123 | /dashboard/business |
| Recycler | recycler@kcem.com | recycler123 | /dashboard/recycler |
| Driver | driver@kcem.com | driver123 | /dashboard/driver |
| Individual | user@kcem.com | user123 | /dashboard/individual |

## Project Structure

```
web-frontend/
├── public/
│   ├── images/
│   │   └── kCEM_Logo.png
│   ├── manifest.json
│   ├── robots.txt
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
│   │   ├── Login/LoginPage.tsx
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

### Business Dashboard (7 Pages)
- Overview
- Waste Listings
- Create Listing
- Marketplace
- Financial Dashboard
- Schedule & Pickups
- Reports

### Recycler Dashboard (6 Pages)
- Overview
- Marketplace
- Logistics Management
- Inventory
- Financial Dashboard
- Supplier Network

### Driver Dashboard (6 Pages)
- Today's Schedule
- Assigned Routes
- Collections History
- Earnings Dashboard
- Vehicle & Equipment
- Offline Mode

### Individual Dashboard (6 Pages)
- Overview
- Marketplace
- My Impact
- Orders Management
- Financial Dashboard
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

Live URL: https://kcem-platform.netlify.app

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
- Enhanced modals with creative UI
- Data tables with sorting
- Charts and analytics
- Form validation
- Image placeholders

## License

MIT License - see LICENSE file

## Support

- Email: support@kcem.rw
- Website: https://kcem-platform.netlify.app
- Demo Video: https://youtu.be/

Version: 1.0.0
Status: Production Ready
