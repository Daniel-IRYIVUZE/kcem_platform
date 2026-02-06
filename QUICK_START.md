# KCEM Platform - Quick Start Guide

Get up and running with the KCEM Platform in 5 minutes!

## ⚡ Quick Setup

```bash
# 1. Navigate to frontend directory
cd web-frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📱 Testing All Routes

### Public Pages
- Homepage: `http://localhost:5173/`
- About: `http://localhost:5173/about`
- Services: `http://localhost:5173/services`
- Blog: `http://localhost:5173/blog`
- Contact: `http://localhost:5173/contact`
- Updates: `http://localhost:5173/updates`
- Marketplace: `http://localhost:5173/marketplace`
- Terms & Privacy: `http://localhost:5173/terms-privacy`

### Authentication
- Login: `http://localhost:5173/login`
- Register: `http://localhost:5173/register`
- Forgot Password: `http://localhost:5173/forgot-password`

### Dashboard Routes
- **Admin**: `http://localhost:5173/admin`
- **Hotel**: `http://localhost:5173/dashboard/hotel`
- **Recycler**: `http://localhost:5173/dashboard/recycler`
- **Driver**: `http://localhost:5173/dashboard/driver`
- **User**: `http://localhost:5173/dashboard/user`

### Settings (for any role)
- General Settings: `http://localhost:5173/dashboard/settings`

---

## 📝 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint code checker |

---

## 🎯 Key Files to Know

### Main Application
- **App.tsx** - All routes defined here
- **main.tsx** - Application entry point

### Pages (in `/src/pages/`)
- `Home/HomePage.tsx` - Landing page
- `Dashboard/hotel.tsx` - Hotel dashboard
- `Dashboard/recycler.tsx` - Recycler dashboard
- `Dashboard/driver.tsx` - Driver dashboard
- `Dashboard/user.tsx` - User dashboard
- `admin/index.tsx` - Admin dashboard
- `Dashboard/settings.tsx` - Settings page

### Components (in `/src/components/`)
- `Layout/DashboardLayout.tsx` - Dashboard wrapper
- `common/Navbar/Navbar.tsx` - Navigation bar
- `common/Footer/Footer.tsx` - Footer

---

## 🔧 Modifying Routes

To add a new route:

1. **Create page component** in `/src/pages/`
2. **Import in App.tsx**:
```typescript
import YourPage from './pages/YourFolder/YourPage';
```

3. **Add route**:
```typescript
<Route path="/your-path" element={<YourPage />} />
```

---

## 🎨 Styling

### Using Ant Design Components
```typescript
import { Button, Card, Form } from 'antd';

<Button type="primary">Click Me</Button>
```

### Using Tailwind CSS
```typescript
<div className="bg-blue-500 p-4 rounded-lg">
  Styled content
</div>
```

### Using Global Styles
Styles in `src/index.css` and `src/assets/styles/global.css`

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173 and restart
npm run dev -- --port 5174
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Run full build to see all errors
npm run build
```

### Styles Not Loading
- Check Tailwind CSS is installed: `npm install tailwindcss`
- Verify `tailwind.config.js` exists
- Clear browser cache (Ctrl+Shift+Delete)

---

## 📚 Common Tasks

### Add a Dashboard Page
1. Create file in `src/pages/Dashboard/newpage.tsx`
2. Import DashboardLayout:
```typescript
import DashboardLayout from '../../components/Layout/DashboardLayout';

export default function NewPage() {
  return (
    <DashboardLayout role="user">
      {/* Content here */}
    </DashboardLayout>
  );
}
```
3. Add route in App.tsx

### Add a Public Page
1. Create file in `src/pages/YourPage/YourPage.tsx`
2. Import Navbar and Footer:
```typescript
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';

export default function YourPage() {
  return (
    <>
      <Navbar />
      {/* Content here */}
      <Footer />
    </>
  );
}
```
3. Add route in App.tsx

### Customize Dashboard Layout
Edit `src/components/Layout/DashboardLayout.tsx`
- Change sidebar width: Modify `<Sider width={250}>`
- Change theme: Modify `theme="light"`
- Modify menu items: Edit `roleMenus` object

---

## 🔑 Important Concepts

### Role-Based Dashboards
Each role gets a customized experience:
```typescript
<DashboardLayout role="hotel">
  {/* Hotel-specific content */}
</DashboardLayout>
```

Available roles:
- `admin`
- `hotel`
- `recycler`
- `driver`
- `user`

### Component Organization
- **Page** components: Full page layouts
- **Layout** components: Wrappers for consistent design
- **Common** components: Reused across pages
- **Assets**: Images and styles

---

## 📖 Full Documentation

- Main README: `README.md`
- Frontend README: `web-frontend/README.md`
- Codebase Verification: `CODEBASE_VERIFICATION.md`

---

## ✨ Tips & Best Practices

1. **Use TypeScript Types** - Catch errors early
2. **Keep Components Small** - Easier to maintain
3. **Use Ant Design Components** - Consistent UI
4. **Comment Complex Logic** - Help future developers
5. **Test Routes Locally** - Before committing
6. **Check Build Output** - `npm run build` before pushing

---

## 🚀 Next Steps

1. Start dev server: `npm run dev`
2. Open browser to `http://localhost:5173`
3. Navigate to different pages
4. Test different dashboard roles
5. Check console for any errors
6. Modify a page and watch hot reload work
7. Build for production: `npm run build`

---

## 🆘 Need Help?

1. Check the full README files
2. Review `CODEBASE_VERIFICATION.md` for status
3. Look at similar existing pages for patterns
4. Check TypeScript types for API contracts
5. Review component prop documentation

---

**Happy coding! 🎉**
