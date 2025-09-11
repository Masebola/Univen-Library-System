# University of Venda Library Management System - Developer Instructions

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Database Setup](#database-setup)
4. [Running the Application](#running-the-application)
5. [Testing the System](#testing-the-system)
6. [Project Structure](#project-structure)
7. [API Documentation](#api-documentation)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up the Library Management System, ensure you have the following software installed:

### Required Software
- **Node.js** (version 14.0 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **npm** (comes with Node.js)
  - Verify installation: `npm --version`

### Recommended Tools
- **Git** (for version control)
- **VS Code** or similar code editor
- **Postman** (for API testing)

## Installation

### Step 1: Clone or Download the Project
\`\`\`bash
# If using Git
git clone <repository-url>
cd university-library-management

# Or extract the ZIP file and navigate to the folder
cd university-library-management
\`\`\`

### Step 2: Install Dependencies
\`\`\`bash
npm install
\`\`\`

This will install all required dependencies including:
- express (web framework)
- sqlite3 (database)
- bcryptjs (password hashing)
- cors (cross-origin requests)

### Step 3: Verify Installation
\`\`\`bash
npm list
\`\`\`

## Database Setup

The system uses SQLite, which creates the database file automatically when you first run the application.

### Database Features
- **Automatic Creation**: Database and tables are created on first run
- **Sample Data**: Includes pre-populated sample books and admin account
- **Location**: Database file is stored in `/database/library.db`

### Default Admin Account
- **Email**: admin@univen.ac.za
- **Password**: admin123
- **Role**: admin

*Note: Change the admin password after first login for security*

## Running the Application

### Step 1: Start the Server
\`\`\`bash
npm start
\`\`\`

Or for development with auto-restart:
\`\`\`bash
npm run dev
\`\`\`

### Step 2: Access the Application
Open your web browser and navigate to:
- **Main Application**: http://localhost:3000
- **Server Port**: 3000 (default)

### Step 3: Verify Server is Running
You should see the console message:
\`\`\`
University of Venda Library Management System running on port 3000
\`\`\`

## Testing the System

### 1. Homepage Test
- Navigate to http://localhost:3000
- Verify the homepage loads with navigation menu
- Check responsive design by resizing the browser

### 2. User Registration Test
1. Go to Login page
2. Click "Sign Up" tab
3. Register with:
   - **Name**: Your Full Name
   - **Email**: your.email@univen.ac.za
   - **Password**: SecurePassword123
4. Verify successful registration and auto-login

### 3. Guest Access Test
1. Go to Login page
2. Click "Continue as Guest"
3. Verify you can browse catalog but not borrow books

### 4. Admin Login Test
1. Go to Login page
2. Use credentials:
   - **Email**: admin@univen.ac.za
   - **Password**: admin123
3. Verify access to Admin Dashboard

### 5. Book Borrowing Test
1. Login as a registered student
2. Go to Library (Catalog) page
3. Find an available book
4. Click "Borrow" and confirm
5. Verify book appears in "My Borrowed Books"

### 6. Book Return Test
1. Go to "My Borrowed Books" page
2. Click "Return Book" on a borrowed book
3. Confirm the return
4. Verify book is no longer in your borrowed list

### 7. Admin Dashboard Test
1. Login as admin
2. Go to Admin Dashboard
3. Verify statistics display correctly
4. Check transaction history table
5. Test export functionality

## Project Structure

\`\`\`
university-library-management/
├── public/                     # Frontend files
│   ├── index.html             # Homepage
│   ├── about.html             # About page
│   ├── instructions.html      # User instructions
│   ├── auth.html              # Login/Register page
│   ├── catalog.html           # Book catalog
│   ├── borrowed.html          # My borrowed books
│   ├── admin.html             # Admin dashboard
│   ├── style.css              # Main stylesheet
│   ├── script.js              # Global JavaScript
│   ├── auth.js                # Authentication logic
│   ├── catalog.js             # Catalog functionality
│   ├── borrowed.js            # Borrowed books logic
│   └── admin.js               # Admin dashboard logic
├── routes/                     # API routes
│   ├── auth.js                # Authentication endpoints
│   ├── books.js               # Book management endpoints
│   └── admin.js               # Admin endpoints
├── database/                   # Database files
│   ├── db.js                  # Database configuration
│   └── library.db             # SQLite database (created on first run)
├── server.js                  # Main server file
├── package.json               # Node.js dependencies
├── README.md                  # Project overview (for reviewers)
└── INSTRUCTIONS.md            # This file (for developers)
\`\`\`

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new student account
\`\`\`json
{
  "name": "Student Name",
  "email": "student@univen.ac.za",
  "password": "password123"
}
\`\`\`

#### POST /api/auth/login
Login with email and password
\`\`\`json
{
  "email": "student@univen.ac.za",
  "password": "password123"
}
\`\`\`

#### POST /api/auth/guest
Get guest access (no body required)

### Book Management Endpoints

#### GET /api/books/catalog
Get all books in the catalog

#### POST /api/books/borrow
Borrow a book
\`\`\`json
{
  "userId": 1,
  "bookId": 5
}
\`\`\`

#### GET /api/books/borrowed/:userId
Get borrowed books for a specific user

#### POST /api/books/return
Return a borrowed book
\`\`\`json
{
  "transactionId": 1
}
\`\`\`

### Admin Endpoints

#### GET /api/admin/transactions
Get all library transactions (admin only)

#### GET /api/admin/stats
Get dashboard statistics (admin only)

## Troubleshooting

### Common Issues and Solutions

#### 1. "Port already in use" Error
\`\`\`bash
# Kill process on port 3000
killall node
# Or change port in server.js
const PORT = process.env.PORT || 3001;
\`\`\`

#### 2. Database Connection Error
- Ensure database directory has write permissions
- Check if SQLite3 module installed correctly:
\`\`\`bash
npm install sqlite3 --save
\`\`\`

#### 3. Module Not Found Error
\`\`\`bash
# Reinstall all dependencies
rm -rf node_modules
rm package-lock.json
npm install
\`\`\`

#### 4. CSS/JS Files Not Loading
- Verify files are in public/ directory
- Check browser console for 404 errors
- Ensure server is serving static files correctly

#### 5. Books Not Displaying
- Check browser console for JavaScript errors
- Verify API endpoints are responding:
  - Visit http://localhost:3000/api/books/catalog
- Check database has sample data

#### 6. Login Issues
- Clear browser localStorage: `localStorage.clear()`
- Verify database contains user records
- Check password hashing is working correctly

### Development Tips

#### 1. Enable Development Mode
\`\`\`bash
# Install nodemon for auto-restart
npm install -g nodemon
# Run with nodemon
nodemon server.js
\`\`\`

#### 2. Database Inspection
Use SQLite browser or command line:
\`\`\`bash
sqlite3 database/library.db
.tables
SELECT * FROM users;
\`\`\`

#### 3. API Testing
Use curl or Postman to test endpoints:
\`\`\`bash
# Test book catalog
curl http://localhost:3000/api/books/catalog

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@univen.ac.za","password":"admin123"}'
\`\`\`

#### 4. Frontend Debugging
- Open browser Developer Tools (F12)
- Check Console tab for JavaScript errors
- Use Network tab to monitor API requests
- Inspect Application tab for localStorage data

### Performance Optimization

#### 1. Database Optimization
- Add indexes for frequently queried columns
- Regular database maintenance
- Monitor query performance

#### 2. Frontend Optimization
- Minimize JavaScript bundle size
- Optimize CSS for faster loading
- Implement caching strategies

#### 3. Server Optimization
- Enable gzip compression
- Implement rate limiting
- Add request logging for monitoring

## Getting Help

### Documentation Resources
- **Node.js**: https://nodejs.org/docs/
- **Express.js**: https://expressjs.com/
- **SQLite**: https://sqlite.org/docs.html

### Debugging Steps
1. Check server console for error messages
2. Verify all dependencies are installed
3. Test API endpoints individually
4. Check browser console for frontend errors
5. Verify database structure and data

### Support
For technical support or questions about the system:
- Review this documentation thoroughly
- Check the troubleshooting section
- Test with provided sample data first
- Document exact error messages and steps to reproduce

---

**Good luck with your University of Venda Library Management System!**

The system is designed to be robust and user-friendly. Follow these instructions carefully, and you should have a fully functional library management system running in minutes.
