# KCEM Platform - Kigali Circular Economy Marketplace

## Project Description

KCEM (Kigali Circular Economy Marketplace) is a digital platform connecting waste generators (hotels, restaurants, businesses) with recyclers, drivers, and individual collectors in Kigali, Rwanda. The platform enables transparent waste-to-resource transactions while promoting environmental sustainability and creating economic opportunities.

### Key Features

- Multi-Role Dashboard System (Admin, Business, Recycler, Driver, Individual)
- Waste Marketplace for recyclable materials (UCO, glass, paper, plastic, metal)
- Green Score Certification and Impact Analytics
- Logistics Management and Route Optimization
- Financial Tracking and Transaction History
- CO2 Savings Calculator

### Technology Stack

- Frontend: React 18+ with TypeScript, Vite, TailwindCSS
- Routing: React Router v6
- Icons: Lucide React
- State Management: React Context API
- Animations: Framer Motion

## Links

- GitHub Repository: https://github.com/Daniel-IRYIVUZE/kcem_platform.git
- Live Demo: https://kcem-platform.netlify.app
- Demo Video: https://youtu.be/your-demo-video-id

## Setup Instructions

### Prerequisites

- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/Daniel-IRYIVUZE/kcem_platform.git
cd kcem_platform/web-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
kcem_platform/
├── LICENSE
├── README.md
└── web-frontend/
    ├── public/
    │   ├── images/
    │   │   └── kCEM_Logo.png
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

Live URL: https://kcem-platform.netlify.app

## License

MIT License - see LICENSE file for details.

## Contact

- Email: support@kcem.rw
- Website: https://kcem-platform.netlify.app
- Demo Video: https://youtu.be/your-demo-video-id
