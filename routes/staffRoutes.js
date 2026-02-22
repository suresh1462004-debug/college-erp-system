const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Staff = require('../models/Staff');
const { protect } = require('../middleware/auth');

// All routes are protected - admin only
router.use(protect);

// @route   GET /api/staff
// @desc    Get all staff with pagination and search
// @access  Protected
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const department = req.query.department || '';
    const designation = req.query.designation || '';
    const status = req.query.status || '';

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { employeeId: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = department;
    }
    
    if (designation) {
      query.designation = designation;
    }
    
    if (status) {
      query.status = status;
    }

    const total = await Staff.countDocuments(query);
    const staff = await Staff.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.status(200).json({
      success: true,
      count: staff.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching staff',
      error: error.message
    });
  }
});

// @route   GET /api/staff/:id
// @desc    Get single staff member
// @access  Protected
router.get('/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching staff member',
      error: error.message
    });
  }
});

// @route   POST /api/staff
// @desc    Create new staff member
// @access  Protected
router.post('/',
  [
    body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number is required'),
    body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('designation').notEmpty().withMessage('Designation is required'),
    body('qualification').trim().notEmpty().withMessage('Qualification is required'),
    body('experience').isInt({ min: 0 }).withMessage('Experience must be a positive number'),
    body('salary').isFloat({ min: 0 }).withMessage('Salary must be a positive number')
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

      // Check if staff already exists
      const existingStaff = await Staff.findOne({
        $or: [
          { employeeId: req.body.employeeId },
          { email: req.body.email }
        ]
      });

      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: 'Staff member with this employee ID or email already exists'
        });
      }

      // Add admin reference
      req.body.createdBy = req.admin.id;

      const staff = await Staff.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Staff member created successfully',
        data: staff
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating staff member',
        error: error.message
      });
    }
  }
);

// @route   PUT /api/staff/:id
// @desc    Update staff member
// @access  Protected
router.put('/:id', async (req, res) => {
  try {
    let staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check for duplicate employee ID or email (excluding current staff)
    if (req.body.employeeId || req.body.email) {
      const duplicate = await Staff.findOne({
        $and: [
          { _id: { $ne: req.params.id } },
          {
            $or: [
              { employeeId: req.body.employeeId },
              { email: req.body.email }
            ]
          }
        ]
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID or email already exists'
        });
      }
    }

    staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating staff member',
      error: error.message
    });
  }
});

// @route   DELETE /api/staff/:id
// @desc    Delete staff member
// @access  Protected
router.delete('/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    await Staff.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting staff member',
      error: error.message
    });
  }
});

// @route   GET /api/staff/stats/dashboard
// @desc    Get staff statistics for dashboard
// @access  Protected
router.get('/stats/dashboard', async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments();
    const activeStaff = await Staff.countDocuments({ status: 'Active' });
    const departmentWise = await Staff.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);
    const designationWise = await Staff.aggregate([
      {
        $group: {
          _id: '$designation',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStaff,
        activeStaff,
        departmentWise,
        designationWise
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
