# KCEM Platform - Kigali Circular Economy Marketplace

A comprehensive digital platform for managing circular economy initiatives in Kigali, Rwanda. This platform connects hotels, restaurants, recycling companies, and drivers to facilitate the trading of recyclable materials while promoting environmental sustainability.

## Project Overview

KCEM (Kigali Circular Economy Marketplace) is designed to:
- **Facilitate Material Trading**: Enable hotels and restaurants to list waste materials for recycling
- **Connect Stakeholders**: Link generators, recyclers, and logistics providers in the circular economy
- **Track Environmental Impact**: Monitor CO2 savings and waste diversion metrics
- **Streamline Operations**: Provide role-based dashboards for different user types
- **Ensure Quality Control**: Implement verification systems for users and materials

## Table of Contents

- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Architecture](#project-architecture)
- [Routes & Navigation](#routes--navigation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Project Structure

```
kcem_platform/
├── web-frontend/                 # React + Vite frontend application
│   ├── src/
│   │   ├── pages/               # Page components organized by route
│   │   │   ├── Home/            # Landing page
│   │   │   ├── About/           # About the platform
│   │   │   ├── Services/        # Services information
│   │   │   ├── Blog/            # Blog and news
│   │   │   ├── Contact/         # Contact page
│   │   │   ├── Updates/         # Platform updates
│   │   │   ├── Login/           # Authentication pages
│   │   │   ├── Register/        # Registration
│   │   │   ├── TermsPrivacy/    # Terms and privacy policy
│   │   │   ├── Marketplace/     # Main marketplace
│   │   │   ├── admin/           # Admin dashboard
│   │   │   └── Dashboard/       # User role-based dashboards
│   │   │       ├── hotel.tsx    # Hotel/Restaurant dashboard
│   │   │       ├── recycler.tsx # Recycling company dashboard
│   │   │       ├── driver.tsx   # Driver/Logistics dashboard
│   │   │       ├── user.tsx     # Regular user dashboard
│   │   │       └── settings.tsx # Settings for all roles
│   │   ├── components/          # Reusable components
│   │   │   ├── common/          # Common components (Navbar, Footer)
│   │   │   └── Layout/          # Layout wrappers (DashboardLayout)
│   │   ├── assets/              # Static assets (images, styles)
│   │   ├── App.tsx              # Main app routing
│   │   └── main.tsx             # Entry point
│   ├── package.json             # Dependencies
│   ├── vite.config.ts           # Vite configuration
│   ├── tsconfig.json            # TypeScript configuration
│   └── README.md                # Frontend documentation
└── LICENSE                       # Project license
```

## 🛠 Technology Stack

### Frontend
- **Framework**: React 19.2
- **Build Tool**: Vite (with Rolldown)
- **UI Library**: Ant Design 5.x
- **Icons**: 
  - Ant Design Icons
  - Lucide React (for additional icons)
- **Styling**: 
  - Tailwind CSS 4.x
  - CSS Modules
- **Animations**: Framer Motion
- **Routing**: React Router DOM 7.x
- **Maps**: React Leaflet with Leaflet
- **Charts**: Chart.js with React-ChartJS-2
- **Language**: TypeScript 5.9+

## Features

### Public Features
- **Landing Page**: Showcase platform benefits and call-to-action
- **About Section**: Information about KCEM and mission
- **Services Page**: Detailed service offerings
- **Blog Section**: News, tips, and updates
- **Contact Form**: Direct communication with support
- **Marketplace**: Browse available materials and trading opportunities
- **Terms & Privacy**: Legal documentation

### Authentication
- **User Registration**: Self-service account creation
- **Login System**: Secure authentication
- **Password Recovery**: Forgot password functionality
- **Role-based Access**: Different experiences for different user types

### Role-Based Dashboards

#### Hotel/Restaurant Dashboard
- View and manage waste listings
- Track revenue from waste sales
- Monitor waste diversion metrics
- Access financial reports
- Manage marketplace listings

#### Recycler Dashboard
- View collection opportunities
- Manage logistics and schedules
- Track material collections
- Monitor financial transactions
- Access advanced analytics

#### Driver Dashboard
- View active collection tasks
- Track daily schedule
- Monitor earnings
- Upload collection evidence
- View route information

#### Regular User Dashboard
- Browse marketplace listings
- Make offers on materials
- Track transaction history
- View personal statistics
- Manage saved searches

#### Admin Dashboard
- Platform overview and analytics
- User management
- Content moderation
- System health monitoring
- Activity timeline
- Configuration management

### Marketplace
- **Advanced Filtering**: Filter by material type, distance, price
- **Smart Sorting**: Sort by newest, price, distance, rating
- **Listing Management**: Create and manage material listings
- **Offer System**: Make and receive offers on materials
- **Saved Searches**: Save frequently used searches
- **Map View**: Interactive map showing nearby materials
- **Rating System**: Community-driven quality ratings

## Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Daniel-IRYIVUZE/kcem_platform.git
cd kcem_platform
```

2. **Navigate to frontend directory**
```bash
cd web-frontend
```

3. **Install dependencies**
```bash
npm install
```

4. **Install additional packages (if needed)**
```bash
npm install antd @ant-design/icons
```

## Configuration

### Environment Variables
Create a `.env` file in the `web-frontend` directory:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=KCEM Platform
VITE_APP_VERSION=1.0.0
```

### Vite Configuration
The `vite.config.ts` is pre-configured with:
- React plugin support
- TypeScript support
- Tailwind CSS integration
- Optimized build output

## Usage

### Development Server
```bash
npm run dev
```
Starts the development server at `http://localhost:5173`

### Build for Production
```bash
npm run build
```
Creates optimized production build in `dist/` directory

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally

### Lint Code
```bash
npm run lint
```
Runs ESLint to check code quality

## Routes & Navigation

### Public Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Landing page |
| `/about` | AboutPage | About the platform |
| `/services` | ServicesPage | Services information |
| `/blog` | BlogPage | Blog and updates |
| `/contact` | ContactPage | Contact form |
| `/updates` | UpdatesPage | Platform updates |
| `/marketplace` | MarketplacePage | Material marketplace |
| `/terms-privacy` | TermsPrivacyPage | Legal documentation |

### Authentication Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | LoginPage | User login |
| `/register` | RegisterPage | User registration |
| `/forgot-password` | ForgotPassword | Password recovery |

### Dashboard Routes (Protected)

#### Admin Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | AdminDashboard | Admin panel |
| `/admin/settings` | SettingsPage | Admin settings |

#### Hotel Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard/hotel` | HotelDashboard | Hotel dashboard |
| `/dashboard/hotel/settings` | SettingsPage | Hotel settings |

#### Recycler Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard/recycler` | RecyclerDashboard | Recycler dashboard |
| `/dashboard/recycler/settings` | SettingsPage | Recycler settings |

#### Driver Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard/driver` | DriverDashboard | Driver dashboard |
| `/dashboard/driver/settings` | SettingsPage | Driver settings |

#### User Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard/user` | UserDashboard | User dashboard |
| `/dashboard/user/settings` | SettingsPage | User settings |

## 🏗 Project Architecture

### Component Hierarchy
```
App (Routing)
├── Public Pages
│   ├── HomePage
│   ├── AboutPage
│   ├── ServicesPage
│   └── ... (other public pages)
├── Auth Pages
│   ├── LoginPage
│   ├── RegisterPage
│   └── ForgotPassword
└── Dashboard Pages
    ├── DashboardLayout (wrapper)
    │   ├── HotelDashboard
    │   ├── RecyclerDashboard
    │   ├── DriverDashboard
    │   ├── UserDashboard
    │   ├── AdminDashboard
    │   └── SettingsPage
    └── Navbar, Footer (global)
```

### Key Components

#### DashboardLayout
Provides consistent layout for all dashboard pages with:
- Sidebar navigation
- Header with user info
- Role-based menu items
- Quick stats widget

#### Navbar & Footer
Global navigation components used on public pages

### State Management
Currently uses local component state with React hooks. Future upgrades may include:
- Context API for global state
- Redux or Zustand for complex state management

## Development

### Code Structure
- **TypeScript**: Strict mode enabled for type safety
- **Component Pattern**: Functional components with hooks
- **Naming Conventions**:
  - Components: PascalCase
  - Files: PascalCase (for components), camelCase (for utilities)
  - Constants: UPPER_SNAKE_CASE
  - Interfaces/Types: PascalCase with prefix `I` for interfaces

### Adding New Pages
1. Create new directory under `src/pages/[PageName]/`
2. Create component file `[PageName].tsx`
3. Export default component
4. Add route to `App.tsx`
5. Update navigation if needed

### Adding New Routes
1. Import component in `App.tsx`
2. Add `<Route>` element in appropriate section
3. Update type definitions if needed
4. Test route navigation

### Code Quality
- Run linter: `npm run lint`
- Fix linter issues: `npm run lint -- --fix`
- Build to check for TypeScript errors: `npm run build`

## Deployment

### Build Optimization
The current build generates chunks larger than 500KB. To optimize:

1. **Enable Code Splitting**:
```typescript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'antd': ['antd'],
          'vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
}
```

2. **Use Dynamic Imports**:
```typescript
const AdminDashboard = lazy(() => import('./pages/admin'));
```

### Production Checklist
- [ ] Build production bundle: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Verify all routes work
- [ ] Check console for errors
- [ ] Test responsive design
- [ ] Verify API endpoints
- [ ] Set environment variables
- [ ] Deploy to hosting platform

## Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit: `git commit -m "Description"`
3. Push to remote: `git push origin feature/feature-name`
4. Create Pull Request

### Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Test changes locally before pushing
- Update documentation as needed
- Follow project code style

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Solo Development Engineer 

**Daniel Iryivuze**

## Support

For support or questions:
- Email: d.iryivuze@alustudent.com
- Issues: GitHub Issues

## Version History

### v1.0.0 (Current)
- Initial platform launch
- Complete marketplace functionality
- Role-based dashboards
- Admin panel
- User authentication
- Material trading system

## Future Roadmap

- [ ] Backend API integration
- [ ] Mobile app development
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Real-time notifications
- [ ] IoT sensor integration
- [ ] Supply chain optimization

## Acknowledgments

- Built with React and Vite
- UI components from Ant Design
- Icons from Ant Design Icons and Lucide React
- Styling with Tailwind CSS
- Animations with Framer Motion