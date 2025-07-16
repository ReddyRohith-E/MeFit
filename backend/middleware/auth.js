const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const admin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

const contributor = (req, res, next) => {
  if (!req.user.isContributor && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Contributor privileges required.' });
  }
  next();
};

const selfOrAdmin = (req, res, next) => {
  const userId = req.params.userId || req.params.id;
  
  if (req.user._id.toString() !== userId && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. You can only access your own resources.' });
  }
  next();
};

module.exports = {
  auth,
  admin,
  contributor,
  selfOrAdmin
};
