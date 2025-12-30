"# Document Management System (DMSPro)

A modern, full-stack document management platform with intelligent organization, granular permissions, version control, and enterprise-grade security.

## 🎯 Overview

DMSPro is a comprehensive Document Management System designed to solve the chaos of scattered files and insecure document sharing. It provides a centralized platform where teams can upload, organize, search, and collaborate on documents with confidence.

**Live Demo:** [Coming Soon on Render]

## ✨ Key Features

### 📁 Smart Document Management
- **Drag & Drop Upload** - Upload multiple files at once (PDFs, images, Office documents)
- **Intelligent Tagging** - Create custom tags for easy categorization and retrieval
- **Advanced Search** - Full-text search by title, tags, or content
- **Document Preview** - View files directly in the browser

### 🔒 Security & Access Control
- **JWT Authentication** - Secure user authentication with token-based sessions
- **Granular Permissions** - Fine-grained access control at document level
- **Role-Based Access** - Admin, Editor, and Viewer roles
- **Audit Logs** - Track all document access and modifications

### 📊 Version Control & History
- **Version Tracking** - Maintain complete history of document changes
- **Compare Versions** - View differences between document versions
- **Restore Versions** - Revert to previous versions with one click
- **Change Timeline** - Visual history of all modifications

### 📱 Responsive Design
- **Mobile First** - Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates** - Instant synchronization across devices
- **PWA Ready** - Progressive Web App capabilities

### 🎨 Modern UI/UX
- **Lime Green Theme** - Professional, modern design with consistent branding
- **Intuitive Navigation** - Easy-to-use interface with clear workflows
- **Dark Mode Support** - Comfortable viewing in any lighting condition
- **Accessibility** - WCAG compliant interface

## 🛠️ Tech Stack

### Frontend
- **Angular 17+** - Modern TypeScript framework with standalone components
- **RxJS** - Reactive programming for real-time updates
- **Angular Router** - Client-side routing
- **HTTP Client** - Secure API communication
- **Custom CSS** - Responsive design with CSS Grid and Flexbox

### Backend
- **Node.js & Express.js** - RESTful API server
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - Object modeling for MongoDB
- **JWT** - Secure token-based authentication
- **Multer** - File upload handling
- **GridFS** - Secure file storage in MongoDB
- **Cors** - Cross-Origin Resource Sharing
- **Swagger** - API documentation

### DevOps & Deployment
- **Render** - Cloud hosting platform
- **MongoDB Atlas** - Cloud database service
- **Docker Ready** - Container deployment support
- **GitHub** - Version control

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- MongoDB Atlas account (free tier available)
- GitHub account
- Render account (free tier available)

## 🚀 Quick Start

### Local Development

#### 1. Clone Repository
```bash
git clone https://github.com/luxmikant/Document-management-system.git
cd Document-management-system
```

#### 2. Install Dependencies
```bash
# Install all dependencies at once
npm run install-all

# Or install separately
npm install                    # Root
cd client && npm install       # Frontend
cd ../server && npm install    # Backend
```

#### 3. Configure Environment Variables

**Server (.env)**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dms
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_ORIGINS=http://localhost:4200,http://127.0.0.1:4200,http://localhost:5173
```

**Client (.env)**
Frontend uses `src/environments/` configuration - automatically switches between dev/prod.

#### 4. Start Development Servers

**Option A: Run Both Concurrently**
```bash
npm run dev
```

**Option B: Run Separately**
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm start
```

**Option C: Production Build**
```bash
npm run build
cd server && npm start
```

#### 5. Access Application
- **Frontend**: http://localhost:5173 (Vite) or http://localhost:4200 (Angular)
- **Backend**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs

#### 6. Test with Default User
```
Email: test@example.com
Password: test123456
```

## 📦 Project Structure

```
Document-management-system/
├── client/                           # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                # Core services & guards
│   │   │   ├── features/            # Feature modules
│   │   │   │   ├── landing/         # Landing page (storytelling)
│   │   │   │   ├── auth/            # Login & Register
│   │   │   │   └── documents/       # Document management
│   │   │   ├── shared/              # Shared components
│   │   │   └── app.routes.ts        # Route configuration
│   │   ├── environments/            # Environment configs
│   │   └── styles/                  # Global styles (lime green theme)
│   ├── angular.json                 # Angular config
│   └── package.json
│
├── server/                           # Node.js/Express Backend
│   ├── src/
│   │   ├── app.ts                   # Express app setup
│   │   ├── server.ts                # Server entry point
│   │   ├── config/                  # Configuration
│   │   ├── middleware/              # Custom middleware
│   │   │   ├── auth.ts              # JWT authentication
│   │   │   ├── errorHandler.ts      # Error handling
│   │   │   └── upload.ts            # File upload
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── User.ts
│   │   │   ├── Document.ts
│   │   │   ├── Version.ts
│   │   │   └── Tag.ts
│   │   ├── routes/                  # API endpoints
│   │   │   ├── auth.ts
│   │   │   ├── documents.ts
│   │   │   ├── versions.ts
│   │   │   ├── tags.ts
│   │   │   └── users.ts
│   │   ├── services/                # Business logic
│   │   │   └── gridfs.ts            # File storage
│   │   └── swagger.ts               # API documentation
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                            # Documentation
├── package.json                     # Root monorepo config
├── vite.config.ts                   # Vite configuration (optional)
└── README.md                        # This file
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register         # Create new account
POST   /api/auth/login             # Login user
POST   /api/auth/logout            # Logout (client-side)
GET    /api/auth/profile           # Get current user
```

### Documents
```
GET    /api/documents              # List all documents
GET    /api/documents/:id          # Get document details
POST   /api/documents              # Upload new document
PUT    /api/documents/:id          # Update document (metadata)
DELETE /api/documents/:id          # Delete document
GET    /api/documents/:id/download # Download document
GET    /api/documents/:id/preview  # Preview document
```

### Tags
```
GET    /api/tags                   # List all tags
POST   /api/tags                   # Create new tag
DELETE /api/tags/:id               # Delete tag
```

### Versions
```
GET    /api/versions/:docId        # Get version history
GET    /api/versions/:versionId    # Get specific version
POST   /api/versions/:docId        # Create new version
DELETE /api/versions/:versionId    # Delete version
```

### Users
```
GET    /api/users                  # List all users (admin)
GET    /api/users/:id              # Get user details
PUT    /api/users/:id              # Update user
DELETE /api/users/:id              # Delete user (admin)
```

### Health
```
GET    /api/health                 # System health check
```

## 🔐 Authentication & Security

### Password Security
- Passwords hashed with bcryptjs (10 salt rounds)
- Never stored in plaintext
- Minimum 8 characters recommended

### JWT Tokens
- Tokens expire in 7 days (configurable)
- Refresh logic: Re-login for new token
- Tokens stored in localStorage (client-side)
- Sent in `Authorization: Bearer <token>` header

### File Security
- Files stored in MongoDB GridFS (not file system)
- Access controlled by document permissions
- File type validation (whitelisted MIME types)
- Max file size: 10MB (configurable)

### CORS Configuration
- Production: Only whitelisted origins allowed
- Development: Permissive for local testing
- Configure via `ALLOWED_ORIGINS` environment variable

## 🎯 Role-Based Permissions

### Admin
- Create, read, update, delete all documents
- Manage user accounts
- Configure system settings
- View audit logs

### Editor
- Create and upload documents
- Edit own and shared documents
- Manage tags on accessible documents
- View version history

### Viewer
- Read documents shared with them
- Download documents
- View version history (read-only)
- Cannot modify or delete

## 📝 Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: "admin" | "editor" | "viewer",
  createdAt: Date,
  updatedAt: Date
}
```

### Documents Collection
```typescript
{
  _id: ObjectId,
  title: String,
  description: String,
  owner: ObjectId (User),
  fileId: ObjectId (GridFS),
  mimeType: String,
  size: Number,
  tags: [String],
  permissions: [{
    userId: ObjectId,
    role: "view" | "edit" | "admin"
  }],
  currentVersion: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Versions Collection
```typescript
{
  _id: ObjectId,
  documentId: ObjectId,
  fileId: ObjectId (GridFS),
  versionNumber: Number,
  uploadedBy: ObjectId (User),
  description: String,
  createdAt: Date
}
```

## 🚀 Deployment on Render

### Step 1: Prepare MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project
4. Create a free M0 cluster
5. Create database user:
   - Database Access → Add New Database User
   - Username: `dmsuser`
   - Password: Generate secure password
   - Keep this password safe!
6. Configure network access:
   - Network Access → Add IP Address
   - Allow: `0.0.0.0/0` (allows all - for development)
   - For production: Whitelist specific IPs
7. Get connection string:
   - Clusters → Connect → Connect your application
   - Copy connection string (looks like: `mongodb+srv://user:password@cluster.mongodb.net/dms`)
   - Replace `<password>` with your database user password

### Step 2: Push to GitHub

```bash
# Add all changes
git add .

# Commit
git commit -m "feat: prepare for Render deployment - add env config, static serving, CORS"

# Push to GitHub
git push origin main
```

### Step 3: Create Render Web Service

1. Go to [render.com](https://render.com)
2. Sign up or log in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select your GitHub repository
5. Configure settings:

| Setting | Value |
|---------|-------|
| **Name** | `dms-app` |
| **Environment** | `Node` |
| **Region** | Select closest to you |
| **Branch** | `main` |
| **Build Command** | `npm run build` |
| **Start Command** | `cd server && npm start` |
| **Instance Type** | Free (or Starter for production) |

### Step 4: Add Environment Variables

In Render dashboard, under your service:
1. Click **"Environment"** (left panel)
2. Add each variable:

```
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://dmsuser:YOUR_PASSWORD@cluster-name.mongodb.net/dms?retryWrites=true&w=majority
JWT_SECRET=generate-random-secure-key-here-min-32-chars
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_ORIGINS=https://your-app-name.onrender.com,https://www.your-app-name.onrender.com
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Create Seed User (First Time Only)

After deployment, create initial admin user. Run in Render shell:

```bash
# SSH into Render terminal
node server/create-test-user.js
```

Or update the script:

```javascript
// server/create-test-user.js
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'viewer' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const hashedPassword = await bcryptjs.hash('AdminPassword123', 10);
    
    const user = await User.findOneAndUpdate(
      { email: 'admin@dms.com' },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@dms.com',
        password: hashedPassword,
        role: 'admin'
      },
      { upsert: true, new: true }
    );
    
    console.log('✅ Admin user created:', user.email);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminUser();
```

### Step 6: Deploy

1. Click **"Deploy"** button in Render
2. Wait for build to complete (5-15 minutes)
3. Monitor logs for any errors
4. Once live, your app is at: `https://dms-app.onrender.com`

### Step 7: Verify Deployment

```bash
# Test API health
curl https://dms-app.onrender.com/api/health

# Test login (if user exists)
curl -X POST https://dms-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dms.com","password":"AdminPassword123"}'
```

### Step 8: Custom Domain (Optional)

1. In Render dashboard, go to your service
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain: `documents.yourcompany.com`
4. Update DNS records (Render will provide instructions)

## 🐛 Troubleshooting

### Build Fails
```
Check: npm run build runs locally
Ensure all dependencies installed: npm run install-all
Check Node version: node --version (should be 18+)
```

### Connection Refused
```
MongoDB: Check MONGODB_URI in environment variables
API: Verify ALLOWED_ORIGINS includes your domain
```

### Files Not Uploading
```
Check MAX_FILE_SIZE setting (default 10MB)
Verify disk space on Render
Check upload directory permissions
```

### CORS Errors
```
Add your domain to ALLOWED_ORIGINS
Include http:// or https:// prefix
Restart service after env changes
```

### MongoDB Connection Issues
```
MongoDB Atlas → Network Access → Add 0.0.0.0/0
Check username and password in connection string
Verify cluster is running
```

## 📊 Monitoring & Logs

### View Logs in Render
1. Dashboard → Select service
2. Click **"Logs"** tab
3. Monitor real-time output

### Common Log Messages
```
"✅ MongoDB connected successfully" → Database working
"✅ Server running on port 3000" → API running
"CORS blocked origin" → Check ALLOWED_ORIGINS
"Error connecting to MongoDB" → Check MONGODB_URI
```

## 🔄 Scaling & Performance

### Optimize for Production
1. **Minify assets** - Automatically done by build
2. **Enable compression** - Express.js included
3. **Use CDN** - Render provides edge nodes
4. **Database indexing** - Already configured
5. **Connection pooling** - Mongoose handles automatically

### Upgrade Plan When Needed
- Free tier: Spins down after 15 mins of inactivity
- Starter: $7/month, always on
- Standard: $12/month, dedicated resources

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes and test locally
4. Commit: `git commit -m "feat: describe changes"`
5. Push: `git push origin feature/your-feature`
6. Create Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

For issues or questions:
1. Check [Issues](https://github.com/luxmikant/Document-management-system/issues)
2. Create new issue with details
3. Include error messages and steps to reproduce

## 🎓 Learning Resources

- [Angular Documentation](https://angular.io)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com/manual)
- [Render Deployment Guide](https://render.com/docs)
- [JWT Authentication](https://jwt.io/introduction)

## 📈 Roadmap

- [ ] Email notifications
- [ ] Full-text search optimization
- [ ] Bulk operations (delete, move, tag)
- [ ] Document comments & collaboration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] API rate limiting
- [ ] Two-factor authentication

## 👨‍💻 Author

**Developed by:** Luxmikant  
**Repository:** [GitHub](https://github.com/luxmikant/Document-management-system)  
**Project Start:** December 2025

---

**Last Updated:** December 30, 2025  
**Status:** ✅ Production Ready for Render Deployment" 
