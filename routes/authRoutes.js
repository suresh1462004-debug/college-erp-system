const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const { protect, sendTokenResponse } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register new admin (Super admin only or first registration)
// @access  Public for first admin, then Protected
router.post('/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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

      const { username, email, password, role } = req.body;

      // Check if any admin exists
      const adminCount = await Admin.countDocuments();
      
      // If admins exist, this route should be protected (only accessible via separate protected route)
      if (adminCount > 0) {
        return res.status(403).json({
          success: false,
          message: 'Admin registration is restricted. Contact system administrator.'
        });
      }

      // Check if admin already exists
      let admin = await Admin.findOne({ $or: [{ email }, { username }] });
      if (admin) {
        return res.status(400).json({
          success: false,
          message: 'Admin with this email or username already exists'
        });
      }

      // Create first admin as superadmin
      admin = await Admin.create({
        username,
        email,
        password,
        role: adminCount === 0 ? 'superadmin' : role || 'admin'
      });

      sendTokenResponse(admin, 201, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error registering admin',
        error: error.message
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login admin
// @access  Public
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
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

      const { email, password } = req.body;

      // Find admin with password field
      const admin = await Admin.findOne({ email }).select('+password');

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if account is locked
      if (admin.isLocked()) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
        });
      }

      // Check if admin is active
      if (!admin.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Contact administrator.'
        });
      }

      // Verify password
      const isMatch = await admin.comparePassword(password);

      if (!isMatch) {
        // Increment login attempts
        await admin.incLoginAttempts();
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Reset login attempts on successful login
      await admin.resetLoginAttempts();

      sendTokenResponse(admin, 200, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error logging in',
        error: error.message
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current logged in admin
// @access  Protected
router.get('/me', protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    
    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin details',
      error: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout admin / clear cookie
// @access  Protected
router.post('/logout', protect, (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @route   PUT /api/auth/change-password
// @desc    Change admin password
// @access  Protected
router.put('/change-password', protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

      const { currentPassword, newPassword } = req.body;

      // Get admin with password
      const admin = await Admin.findById(req.admin.id).select('+password');

      // Verify current password
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      admin.password = newPassword;
      await admin.save();

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error changing password',
        error: error.message
      });
    }
  }
);

module.exports = router;
