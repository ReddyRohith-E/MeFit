const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');
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

// GET /user - SRS API-03: Should return 303 See Other to user's own profile
router.get('/', auth, (req, res) => {
  res.status(303).header('Location', `${req.protocol}://${req.get('host')}/user/${req.user._id}`).end();
});

// POST /user - SRS API-03: Register a new user (moved from auth)
router.post('/', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });

    await user.save();

    // Return created user (without sensitive data)
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        isContributor: user.isContributor,
        hasProfile: false
      }
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ message: 'User creation failed' });
  }
});

// Admin-only routes (keeping legacy functionality)
// GET /user/all (admin only) - for admin panel
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

// GET /user/:user_id - SRS API-03: Returns information pertaining to the referenced user
router.get('/:user_id', auth, selfOrAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id)
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

// PATCH /user/:user_id - SRS API-03: Makes a partial update to the user object
router.patch('/:user_id', auth, selfOrAdmin, updateUserValidation, validate, async (req, res) => {
  try {
    const { firstName, lastName, email, isContributor, isAdmin } = req.body;
    const userId = req.params.user_id;

    // Check for password update attempt - should return 400 Bad Request per SRS
    if (req.body.password || req.body.passwordHash) {
      return res.status(400).json({ 
        message: 'Password updates should be done using the update_password endpoint' 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only admins can change admin/contributor status - return 403 Forbidden per SRS
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

// DELETE /user/:user_id - SRS API-03: Deletes (cascading) a user. Self and admin only.
router.delete('/:user_id', auth, selfOrAdmin, async (req, res) => {
  try {
    const userId = req.params.user_id;

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cascading delete - remove related data
    await Profile.findOneAndDelete({ user: userId });
    await Notification.deleteMany({ userId: userId });
    
    // Soft delete user
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    res.status(204).end(); // 204 No Content per SRS
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// POST /user/:user_id/update_password - SRS API-03: Update a user's password
router.post('/:user_id/update_password', auth, selfOrAdmin, updatePasswordValidation, validate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.user_id;

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

    res.status(204).end(); // 204 No Content per SRS
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
});

// POST /user/:user_id/request-contributor
router.post('/:user_id/request-contributor', auth, selfOrAdmin, async (req, res) => {
  try {
    const userId = req.params.user_id;
    const { applicationText } = req.body;

    if (!applicationText || applicationText.trim().length < 50) {
      return res.status(400).json({ 
        message: 'Application text is required and must be at least 50 characters' 
      });
    }

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
    user.contributorApplicationText = applicationText.trim();
    user.contributorRequestDate = new Date();
    await user.save();

    // Create notification for admins
    await Notification.create({
      type: 'contributor_request',
      title: 'New Contributor Request',
      message: `${user.firstName} ${user.lastName} has requested contributor access`,
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      priority: 'medium',
      data: {
        applicationText: applicationText.trim(),
        requestDate: new Date()
      }
    });

    res.status(201).json({ message: 'Contributor request submitted successfully' });
  } catch (error) {
    console.error('Request contributor error:', error);
    res.status(500).json({ message: 'Failed to submit contributor request' });
  }
});

// GET /user/contributor-requests/pending (admin only)
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

// PATCH /user/:user_id/approve-contributor (admin only)
router.patch('/:user_id/approve-contributor', auth, admin, async (req, res) => {
  try {
    const { approved } = req.body;
    const userId = req.params.user_id;

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

// DELETE /user/:user_id
router.delete('/:user_id', auth, selfOrAdmin, async (req, res) => {
  try {
    const userId = req.params.user_id;

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cascading delete - remove related data
    await Profile.findOneAndDelete({ user: userId });
    await Notification.deleteMany({ userId: userId });
    
    // Soft delete user
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    res.status(204).end(); // 204 No Content per SRS
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
