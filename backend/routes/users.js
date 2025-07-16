const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { auth, admin, selfOrAdmin } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// Update password validation
const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Update user validation
const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

// GET /api/users (redirect to current user)
router.get('/', auth, (req, res) => {
  res.status(303).json({
    message: 'Redirecting to current user',
    location: `/api/users/${req.user._id}`
  });
});

// GET /api/users/all (admin only)
router.get('/all', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = 'all' } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role !== 'all') {
      if (role === 'admin') query.isAdmin = true;
      else if (role === 'contributor') query.isContributor = true;
      else if (role === 'user') query = { ...query, isAdmin: false, isContributor: false };
    }

    const users = await User.find(query)
      .select('-password -twoFactorSecret')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
});

// GET /api/users/:userId
router.get('/:userId', auth, selfOrAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -twoFactorSecret');

    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get profile if exists
    const profile = await Profile.findOne({ user: user._id });

    res.json({
      user: {
        ...user.toJSON(),
        hasProfile: !!profile
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to retrieve user' });
  }
});

// PATCH /api/users/:userId
router.patch('/:userId', auth, selfOrAdmin, updateUserValidation, validate, async (req, res) => {
  try {
    const { firstName, lastName, email, isContributor, isAdmin } = req.body;
    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only admins can change admin/contributor status
    if ((isContributor !== undefined || isAdmin !== undefined) && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admins can change user roles' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (isContributor !== undefined) updateData.isContributor = isContributor;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret');

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// POST /api/users/:userId/update-password
router.post('/:userId/update-password', auth, selfOrAdmin, updatePasswordValidation, validate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If not admin and trying to update someone else's password, require current password
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If updating own password, verify current password
    if (req.user._id.toString() === userId) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
});

// POST /api/users/:userId/request-contributor
router.post('/:userId/request-contributor', auth, selfOrAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isContributor) {
      return res.status(400).json({ message: 'User is already a contributor' });
    }

    if (user.contributorRequestPending) {
      return res.status(400).json({ message: 'Contributor request already pending' });
    }

    user.contributorRequestPending = true;
    await user.save();

    res.json({ message: 'Contributor request submitted successfully' });
  } catch (error) {
    console.error('Request contributor error:', error);
    res.status(500).json({ message: 'Failed to submit contributor request' });
  }
});

// GET /api/users/contributor-requests (admin only)
router.get('/contributor-requests/pending', auth, admin, async (req, res) => {
  try {
    const users = await User.find({ 
      contributorRequestPending: true,
      isActive: true
    }).select('-password -twoFactorSecret');

    res.json({ users });
  } catch (error) {
    console.error('Get contributor requests error:', error);
    res.status(500).json({ message: 'Failed to retrieve contributor requests' });
  }
});

// PATCH /api/users/:userId/approve-contributor (admin only)
router.patch('/:userId/approve-contributor', auth, admin, async (req, res) => {
  try {
    const { approved } = req.body;
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.contributorRequestPending = false;
    if (approved) {
      user.isContributor = true;
    }
    await user.save();

    res.json({ 
      message: approved ? 'Contributor request approved' : 'Contributor request rejected',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Approve contributor error:', error);
    res.status(500).json({ message: 'Failed to process contributor request' });
  }
});

// DELETE /api/users/:userId
router.delete('/:userId', auth, selfOrAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    // Also delete profile if exists
    await Profile.findOneAndDelete({ user: userId });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
