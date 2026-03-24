# Backend API Integration Guide

This guide shows how to integrate the React frontend with a backend API.

## API Endpoints Required

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/register
GET /api/auth/verify
```

### Projects
```
GET /api/projects               # Get all projects
GET /api/projects/:id           # Get single project
POST /api/projects              # Create project
PUT /api/projects/:id           # Update project
DELETE /api/projects/:id        # Delete project
```

### Services
```
GET /api/services               # Get all services
GET /api/services/:id           # Get single service
POST /api/services              # Create service
PUT /api/services/:id           # Update service
DELETE /api/services/:id        # Delete service
```

### Team Members
```
GET /api/team                   # Get all team members
GET /api/team/:id               # Get single member
POST /api/team                  # Create member
PUT /api/team/:id               # Update member
DELETE /api/team/:id            # Delete member
```

### Inquiries
```
GET /api/inquiries              # Get all inquiries
GET /api/inquiries/:id          # Get single inquiry
POST /api/inquiries             # Create inquiry
PUT /api/inquiries/:id          # Update inquiry status
DELETE /api/inquiries/:id       # Delete inquiry
POST /api/inquiries/:id/reply   # Send reply
```

### Settings
```
GET /api/settings               # Get all settings
PUT /api/settings               # Update settings
```

---

## Sample API Response Formats

### Projects
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "E-Commerce Platform",
      "category": "web-development",
      "description": "Full-featured e-commerce platform",
      "image": "/images/project-01.jpg",
      "status": "completed",
      "createdAt": "2024-03-20",
      "updatedAt": "2024-03-20"
    }
  ]
}
```

### Services
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "UX/UI Design",
      "description": "Beautiful, intuitive interfaces",
      "icon": "🎨",
      "createdAt": "2024-03-20"
    }
  ]
}
```

### Team Members
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "John Designer",
      "role": "UX/UI Design Lead",
      "bio": "Award-winning designer with 10+ years experience",
      "image": "/images/team-01.jpg",
      "socials": {
        "linkedin": "#",
        "twitter": "#",
        "github": "#"
      }
    }
  ]
}
```

### Inquiries
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "E-Commerce Website",
      "message": "I need help building an e-commerce platform",
      "status": "new",
      "replies": [],
      "createdAt": "2024-03-20"
    }
  ]
}
```

---

## Example: Integrating Projects API

### Current Code (Using Local State)
```jsx
// src/admin/pages/ProjectsManager.jsx
const [projects, setProjects] = useState([...])

const onSubmit = async (data) => {
  // Uses local state
  setProjects([...projects, { ...data, id: Date.now() }])
}
```

### Updated Code (Using API)
```jsx
import axios from 'axios'
import { toast } from 'react-toastify'

const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:5000'

const ProjectsManager = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch projects
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE}/api/projects`)
      setProjects(response.data.data)
    } catch (error) {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  // Create project
  const onSubmit = async (data) => {
    try {
      await axios.post(`${API_BASE}/api/projects`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      toast.success('Project added successfully!')
      fetchProjects()
      reset()
      setShowForm(false)
    } catch (error) {
      toast.error('Failed to add project')
    }
  }

  // Update project
  const handleEdit = async (project) => {
    try {
      await axios.put(`${API_BASE}/api/projects/${project.id}`, project, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      toast.success('Project updated!')
      fetchProjects()
    } catch (error) {
      toast.error('Failed to update project')
    }
  }

  // Delete project
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return
    
    try {
      await axios.delete(`${API_BASE}/api/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      toast.success('Project deleted!')
      fetchProjects()
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  return (
    // ... rest of component
  )
}
```

---

## Setting Up API Base URL

### Create API Service
```javascript
// src/services/api.js
import axios from 'axios'

const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### Use in Components
```jsx
import api from '../services/api'

const fetchProjects = async () => {
  try {
    const { data } = await api.get('/projects')
    setProjects(data.data)
  } catch (error) {
    toast.error('Failed to load projects')
  }
}
```

---

## Backend Stack Recommendations

### Node.js/Express Stack
```
Backend Framework: Express.js
Database: MongoDB or PostgreSQL
Authentication: JWT
Email Service: SendGrid or Nodemailer
```

### Python/Django Stack
```
Backend Framework: Django/DRF
Database: PostgreSQL
Authentication: JWT/Django Auth
Email Service: Django Email Backend
```

### Node.js Example (Express)
```javascript
// server.js
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)

// Routes
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find()
    res.json({ success: true, data: projects })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/projects', async (req, res) => {
  try {
    const project = new Project(req.body)
    await project.save()
    res.json({ success: true, data: project })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// More routes...

app.listen(5000, () => console.log('Server running on port 5000'))
```

---

## Authentication Flow

### Login
```javascript
// Existing code in src/admin/pages/Login.jsx
const onSubmit = async (data) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/auth/login`,
      data
    )
    
    const { token } = response.data.data
    localStorage.setItem('adminToken', token)
    onLogin(token)
    toast.success('Logged in successfully!')
  } catch (error) {
    toast.error('Invalid credentials')
  }
}
```

### Logout
```javascript
// In AdminLayout.jsx
const handleLogout = async () => {
  try {
    await axios.post(
      `${API_BASE}/api/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      }
    )
  } finally {
    localStorage.removeItem('adminToken')
    // Redirect to login...
  }
}
```

---

## Error Handling

```javascript
const handleApiCall = async (apiFunction) => {
  try {
    const response = await apiFunction()
    toast.success('Operation successful!')
    return response.data
  } catch (error) {
    // Handle different error types
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      // Forbidden
      toast.error('You do not have permission')
    } else if (error.response?.status === 404) {
      // Not found
      toast.error('Resource not found')
    } else if (error.response?.status === 500) {
      // Server error
      toast.error('Server error. Please try again later.')
    } else {
      // Network or other errors
      toast.error(error.message || 'An error occurred')
    }
  }
}
```

---

## Environment Variables

Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=UX Infotech
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

---

## Testing API Endpoints

### Using cURL
```bash
# Get projects
curl http://localhost:5000/api/projects

# Create project
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"My Project","category":"web"}'
```

### Using Postman
1. Import this collection into Postman
2. Set `{{base_url}}` to `http://localhost:5000`
3. Set `{{token}}` in auth
4. Test endpoints

---

## Resources

- [Express.js Guide](https://expressjs.com/)
- [MongoDB Guide](https://docs.mongodb.com/)
- [JWT Authentication](https://jwt.io/)
- [Axios Documentation](https://axios-http.com/)

---

**Start with the local state implementation, then gradually integrate with your backend API.** ✅
