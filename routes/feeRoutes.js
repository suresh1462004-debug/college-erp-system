const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const FeeDetail = require('../models/FeeDetail');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

// All routes are protected - admin only
router.use(protect);

// @route   GET /api/fees
// @desc    Get all fee details with pagination and filters
// @access  Protected
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const rollNumber = req.query.rollNumber || '';
    const paymentStatus = req.query.paymentStatus || '';
    const academicYear = req.query.academicYear || '';
    const semester = req.query.semester || '';

    // Build query
    let query = {};
    
    if (rollNumber) {
      query.rollNumber = { $regex: rollNumber, $options: 'i' };
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (academicYear) {
      query.academicYear = academicYear;
    }
    
    if (semester) {
      query.semester = parseInt(semester);
    }

    const total = await FeeDetail.countDocuments(query);
    const fees = await FeeDetail.find(query)
      .populate('student', 'rollNumber firstName lastName email department')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.status(200).json({
      success: true,
      count: fees.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: fees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fee details',
      error: error.message
    });
  }
});

// @route   GET /api/fees/:id
// @desc    Get single fee detail
// @access  Protected
router.get('/:id', async (req, res) => {
  try {
    const fee = await FeeDetail.findById(req.params.id)
      .populate('student', 'rollNumber firstName lastName email phone department semester')
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee detail not found'
      });
    }

    res.status(200).json({
      success: true,
      data: fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fee detail',
      error: error.message
    });
  }
});

// @route   GET /api/fees/student/:rollNumber
// @desc    Get all fee details for a student
// @access  Protected
router.get('/student/:rollNumber', async (req, res) => {
  try {
    const fees = await FeeDetail.find({ rollNumber: req.params.rollNumber })
      .populate('student', 'rollNumber firstName lastName email department')
      .sort({ academicYear: -1, semester: -1 });

    res.status(200).json({
      success: true,
      count: fees.length,
      data: fees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student fee details',
      error: error.message
    });
  }
});

// @route   POST /api/fees
// @desc    Create new fee detail
// @access  Protected
router.post('/',
  [
    body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
    body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
    body('feeType').notEmpty().withMessage('Fee type is required'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be positive'),
    body('dueDate').isISO8601().withMessage('Valid due date is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      // Find student by roll number
      const student = await Student.findOne({ rollNumber: req.body.rollNumber });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found with this roll number'
        });
      }

      // Check if fee detail already exists for same student, year, semester, and fee type
      const existingFee = await FeeDetail.findOne({
        rollNumber: req.body.rollNumber,
        academicYear: req.body.academicYear,
        semester: req.body.semester,
        feeType: req.body.feeType
      });

      if (existingFee) {
        return res.status(400).json({
          success: false,
          message: 'Fee detail already exists for this student, academic year, semester, and fee type'
        });
      }

      // Add student reference and admin reference
      req.body.student = student._id;
      req.body.createdBy = req.admin.id;

      const fee = await FeeDetail.create(req.body);

      // Populate before sending response
      await fee.populate('student', 'rollNumber firstName lastName email department');

      res.status(201).json({
        success: true,
        message: 'Fee detail created successfully',
        data: fee
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating fee detail',
        error: error.message
      });
    }
  }
);

// @route   PUT /api/fees/:id
// @desc    Update fee detail (including payment)
// @access  Protected
router.put('/:id', async (req, res) => {
  try {
    let fee = await FeeDetail.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee detail not found'
      });
    }

    // Add updated by reference
    req.body.updatedBy = req.admin.id;

    // If payment is being made, add payment date
    if (req.body.paidAmount && req.body.paidAmount > fee.paidAmount) {
      req.body.paymentDate = new Date();
    }

    fee = await FeeDetail.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('student', 'rollNumber firstName lastName email department');

    res.status(200).json({
      success: true,
      message: 'Fee detail updated successfully',
      data: fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating fee detail',
      error: error.message
    });
  }
});

// @route   DELETE /api/fees/:id
// @desc    Delete fee detail
// @access  Protected
router.delete('/:id', async (req, res) => {
  try {
    const fee = await FeeDetail.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee detail not found'
      });
    }

    await FeeDetail.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Fee detail deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting fee detail',
      error: error.message
    });
  }
});

// @route   GET /api/fees/stats/dashboard
// @desc    Get fee statistics for dashboard
// @access  Protected
router.get('/stats/dashboard', async (req, res) => {
  try {
    const totalFees = await FeeDetail.countDocuments();
    const paidCount = await FeeDetail.countDocuments({ paymentStatus: 'Paid' });
    const pendingCount = await FeeDetail.countDocuments({ paymentStatus: 'Pending' });
    const overdueCount = await FeeDetail.countDocuments({ paymentStatus: 'Overdue' });
    
    // Calculate total amounts
    const amountStats = await FeeDetail.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' }
        }
      }
    ]);

    // Payment status wise
    const statusWise = await FeeDetail.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalFees,
        paidCount,
        pendingCount,
        overdueCount,
        amounts: amountStats[0] || { totalAmount: 0, totalPaid: 0, totalDue: 0 },
        statusWise
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// @route   POST /api/fees/:id/payment
// @desc    Record payment for fee
// @access  Protected
router.post('/:id/payment',
  [
    body('paidAmount').isFloat({ min: 0 }).withMessage('Paid amount must be positive'),
    body('paymentMode').isIn(['Cash', 'Cheque', 'Online Transfer', 'Card', 'UPI']).withMessage('Invalid payment mode')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      let fee = await FeeDetail.findById(req.params.id);

      if (!fee) {
        return res.status(404).json({
          success: false,
          message: 'Fee detail not found'
        });
      }

      const { paidAmount, paymentMode, transactionId, remarks } = req.body;

      // Update fee with payment details
      fee.paidAmount += parseFloat(paidAmount);
      fee.paymentMode = paymentMode;
      fee.paymentDate = new Date();
      fee.transactionId = transactionId || fee.transactionId;
      fee.remarks = remarks || fee.remarks;
      fee.updatedBy = req.admin.id;

      // Generate receipt number if fully paid
      if (fee.paidAmount >= fee.totalAmount + fee.fine - fee.discount) {
        fee.receiptNumber = `REC-${Date.now()}-${fee.rollNumber}`;
      }

      await fee.save();
      await fee.populate('student', 'rollNumber firstName lastName email department');

      res.status(200).json({
        success: true,
        message: 'Payment recorded successfully',
        data: fee
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error recording payment',
        error: error.message
      });
    }
  }
);

module.exports = router;
