const mongoose = require('mongoose');

const feeDetailSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required']
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 8
  },
  feeType: {
    type: String,
    required: [true, 'Fee type is required'],
    enum: ['Tuition Fee', 'Library Fee', 'Lab Fee', 'Sports Fee', 'Exam Fee', 'Development Fee', 'Transport Fee', 'Hostel Fee', 'Other']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  dueAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Overdue'],
    default: 'Pending'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  paymentDate: {
    type: Date
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Cheque', 'Online Transfer', 'Card', 'UPI', 'Not Paid'],
    default: 'Not Paid'
  },
  transactionId: {
    type: String
  },
  receiptNumber: {
    type: String
  },
  remarks: {
    type: String
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  fine: {
    type: Number,
    default: 0,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Calculate due amount before saving
feeDetailSchema.pre('save', function(next) {
  this.dueAmount = this.totalAmount - this.paidAmount + this.fine - this.discount;
  
  // Update payment status
  if (this.paidAmount === 0) {
    this.paymentStatus = 'Pending';
  } else if (this.paidAmount >= this.totalAmount + this.fine - this.discount) {
    this.paymentStatus = 'Paid';
  } else {
    this.paymentStatus = 'Partial';
  }
  
  // Check if overdue
  if (this.dueAmount > 0 && new Date() > this.dueDate) {
    this.paymentStatus = 'Overdue';
  }
  
  next();
});

// Index for faster searches
feeDetailSchema.index({ student: 1, rollNumber: 1, academicYear: 1 });

module.exports = mongoose.model('FeeDetail', feeDetailSchema);
