# KCEM Platform - Web Frontend

The frontend application for the Kigali Circular Economy Marketplace platform. Built with React, TypeScript, and Vite for optimal performance.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0+
- npm 9.0+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 📁 Directory Structure

```
src/
├── pages/                          # Page components
│   ├── Home/
│   │   └── HomePage.tsx           # Landing page
│   ├── About/
│   │   └── AboutPage.tsx          # About the platform
│   ├── Services/
│   │   └── ServicesPage.tsx       # Services information
│   ├── Blog/
│   │   └── BlogPage.tsx           # Blog posts and news
│   ├── Contact/
│   │   └── ContactPage.tsx        # Contact form
│   ├── Updates/
│   │   └── UpdatesPage.tsx        # Platform updates
│   ├── Login/
│   │   ├── LoginPage.tsx          # User login
│   │   └── ForgotPassword.tsx     # Password recovery
│   ├── Register/
│   │   └── RegisterPage.tsx       # User registration
│   ├── TermsPrivacy/
│   │   └── TermsPrivacy.tsx       # Legal documentation
│   ├── Marketplace/
│   │   └── MarketplacePage.tsx    # Material marketplace
│   ├── Dashboard/                 # User dashboards (protected)
│   │   ├── hotel.tsx              # Hotel/Restaurant dashboard
│   │   ├── recycler.tsx           # Recycling company dashboard
│   │   ├── driver.tsx             # Driver/Logistics dashboard
│   │   ├── user.tsx               # Regular user dashboard
│   │   └── settings.tsx           # Settings for all user types
│   └── admin/
│       └── index.tsx              # Admin dashboard
├── components/
│   ├── common/
│   │   ├── Navbar/
│   │   │   └── Navbar.tsx         # Navigation bar
│   │   └── Footer/
│   │       └── Footer.tsx         # Footer component
│   └── Layout/
│       └── DashboardLayout.tsx    # Dashboard layout wrapper
├── assets/
│   ├── images/
│   │   ├── icons/                 # Icon assets
│   │   ├── illustrations/         # Illustration assets
│   │   └── logos/                 # Logo assets
│   └── styles/
│       └── global.css             # Global styles
├── App.tsx                        # Main app with routing
├── App.css                        # App styles
├── main.tsx                       # Vite entry point
└── index.css                      # Global index styles
```

## 🔗 Routes Overview

### Public Routes
```
/                    → HomePage
/about               → AboutPage
/services            → ServicesPage
/blog                → BlogPage
/contact             → ContactPage
/updates             → UpdatesPage
/marketplace         → MarketplacePage
/terms-privacy       → TermsPrivacyPage
/login               → LoginPage
/register            → RegisterPage
/forgot-password     → ForgotPassword
```

### Protected Dashboard Routes
```
/admin                      → AdminDashboard
/admin/settings             → Admin Settings

/dashboard/hotel            → Hotel Dashboard
/dashboard/hotel/settings   → Hotel Settings

/dashboard/recycler         → Recycler Dashboard
/dashboard/recycler/settings → Recycler Settings

/dashboard/driver           → Driver Dashboard
/dashboard/driver/settings  → Driver Settings

/dashboard/user             → User Dashboard
/dashboard/user/settings    → User Settings

/dashboard/settings         → Global Settings
```

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| Vite | 7.2.5 | Build tool & dev server |
| TypeScript | ~5.9.3 | Type safety |
| React Router DOM | 7.13.0 | Client-side routing |
| Ant Design | Latest | UI component library |
| Ant Design Icons | Latest | Icon library |
| Tailwind CSS | 4.1.18 | Utility-first CSS |
| Lucide React | 0.563.0 | Additional icons |
| Framer Motion | 12.33.0 | Animation library |
| React LeafLet | 5.0.0 | Map integration |
| React ChartJS-2 | 5.3.1 | Data visualization |
| Chart.js | 4.5.1 | Charting library |
| ESLint | 9.39.1 | Code quality |

## 📦 Available Scripts

### Development
```bash
npm run dev
```
Starts the Vite development server with hot module replacement (HMR)

### Production Build
```bash
npm run build
```
Creates optimized production build using TypeScript compiler and Vite

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing before deployment

### Linting
```bash
npm run lint
```
Runs ESLint to check code quality and style issues

## 🎨 Styling System

### Tailwind CSS Integration
- Utility-first CSS framework
- Configured in `tailwind.config.js`
- Vite plugin integration via `@tailwindcss/vite`

### CSS Modules
- Component-specific styles
- File naming convention: `Component.module.css`

### Global Styles
- `index.css` - Base styles and resets
- `App.css` - App-level styles
- `assets/styles/global.css` - Theme variables

## 🎯 Component Patterns

### Page Components
```typescript
import DashboardLayout from '../../components/Layout/DashboardLayout';

interface Props {
  role?: string;
}

const PageName: React.FC<Props> = ({ role = 'user' }) => {
  const [state, setState] = useState<Type>(initialValue);
  
  return (
    <DashboardLayout role={role}>
      {/* Page content */}
    </DashboardLayout>
  );
};

export default PageName;
```

### Dashboard Layout Wrapper
All dashboard pages use the `DashboardLayout` component which provides:
- Sidebar navigation
- Header with user information
- Role-based menu items
- Quick stats widget
- Responsive design

## 🔐 Authentication & Authorization

### User Roles
1. **Admin** - Platform administration
2. **Hotel/Restaurant** - Material generator
3. **Recycler** - Material processor
4. **Driver** - Logistics provider
5. **User** - General user/buyer

### Role-Based Access
Dashboard layouts are wrapped with role information passed as props:
```typescript
<DashboardLayout role="hotel">
  {/* Hotel-specific content */}
</DashboardLayout>
```

## 🎨 UI Components from Ant Design

Key components used throughout the application:

| Component | Usage |
|-----------|-------|
| `Layout` | Page structure |
| `Menu` | Navigation |
| `Card` | Content containers |
| `Table` | Data display |
| `Form` | Input forms |
| `Button` | Actions |
| `Select` | Dropdowns |
| `Modal` | Dialogs |
| `Tabs` | Tab navigation |
| `Timeline` | Activity timeline |
| `Steps` | Process steps |
| `Statistic` | KPI display |
| `Progress` | Progress indicators |
| `Avatar` | User avatars |
| `Tag` | Labels and categories |
| `Badge` | Status badges |
| `Rate` | Rating component |

## 📊 Data Visualization

### Charts
- `Chart.js` with React wrapper for data visualization
- Line, bar, pie, and doughnut charts
- Used in dashboard analytics sections

### Maps
- `React Leaflet` for interactive maps
- OpenStreetMap integration
- Used in marketplace for location display

## 🚀 Build Optimization

### Current Bundle Size
- Main JS: ~579 KB (gzipped: ~162 KB)
- CSS: ~70 KB (gzipped: ~11 KB)

### Recommended Optimizations

1. **Code Splitting**
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'antd': ['antd'],
        'vendor': ['react', 'react-dom']
      }
    }
  }
}
```

2. **Lazy Loading Routes**
```typescript
const AdminDashboard = lazy(() => import('./pages/admin'));
```

3. **Image Optimization**
- Use WebP format
- Optimize image dimensions
- Use responsive images

## 🧪 Testing Setup

Currently no testing framework configured. To add:

```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Create vitest.config.ts
```

## 🔄 Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=KCEM Platform
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 📱 Responsive Design

All components are built with responsive design in mind:
- Mobile-first approach
- Breakpoints: xs, sm, md, lg, xl
- Flexbox and Grid layouts
- Responsive image handling

## 🐛 Common Issues & Solutions

### Issue: Build fails with "Module not found"
**Solution**: Run `npm install` to ensure all dependencies are installed

### Issue: TypeScript errors
**Solution**: Run `npm run build` to check all files, then fix errors

### Issue: Styles not applying
**Solution**: Ensure Tailwind CSS build process completes and check specificity

### Issue: Routes not working
**Solution**: Verify route paths in `App.tsx` match component imports

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Ant Design Documentation](https://ant.design)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` to check code quality
4. Run `npm run build` to verify build
5. Commit with meaningful messages
6. Push and create a pull request

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues and questions, please open a GitHub issue or contact the development team.