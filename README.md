# UX Infotech - React Frontend with Admin Dashboard

A modern, fully-responsive React implementation of the UX Infotech website with a complete admin management system.

## 🚀 Features

### Frontend
- ✅ Responsive design using Tailwind CSS
- ✅ Smooth scrolling navigation
- ✅ Image carousel/slider with auto-play
- ✅ Service cards with hover effects
- ✅ Portfolio/Project showcase with filtering
- ✅ Team member profiles
- ✅ Contact form with validation
- ✅ Newsletter subscription
- ✅ Social media links
- ✅ Back-to-top button
- ✅ Mobile-optimized navigation

### Admin Dashboard
- ✅ Secure login system (Demo credentials provided)
- ✅ Dashboard with statistics
- ✅ Project management (CRUD operations)
- ✅ Service management
- ✅ Team member management
- ✅ Inquiry management system
- ✅ Settings page for site configuration
- ✅ Responsive sidebar navigation
- ✅ Toast notifications for user feedback

## 📋 Project Structure

```
uxinfotech-react/
├── public/
│   └── images/              # Website images
├── src/
│   ├── components/
│   │   ├── Header.jsx       # Main navigation header
│   │   ├── Footer.jsx       # Footer with contact info
│   │   ├── BannerSection.jsx # Hero carousel
│   │   ├── AboutSection.jsx  # About company
│   │   ├── ServicesSection.jsx # Services grid
│   │   ├── PortfolioSection.jsx # Projects showcase
│   │   ├── TeamSection.jsx   # Team members
│   │   ├── ContactSection.jsx # Contact form
│   │   └── BackToTop.jsx    # Scroll to top button
│   ├── pages/
│   │   ├── Home.jsx         # Main home page
│   │   └── NotFound.jsx     # 404 page
│   ├── admin/
│   │   ├── AdminApp.jsx     # Admin routing
│   │   ├── main.jsx         # Admin entry point
│   │   ├── components/
│   │   │   └── AdminLayout.jsx # Admin layout
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── ProjectsManager.jsx
│   │       ├── ServicesManager.jsx
│   │       ├── TeamManager.jsx
│   │       ├── InquiriesManager.jsx
│   │       ├── Settings.jsx
│   │       └── Login.jsx
│   ├── styles/
│   │   └── index.css        # Global styles
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Frontend entry point
├── index.html               # Frontend HTML
├── admin.html               # Admin HTML
├── vite.config.js           # Vite config (frontend)
├── vite.admin.config.js     # Vite config (admin)
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Dependencies
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation Steps

1. **Extract the zip file**
   ```bash
   unzip uxinfotech-react.zip
   cd uxinfotech-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the frontend development server**
   ```bash
   npm run dev
   ```
   - Frontend will be available at `http://localhost:3000`

4. **Run the admin dashboard (in a new terminal)**
   ```bash
   npm run admin-dev
   ```
   - Admin dashboard will be available at `http://localhost:3001`

## 🔐 Admin Dashboard Login

**Demo Credentials:**
- Email: `admin@uxinfotech.com`
- Password: `admin123`

### Admin Dashboard Features

#### Dashboard
- Overview statistics
- Recent inquiries
- Quick action buttons

#### Projects Management
- Add, edit, delete projects
- Filter by category
- Track project status

#### Services Management
- Manage service offerings
- Add service descriptions
- Use emoji icons

#### Team Management
- Add/edit team member profiles
- Manage roles and bios
- Social media links

#### Inquiries Management
- View customer inquiries
- Track inquiry status (New, Pending, Replied)
- Send replies to customers
- Delete inquiries

#### Settings
- Site name and description
- Contact information
- Social media URLs
- Email configuration

## 🎨 Customization

### Change Colors
Edit `src/styles/index.css` to customize colors:
```css
:root {
  --primary: #FF6B35;      /* Orange */
  --secondary: #004E89;    /* Blue */
  --dark: #1a1a1a;
  --light: #f5f5f5;
}
```

### Update Company Information
Edit the following components:
- `src/components/Footer.jsx` - Address, phone, email
- `src/components/AboutSection.jsx` - Company description
- `src/admin/pages/Settings.jsx` - Site settings

### Add/Remove Images
Place images in `public/images/` and reference them in components.

## 📦 Building for Production

### Frontend Build
```bash
npm run build
```
Output: `dist/` folder

### Admin Build
```bash
npm run admin-build
```
Output: `dist-admin/` folder

## 🛠️ Technologies Used

- **Frontend Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form
- **Icons**: React Icons
- **Notifications**: React Toastify
- **Build Tool**: Vite
- **Server**: Node.js

## 📝 Development Notes

### Adding New Pages
1. Create a new component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation in `src/components/Header.jsx`

### Adding Admin Features
1. Create new component in `src/admin/pages/`
2. Add route in `src/admin/AdminApp.jsx`
3. Update sidebar in `src/admin/components/AdminLayout.jsx`

### Data Persistence
Currently, the app uses local state. For production:
1. Replace state management with Redux/Context API
2. Connect to backend API
3. Add database integration
4. Implement proper authentication

## 🔌 API Integration

The admin dashboard is ready for API integration. Replace:

```javascript
// Current: Local state management
setProjects([...projects, newProject])

// With: API calls
const response = await fetch('/api/projects', {
  method: 'POST',
  body: JSON.stringify(newProject)
})
```

### Backend Integration Points
- `/api/projects` - Projects CRUD
- `/api/services` - Services CRUD
- `/api/team` - Team members CRUD
- `/api/inquiries` - Inquiry management
- `/api/settings` - Site settings
- `/api/auth/login` - Authentication

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Performance Optimizations

- Code splitting with React.lazy()
- Image optimization
- CSS purging with Tailwind
- Minification and compression in production builds

## 📄 License

MIT License - Feel free to use for personal and commercial projects

## 📧 Support

For questions or issues, contact: hello@uxinfotech.com

## 🔄 Future Enhancements

- [ ] Backend API integration
- [ ] Database integration
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Progressive Web App (PWA)
- [ ] User testimonials section
- [ ] Blog section
- [ ] Client management system

---

**Happy Coding! 🎉**
