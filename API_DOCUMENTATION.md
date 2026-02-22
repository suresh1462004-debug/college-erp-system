# API Documentation - College ERP System

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication APIs

### 1. Register First Admin
**Endpoint:** `POST /auth/register`
**Access:** Public (only for first admin)
**Description:** Creates the first admin account. Subsequent registrations are blocked.

**Request Body:**
```json
{
  "username": "admin",
  "email": "admin@college.edu",
  "password": "Admin@123"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "email": "admin@college.edu",
    "role": "superadmin"
  }
}
```

### 2. Login
**Endpoint:** `POST /auth/login`
**Access:** Public

**Request Body:**
```json
{
  "email": "admin@college.edu",
  "password": "Admin@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "email": "admin@college.edu",
    "role": "admin"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Error Response (423 - Account Locked):**
```json
{
  "success": false,
  "message": "Account is temporarily locked due to too many failed login attempts."
}
```

### 3. Get Current Admin
**Endpoint:** `GET /auth/me`
**Access:** Protected

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "email": "admin@college.edu",
    "role": "admin",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 4. Logout
**Endpoint:** `POST /auth/logout`
**Access:** Protected

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 5. Change Password
**Endpoint:** `PUT /auth/change-password`
**Access:** Protected

**Request Body:**
```json
{
  "currentPassword": "Admin@123",
  "newPassword": "NewSecurePassword@2024"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 👨‍🎓 Student APIs

### 1. Get All Students
**Endpoint:** `GET /students`
**Access:** Protected
**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (search by roll number, name, email)
- `department` (filter by department)
- `status` (filter by status)

**Example:**
```
GET /students?page=1&limit=10&search=john&department=Computer Science
```

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "rollNumber": "CS2024001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@student.edu",
      "phone": "9876543210",
      "dateOfBirth": "2005-01-15T00:00:00.000Z",
      "gender": "Male",
      "department": "Computer Science",
      "semester": 1,
      "batch": "2024",
      "status": "Active",
      "parentName": "Richard Doe",
      "parentPhone": "9876543211",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### 2. Get Single Student
**Endpoint:** `GET /students/:id`
**Access:** Protected

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "rollNumber": "CS2024001",
    "firstName": "John",
    "lastName": "Doe",
    // ... all student fields
  }
}
```

### 3. Create Student
**Endpoint:** `POST /students`
**Access:** Protected

**Request Body:**
```json
{
  "rollNumber": "CS2024001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@student.edu",
  "phone": "9876543210",
  "dateOfBirth": "2005-01-15",
  "gender": "Male",
  "department": "Computer Science",
  "semester": 1,
  "batch": "2024",
  "parentName": "Richard Doe",
  "parentPhone": "9876543211",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "bloodGroup": "O+",
  "status": "Active"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    // ... created student data
  }
}
```

### 4. Update Student
**Endpoint:** `PUT /students/:id`
**Access:** Protected

**Request Body:** Same as create, all fields optional

**Response (200):**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    // ... updated student data
  }
}
```

### 5. Delete Student
**Endpoint:** `DELETE /students/:id`
**Access:** Protected

**Response (200):**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

### 6. Get Student Statistics
**Endpoint:** `GET /students/stats/dashboard`
**Access:** Protected

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalStudents": 150,
    "activeStudents": 145,
    "departmentWise": [
      {
        "_id": "Computer Science",
        "count": 50
      },
      {
        "_id": "Electronics",
        "count": 45
      }
    ]
  }
}
```

---

## 👨‍🏫 Staff APIs

### 1. Get All Staff
**Endpoint:** `GET /staff`
**Access:** Protected
**Query Parameters:**
- `page`, `limit`, `search`, `department`, `designation`, `status`

**Response:** Similar structure to students API

### 2. Create Staff
**Endpoint:** `POST /staff`
**Access:** Protected

**Request Body:**
```json
{
  "employeeId": "EMP001",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@college.edu",
  "phone": "9876543212",
  "dateOfBirth": "1985-05-20",
  "gender": "Female",
  "department": "Computer Science",
  "designation": "Professor",
  "qualification": "PhD in Computer Science",
  "experience": 10,
  "joiningDate": "2020-08-01",
  "salary": 80000,
  "status": "Active",
  "subjects": ["Data Structures", "Algorithms"],
  "bloodGroup": "B+",
  "address": {
    "street": "456 Oak Ave",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400002"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Staff member created successfully",
  "data": {
    // ... created staff data
  }
}
```

### 3. Other Staff Endpoints
- `GET /staff/:id` - Get single staff
- `PUT /staff/:id` - Update staff
- `DELETE /staff/:id` - Delete staff
- `GET /staff/stats/dashboard` - Get statistics

---

## 💰 Fee Details APIs

### 1. Get All Fee Details
**Endpoint:** `GET /fees`
**Access:** Protected
**Query Parameters:**
- `page`, `limit`, `rollNumber`, `paymentStatus`, `academicYear`, `semester`

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "student": {
        "_id": "507f1f77bcf86cd799439012",
        "rollNumber": "CS2024001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@student.edu",
        "department": "Computer Science"
      },
      "rollNumber": "CS2024001",
      "academicYear": "2024-2025",
      "semester": 1,
      "feeType": "Tuition Fee",
      "totalAmount": 50000,
      "paidAmount": 25000,
      "dueAmount": 25000,
      "paymentStatus": "Partial",
      "dueDate": "2024-08-31T00:00:00.000Z",
      "paymentDate": "2024-08-15T00:00:00.000Z",
      "paymentMode": "Online Transfer",
      "transactionId": "TXN123456",
      "discount": 0,
      "fine": 0,
      "createdAt": "2024-08-01T10:00:00.000Z"
    }
  ]
}
```

### 2. Get Student Fee Details
**Endpoint:** `GET /fees/student/:rollNumber`
**Access:** Protected

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    // ... array of fee details for the student
  ]
}
```

### 3. Create Fee Detail
**Endpoint:** `POST /fees`
**Access:** Protected

**Request Body:**
```json
{
  "rollNumber": "CS2024001",
  "academicYear": "2024-2025",
  "semester": 1,
  "feeType": "Tuition Fee",
  "totalAmount": 50000,
  "paidAmount": 0,
  "dueDate": "2024-08-31",
  "paymentMode": "Not Paid",
  "discount": 0,
  "fine": 0,
  "remarks": "Semester 1 tuition fees"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Fee detail created successfully",
  "data": {
    // ... created fee detail with populated student
  }
}
```

### 4. Update Fee Detail
**Endpoint:** `PUT /fees/:id`
**Access:** Protected

**Request Body:** Same as create, all fields optional

### 5. Record Payment
**Endpoint:** `POST /fees/:id/payment`
**Access:** Protected

**Request Body:**
```json
{
  "paidAmount": 25000,
  "paymentMode": "Online Transfer",
  "transactionId": "TXN123456",
  "remarks": "First installment payment"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    // ... updated fee detail with new payment
    "receiptNumber": "REC-1642321234567-CS2024001"
  }
}
```

### 6. Get Fee Statistics
**Endpoint:** `GET /fees/stats/dashboard`
**Access:** Protected

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalFees": 200,
    "paidCount": 150,
    "pendingCount": 30,
    "overdueCount": 20,
    "amounts": {
      "totalAmount": 10000000,
      "totalPaid": 7500000,
      "totalDue": 2500000
    },
    "statusWise": [
      {
        "_id": "Paid",
        "count": 150,
        "amount": 7500000
      },
      {
        "_id": "Pending",
        "count": 30,
        "amount": 1500000
      }
    ]
  }
}
```

---

## 📊 Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Not authorized to access this route. Please login."
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "User role 'admin' is not authorized to access this route"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Student not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Server Error",
  "error": "Detailed error message"
}
```

---

## 🔑 Security Headers

All responses include security headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

## 📝 Notes

1. All dates should be in ISO 8601 format: `YYYY-MM-DD`
2. Phone numbers must be exactly 10 digits
3. Email addresses must be valid format
4. JWT tokens expire after 7 days
5. Account locks after 5 failed login attempts for 2 hours
6. Pagination default: 10 items per page
7. All amounts are in INR (₹)

---

**For more details, refer to the main README.md file**
