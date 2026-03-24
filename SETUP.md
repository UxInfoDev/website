# UX Infotech React - Setup Guide

## Quick Start (5 minutes)

### Step 1: Extract and Install
```bash
# Extract the zip file
unzip uxinfotech-react.zip
cd uxinfotech-react

# Install all dependencies
npm install
```

### Step 2: Run Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```
✅ Frontend available at: http://localhost:3000

**Terminal 2 - Admin Dashboard:**
```bash
npm run admin-dev
```
✅ Admin available at: http://localhost:3001

### Step 3: Access Admin Dashboard
- URL: http://localhost:3001
- Email: `admin@uxinfotech.com`
- Password: `admin123`

---

## Detailed Setup Guide

### Prerequisites Check

Make sure you have these installed:
```bash
# Check Node.js
node --version    # Should be v14 or higher

# Check npm
npm --version     # Should be v6 or higher
```

If not installed, download from: https://nodejs.org

### Installation Process

1. **Extract Files**
   ```bash
   unzip uxinfotech-react.zip
   cd uxinfotech-react
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   This will install all required packages (React, Tailwind, Vite, etc.)

3. **Verify Installation**
   ```bash
   npm list react react-dom react-router-dom
   ```

### Running the Application

#### Option 1: Run Both Servers Simultaneously
```bash
# Terminal 1
npm run dev

# Terminal 2 (new terminal window)
npm run admin-dev
```

#### Option 2: Run Frontend Only
```bash
npm run dev
# Runs on http://localhost:3000
```

#### Option 3: Run Admin Only
```bash
npm run admin-dev
# Runs on http://localhost:3001
```

---

## Frontend Features

### Navigation Sections
- **Home** - Hero banner with automatic image carousel
- **About** - Company information and features
- **Services** - Service offerings with descriptions
- **Portfolio** - Project showcase with filtering
- **Team** - Team member profiles
- **Contact** - Contact form with validation

### Key Features
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Smooth scroll navigation
- ✅ Auto-playing image slider
- ✅ Form validation
- ✅ Toast notifications
- ✅ Back-to-top button
- ✅ Mobile hamburger menu

### Customizing Frontend

**Change Site Title:**
Edit `index.html` - Line 8
```html
<title>Your Company Name - Services</title>
```

**Change Company Name:**
Edit `src/components/Header.jsx` - Logo section
```jsx
<span className="text-orange-600">Your</span> Company
```

**Update Contact Information:**
Edit `src/components/Footer.jsx`
```jsx
// Phone, email, address, social links
```

**Add Your Images:**
1. Place images in `public/images/`
2. Reference in components like:
```jsx
<img src="/images/your-image.jpg" alt="Description" />
```

---

## Admin Dashboard Guide

### Login
- Email: `admin@uxinfotech.com`
- Password: `admin123`

### Dashboard Pages

#### 1. Dashboard (Home)
- View statistics
- Recent inquiries
- Quick action buttons

#### 2. Projects Management
- **Add Project** - Click "Add Project" button
  - Title (required)
  - Category (web-development, mobile, design)
  - Status (completed, in-progress, pending)
- **Edit Project** - Click edit icon
- **Delete Project** - Click trash icon

#### 3. Services Management
- **Add Service** - Click "Add Service" button
  - Title (required)
  - Icon (emoji)
  - Description (required)
- **Edit Service** - Click edit button
- **Delete Service** - Click delete button

#### 4. Team Management
- **Add Member** - Click "Add Member" button
  - Name (required)
  - Role (required)
  - Bio (required)
- **Edit Member** - Click edit icon
- **Delete Member** - Click trash icon

#### 5. Inquiries Management
- View all customer inquiries
- Check inquiry status
- Send replies
- Change status (New, Pending, Replied)

#### 6. Settings
- Site name and description
- Contact information
- Social media URLs
- Email configuration

---

## File Structure Explained

```
uxinfotech-react/
│
├── public/
│   └── images/              # Website images
│
├── src/
│   ├── components/          # Reusable components
│   │   ├── Header.jsx       # Navigation
│   │   ├── Footer.jsx       # Footer
│   │   └── ...other sections
│   │
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Main page
│   │   └── NotFound.jsx     # 404 page
│   │
│   ├── admin/               # Admin dashboard
│   │   ├── AdminApp.jsx     # Admin routing
│   │   ├── components/      # Admin components
│   │   └── pages/           # Admin pages
│   │
│   ├── styles/              # CSS files
│   │   └── index.css
│   │
│   ├── App.jsx              # Main component
│   └── main.jsx             # Entry point
│
├── index.html               # Frontend HTML
├── admin.html               # Admin HTML
├── package.json             # Dependencies
├── vite.config.js           # Frontend config
├── vite.admin.config.js     # Admin config
├── tailwind.config.js       # Tailwind config
└── README.md                # Documentation
```

---

## Building for Production

### Build Frontend
```bash
npm run build
```
Output: `dist/` folder

### Build Admin
```bash
npm run admin-build
```
Output: `dist-admin/` folder

### Deploy to Web Server
```bash
# After building, upload dist/ to your web server
# For example, with netlify:
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## Customization Examples

### Change Primary Color
Edit `src/styles/index.css`:
```css
:root {
  --primary: #FF6B35;      /* Change this color */
  --secondary: #004E89;
}
```

### Add New Section
1. Create component in `src/components/NewSection.jsx`
2. Import in `src/pages/Home.jsx`
3. Add to Home component
4. Add navigation link in `Header.jsx`

### Modify Admin Dashboard
1. Edit component in `src/admin/pages/`
2. Add route in `src/admin/AdminApp.jsx`
3. Update sidebar in `src/admin/components/AdminLayout.jsx`

---

## Troubleshooting

### Port Already in Use
```bash
# If port 3000 is in use, Vite will use 3001 automatically
# Or specify port:
npm run dev -- --port 3002
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Changes Not Reflecting
```bash
# Hard refresh browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Image Not Showing
```bash
# Make sure image is in public/images/
# Reference correctly: /images/filename.jpg
# Not: ./images/filename.jpg
```

---

## Next Steps for Production

### 1. Setup Backend API
- Create API endpoints
- Connect database
- Implement authentication

### 2. Database Integration
- Setup MongoDB, PostgreSQL, or MySQL
- Create data models
- Implement CRUD operations

### 3. Email Service
- Setup email notifications
- Configure mail service (SendGrid, Gmail, etc.)
- Add reply functionality

### 4. Hosting
- Frontend: Netlify, Vercel, GitHub Pages
- Backend: Heroku, AWS, DigitalOcean
- Database: MongoDB Atlas, AWS RDS

### 5. Security
- Add HTTPS
- Implement proper authentication
- Add rate limiting
- Validate all inputs

---

## Support & Help

### Common Issues & Solutions

**Q: Admin not loading?**
A: Make sure you're on http://localhost:3001 (not 3000)

**Q: Form not submitting?**
A: Check browser console for errors, fill all required fields

**Q: Images not showing?**
A: Verify image path is `/images/filename.jpg`

**Q: Port already in use?**
A: Kill process: `lsof -ti:3000 | xargs kill -9`

---

## Version Info

- React: 18.2.0
- Vite: 4.1.0
- Tailwind CSS: 3.3.0
- Node.js: v14+

---

**Need help? Contact: hello@uxinfotech.com** 📧
