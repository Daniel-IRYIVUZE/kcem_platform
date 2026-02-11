# EcoTrade  Platform

## Project Description

EcoTrade  is a digital platform connecting waste generators (hotels, restaurants, businesses) with recyclers, drivers, and individual collectors in Kigali, Rwanda. The platform enables transparent waste-to-resource transactions while promoting environmental sustainability and creating economic opportunities.

### Key Features

- Multi-Role Dashboard System (Admin, Business, Recycler, Driver, Individual)
- Waste Marketplace for recyclable materials (UCO, glass, paper, plastic, metal)
- Green Score Certification and Impact Analytics
- Logistics Management and Route Optimization
- Financial Tracking and Transaction History
- Role-based Settings pages with editable profiles
- Actionable dashboard controls (filters, exports, status toggles)
- CO2 Savings Calculator

### Technology Stack

- Frontend: React 18+ with TypeScript, Vite, TailwindCSS
- Routing: React Router v6
- Icons: Lucide React
- State Management: React Context API
- Animations: Framer Motion

## Platform Screenshots

### Public Pages

#### Landing Page
![EcoTrade Homepage](./web-frontend/src/assets/screeenshots/image-1.png)

#### Login & Registration
![Login Page](./web-frontend/src/assets/screeenshots/image-2.png)
![Register Page](./web-frontend/src/assets/screeenshots/image-3.png)

### Role-Based Dashboards

#### Admin Dashboard
![Admin Dashboard](./web-frontend/src/assets/screeenshots/image-4.png)
*Platform statistics, user management, and system configuration*

#### Business Dashboard
![Business Dashboard](./web-frontend/src/assets/screeenshots/image-5.png)
*Waste listings, marketplace, and revenue analytics*

#### Recycler Dashboard
![Recycler Dashboard](./web-frontend/src/assets/screeenshots/image-6.png)
*Material procurement, inventory, and supplier network*

#### Driver Dashboard
![Driver Dashboard](./web-frontend/src/assets/screeenshots/image-7.png)
*Route management, collections, and earnings tracking*

#### Individual Dashboard
![Individual Dashboard](./web-frontend/src/assets/screeenshots/image-8.png)
*Personal listings, marketplace, and environmental impact*

### Features

#### Marketplace Listings
![Marketplace](./web-frontend/src/assets/screeenshots/image-9.png)
*Material-specific imagery for UCO, Glass, Paper, Plastic listings*

#### Settings & Profile Management
![Settings Modal](./web-frontend/src/assets/screeenshots/image-10.png)
*Editable profile with notification preferences and role-specific options*
## Links

- GitHub Repository: https://github.com/Daniel-IRYIVUZE/EcoTrade_platform.git
- Live Demo: https://ecotrade-rwanda.netlify.app
- Demo Video: https://youtu.be/

## Setup Instructions

### Prerequisites

- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/Daniel-IRYIVUZE/EcoTrade_platform.git
cd EcoTrade_platform/web-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
EcoTrade_platform/
├── LICENSE
├── README.md
└── web-frontend/
    ├── public/
    │   ├── images/
    │   │   ├── EcoTrade.png
    │   │   └── EcoTrade1.png
    ├── src/
    │   ├── assets/
    │   │   ├── images/
    │   │   └── styles/
    │   ├── components/
    │   │   ├── common/
    │   │   ├── dashboard/
    │   │   └── layout/
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── pages/
    │   │   ├── Dashboard/
    │   │   ├── Home/
    │   │   ├── Login/
    │   │   ├── Register/
    │   │   ├── About/
    │   │   ├── Blog/
    │   │   ├── Contact/
    │   │   ├── Marketplace/
    │   │   ├── Services/
    │   │   ├── TermsPrivacy/
    │   │   └── Updates/
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

## Deployment

### Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd web-frontend
npm run build
netlify deploy --prod
```

Live URL: https://ecotrade-rwanda.netlify.app

## License

MIT License - see LICENSE file for details.

## Contact

- Email: support@EcoTrade.rw
- Website: https://ecotrade-rwanda.netlify.app
- Demo Video: https://youtu.be/
