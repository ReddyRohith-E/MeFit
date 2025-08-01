const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify admin authentication
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -twoFactorSecret');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. User not found or inactive.' 
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin privileges required.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'Invalid token.', 
      error: error.message 
    });
  }
};

// Verify admin or contributor
const verifyAdminOrContributor = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -twoFactorSecret');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. User not found or inactive.' 
      });
    }

    if (!user.isAdmin && !user.isContributor) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin or Contributor privileges required.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'Invalid token.', 
      error: error.message 
    });
  }
};

module.exports = { verifyAdmin, verifyAdminOrContributor };
