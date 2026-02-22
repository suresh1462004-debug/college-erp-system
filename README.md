# College ERP System

A comprehensive Enterprise Resource Planning (ERP) system for colleges with strong admin authentication and complete CRUD operations for Students, Staff, and Fee Management.

## 🚀 Features

### Security
- **Strong Admin Authentication**
  - JWT-based authentication
  - Password hashing with bcrypt (12 rounds)
  - Account lockout after 5 failed login attempts
  - Session management with HTTP-only cookies
  - Protected routes with middleware
  - CSRF protection

### Core Modules

#### 1. Student Management
- Complete student registration system
- Fields: Roll number, Name, Email, Phone, DOB, Gender, Address, Department, Semester, Batch, Parent details, Blood group
- Full CRUD operations (Create, Read, Update, Delete)
- Search and filter by department, semester, status
- Pagination support
- Student status tracking (Active, Inactive, Graduated, Suspended)

#### 2. Staff Management
- Comprehensive staff registration
- Fields: Employee ID, Name, Email, Phone, DOB, Gender, Address, Department, Designation, Qualification, Experience, Salary, Joining date
- Full CRUD operations
- Search and filter by department, designation, status
- Staff status tracking (Active, Inactive, On Leave, Resigned)

#### 3. Fee Details Management
- Complete fee management system
- Multiple fee types (Tuition, Library, Lab, Sports, Exam, Development, Transport, Hostel)
- Automatic payment status calculation
- Fields: Student reference, Academic year, Semester, Fee type, Total amount, Paid amount, Due amount, Payment status, Due date, Payment mode, Transaction ID
- Payment tracking (Pending, Partial, Paid, Overdue)
- Fine and discount management

### Dashboard
- Real-time statistics
- Total students, staff, and fee records
- Overdue fee alerts
- Department-wise distribution

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd college-erp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup MongoDB
Make sure MongoDB is running on your system:
```bash
# Start MongoDB service
mongod
```

### 4. Configure Environment Variables
Edit the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/college_erp
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

**Important:** Change the `JWT_SECRET` to a strong, unique value in production!

### 5. Start the Server
```bash
# Development mode
npm start

# Or with nodemon (auto-restart)
npm run dev
```

The server will start on `http://localhost:5000`

### 6. Access the Frontend
Open your browser and navigate to:
```
http://localhost:5000/index.html
```

Or use any HTTP server to serve the `public` folder:
```bash
# Using Python
cd public
python -m http.server 8000

# Or using Node.js http-server
npx http-server public -p 8000
```

Then access: `http://localhost:8000`

## 🔐 First Admin Setup

### Creating the First Admin Account

The system allows creating the first admin without authentication. After the first admin is created, all subsequent admin registrations must be done through protected routes.

**Method 1: Using API (Recommended)**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@college.edu",
    "password": "Admin@123"
  }'
```

**Method 2: Using MongoDB Shell**
```javascript
use college_erp
db.admins.insertOne({
  username: "admin",
  email: "admin@college.edu",
  password: "$2a$12$<bcrypt-hashed-password>",
  role: "superadmin",
  isActive: true,
  loginAttempts: 0,
  createdAt: new Date()
})
```

**Default Login Credentials:**
- Email: `admin@college.edu`
- Password: `Admin@123`

**⚠️ IMPORTANT: Change these credentials immediately after first login!**

## 📡 API Endpoints

### Authentication Routes
```
POST   /api/auth/register          - Register first admin
POST   /api/auth/login             - Admin login
GET    /api/auth/me                - Get current admin
POST   /api/auth/logout            - Logout admin
PUT    /api/auth/change-password   - Change password
```

### Student Routes (Protected)
```
GET    /api/students               - Get all students (with pagination & search)
GET    /api/students/:id           - Get single student
POST   /api/students               - Create new student
PUT    /api/students/:id           - Update student
DELETE /api/students/:id           - Delete student
GET    /api/students/stats/dashboard - Get student statistics
```

### Staff Routes (Protected)
```
GET    /api/staff                  - Get all staff (with pagination & search)
GET    /api/staff/:id              - Get single staff member
POST   /api/staff                  - Create new staff
PUT    /api/staff/:id              - Update staff
DELETE /api/staff/:id              - Delete staff
GET    /api/staff/stats/dashboard  - Get staff statistics
```

### Fee Routes (Protected)
```
GET    /api/fees                   - Get all fees (with pagination & filters)
GET    /api/fees/:id               - Get single fee detail
GET    /api/fees/student/:rollNumber - Get student fees
POST   /api/fees                   - Create new fee detail
PUT    /api/fees/:id               - Update fee detail
DELETE /api/fees/:id               - Delete fee detail
POST   /api/fees/:id/payment       - Record payment
GET    /api/fees/stats/dashboard   - Get fee statistics
```

## 🗂️ Project Structure

```
college-erp/
├── config/
│   └── db.js                  # Database configuration
├── models/
│   ├── Admin.js               # Admin model with auth
│   ├── Student.js             # Student model
│   ├── Staff.js               # Staff model
│   └── FeeDetail.js           # Fee details model
├── routes/
│   ├── authRoutes.js          # Authentication routes
│   ├── studentRoutes.js       # Student CRUD routes
│   ├── staffRoutes.js         # Staff CRUD routes
│   └── feeRoutes.js           # Fee details routes
├── middleware/
│   └── auth.js                # JWT authentication middleware
├── public/
│   ├── index.html             # Frontend HTML
│   ├── styles.css             # Styles
│   └── app.js                 # Frontend JavaScript
├── .env                       # Environment variables
├── package.json               # Dependencies
├── server.js                  # Main server file
└── README.md                  # Documentation
```

## 🔒 Security Features

1. **Password Security**
   - Bcrypt hashing with 12 salt rounds
   - Minimum 6 characters required
   - Password change functionality

2. **Authentication**
   - JWT tokens with 7-day expiration
   - HTTP-only cookies
   - Token verification on protected routes

3. **Account Protection**
   - Login attempt tracking
   - Account lockout after 5 failed attempts
   - 2-hour lockout period
   - Account status checking

4. **Input Validation**
   - Express-validator for all inputs
   - Email format validation
   - Phone number validation
   - Required field enforcement

5. **Authorization**
   - Role-based access control
   - Admin and Superadmin roles
   - Protected routes middleware

## 💡 Usage Examples

### Login
1. Open the application in your browser
2. Enter admin email and password
3. Click "Login"
4. You'll be redirected to the dashboard

### Add Student
1. Navigate to "Students" from sidebar
2. Click "Add Student" button
3. Fill in all required fields:
   - Roll Number
   - Name (First & Last)
   - Email
   - Phone (10 digits)
   - Date of Birth
   - Gender
   - Department
   - Semester
   - Batch
   - Parent Details
4. Click "Save"

### Add Staff
1. Navigate to "Staff" from sidebar
2. Click "Add Staff" button
3. Fill in required fields:
   - Employee ID
   - Name
   - Contact details
   - Department & Designation
   - Qualification & Experience
   - Salary
4. Click "Save"

### Add Fee Detail
1. Navigate to "Fee Details" from sidebar
2. Click "Add Fee Detail" button
3. Enter:
   - Student Roll Number
   - Academic Year
   - Semester
   - Fee Type
   - Amount
   - Due Date
4. Click "Save"

### Search & Filter
- Use search boxes to find records
- Type roll number, name, or email
- Results update automatically

### Edit/Delete
- Click the edit (pencil) icon to modify
- Click the delete (trash) icon to remove
- Confirm deletion when prompted

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Make sure MongoDB is running
sudo systemctl start mongodb
# or
mongod
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=5001
```

### Authentication Token Invalid
```bash
# Clear browser localStorage and login again
localStorage.clear()
```

### Cannot Create Student/Staff
- Ensure all required fields are filled
- Check email format is valid
- Verify phone number is 10 digits
- Make sure roll number/employee ID is unique

## 📊 Database Schema

### Admin Collection
- username, email, password (hashed)
- role (admin/superadmin)
- isActive, loginAttempts, lockUntil
- lastLogin, createdAt, updatedAt

### Students Collection
- rollNumber, firstName, lastName
- email, phone, dateOfBirth, gender
- address (street, city, state, pincode)
- department, semester, batch
- status, parentName, parentPhone
- bloodGroup, photoUrl, createdBy

### Staff Collection
- employeeId, firstName, lastName
- email, phone, dateOfBirth, gender
- address, department, designation
- qualification, experience, joiningDate
- salary, status, subjects
- emergencyContact, photoUrl, createdBy

### FeeDetails Collection
- student (reference), rollNumber
- academicYear, semester, feeType
- totalAmount, paidAmount, dueAmount
- paymentStatus, dueDate, paymentDate
- paymentMode, transactionId, receiptNumber
- discount, fine, remarks, createdBy

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Support

For support, email your.email@college.edu or create an issue in the repository.

## 🔄 Future Enhancements

- Email notifications for fee dues
- SMS integration
- Attendance tracking
- Exam management
- Report card generation
- File upload for documents
- Advanced analytics and charts
- Mobile app
- Multi-tenancy support
- Backup and restore functionality

---

**Made with ❤️ for Educational Institutions**
