# Quick Start Guide - College ERP System

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd college-erp
npm install
```

### Step 2: Start MongoDB
```bash
# Linux/Mac
sudo systemctl start mongodb

# Or manually
mongod
```

### Step 3: Configure Environment
The `.env` file is already configured with default settings. For production, change:
- `JWT_SECRET` to a strong random value
- `MONGODB_URI` to your MongoDB connection string

### Step 4: Start the Server
```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        College ERP System Backend Server             ║
║                                                       ║
║        Server running on port: 5000                  ║
║        Environment: development                      ║
║        Database: MongoDB                              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

MongoDB Connected: localhost
Database Name: college_erp
```

### Step 5: Create First Admin
Open a new terminal and run:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@college.edu",
    "password": "Admin@123"
  }'
```

### Step 6: Open the Frontend
You have two options:

**Option A: Direct Access (Simplest)**
Open your browser to: `http://localhost:5000/index.html`

**Option B: Separate HTTP Server**
```bash
cd public
npx http-server -p 8000
```
Then open: `http://localhost:8000`

### Step 7: Login
Use these credentials:
- **Email:** admin@college.edu
- **Password:** Admin@123

**⚠️ Change password immediately after first login!**

## ✅ Testing the System

### 1. Test Student Registration
Navigate to "Students" → Click "Add Student" → Fill the form:
```
Roll Number: CS2024001
First Name: John
Last Name: Doe
Email: john.doe@student.edu
Phone: 9876543210
Date of Birth: 2005-01-15
Gender: Male
Department: Computer Science
Semester: 1
Batch: 2024
Parent Name: Richard Doe
Parent Phone: 9876543211
```

### 2. Test Staff Registration
Navigate to "Staff" → Click "Add Staff" → Fill the form:
```
Employee ID: EMP001
First Name: Jane
Last Name: Smith
Email: jane.smith@college.edu
Phone: 9876543212
Date of Birth: 1985-05-20
Gender: Female
Department: Computer Science
Designation: Professor
Qualification: PhD in Computer Science
Experience: 10
Joining Date: 2020-08-01
Salary: 80000
```

### 3. Test Fee Entry
Navigate to "Fee Details" → Click "Add Fee Detail" → Fill the form:
```
Roll Number: CS2024001
Academic Year: 2024-2025
Semester: 1
Fee Type: Tuition Fee
Total Amount: 50000
Paid Amount: 0
Due Date: 2024-08-31
```

## 🎯 Common Tasks

### View Dashboard Statistics
- Login to see real-time stats
- Dashboard shows total students, staff, fees, and overdue count

### Search Records
- Use search boxes in each module
- Type roll number, name, or email
- Results appear instantly

### Edit Records
1. Click the yellow edit icon (pencil)
2. Modify the fields
3. Click "Save"

### Delete Records
1. Click the red delete icon (trash)
2. Confirm the deletion
3. Record will be removed

### Change Password
1. Go to API: POST `/api/auth/change-password`
2. Send:
```json
{
  "currentPassword": "Admin@123",
  "newPassword": "NewSecurePassword@2024"
}
```

## 🔧 Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Start MongoDB if stopped
sudo systemctl start mongodb
```

### "Port 5000 already in use"
Edit `.env` file:
```
PORT=5001
```

### "Authentication failed"
1. Clear browser localStorage: `localStorage.clear()`
2. Login again with correct credentials

### "Student/Staff already exists"
- Roll numbers and Employee IDs must be unique
- Email addresses must be unique
- Use different values

## 📱 API Testing with Postman/Insomnia

### 1. Login Request
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@college.edu",
  "password": "Admin@123"
}
```

### 2. Get Students
```
GET http://localhost:5000/api/students
Authorization: Bearer <your-jwt-token>
```

### 3. Create Student
```
POST http://localhost:5000/api/students
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "rollNumber": "CS2024001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@student.edu",
  "phone": "9876543210",
  "dateOfBirth": "2005-01-15",
  "gender": "Male",
  "department": "Computer Science",
  "semester": 1,
  "batch": "2024",
  "parentName": "Richard Doe",
  "parentPhone": "9876543211"
}
```

## 🎓 Next Steps

1. ✅ Add more students, staff, and fee records
2. ✅ Test search and filter functionality
3. ✅ Explore edit and delete operations
4. ✅ Check dashboard statistics
5. ✅ Change default admin password
6. ✅ Customize departments and designations
7. ✅ Set up production environment
8. ✅ Configure email notifications (future)

## 📞 Need Help?

- Check the full README.md for detailed documentation
- Review API endpoints in README
- Check server logs for errors
- Ensure MongoDB is running
- Verify all required fields are filled

---

**Happy Managing! 🎉**
