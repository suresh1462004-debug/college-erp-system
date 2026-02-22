const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'IT', 'MBA', 'BBA', 'Administration', 'Library', 'Sports', 'Accounts']
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Lab Assistant', 'HOD', 'Principal', 'Vice Principal', 'Librarian', 'Clerk', 'Accountant', 'Peon']
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required']
  },
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: 0
  },
  joiningDate: {
    type: Date,
    required: [true, 'Joining date is required'],
    default: Date.now
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave', 'Resigned'],
    default: 'Active'
  },
  subjects: [{
    type: String
  }],
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  photoUrl: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Index for faster searches
staffSchema.index({ employeeId: 1, email: 1 });

module.exports = mongoose.model('Staff', staffSchema);
