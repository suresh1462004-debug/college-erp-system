const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

// All routes are protected - admin only
router.use(protect);

// @route   GET /api/students
// @desc    Get all students with pagination and search
// @access  Protected
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const department = req.query.department || '';
    const status = req.query.status || '';

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { rollNumber: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = department;
    }
    
    if (status) {
      query.status = status;
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
});

// @route   GET /api/students/:id
// @desc    Get single student
// @access  Protected
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message
    });
  }
});

// @route   POST /api/students
// @desc    Create new student
// @access  Protected
router.post('/',
  [
    body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number is required'),
    body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
    body('batch').notEmpty().withMessage('Batch year is required'),
    body('parentName').trim().notEmpty().withMessage('Parent/Guardian name is required'),
    body('parentPhone').matches(/^[0-9]{10}$/).withMessage('Valid parent phone number is required')
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

      // Check if student already exists
      const existingStudent = await Student.findOne({
        $or: [
          { rollNumber: req.body.rollNumber },
          { email: req.body.email }
        ]
      });

      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student with this roll number or email already exists'
        });
      }

      // Add admin reference
      req.body.createdBy = req.admin.id;

      const student = await Student.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: student
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating student',
        error: error.message
      });
    }
  }
);

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Protected
router.put('/:id', async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check for duplicate roll number or email (excluding current student)
    if (req.body.rollNumber || req.body.email) {
      const duplicate = await Student.findOne({
        $and: [
          { _id: { $ne: req.params.id } },
          {
            $or: [
              { rollNumber: req.body.rollNumber },
              { email: req.body.email }
            ]
          }
        ]
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Roll number or email already exists'
        });
      }
    }

    student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message
    });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Protected
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
});

// @route   GET /api/students/stats/dashboard
// @desc    Get student statistics for dashboard
// @access  Protected
router.get('/stats/dashboard', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'Active' });
    const departmentWise = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        departmentWise
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

module.exports = router;
