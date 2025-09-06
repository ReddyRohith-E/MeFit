const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
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

    // SRS SEC-01: 2FA should be enforced
    if (!user.twoFactorEnabled && req.path !== '/api/2fa/setup' && req.path !== '/api/2fa/verify') {
      return res.status(401).json({ 
        message: '2FA is required. Please set up two-factor authentication.',
        requiresTwoFactorSetup: true 
      });
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

// SRS SEC-01: Enhanced 2FA verification middleware for sensitive operations
const require2FA = async (req, res, next) => {
  try {
    if (!req.user.twoFactorEnabled) {
      return res.status(401).json({ 
        message: '2FA is required for this operation.',
        requires2FA: true 
      });
    }

    const twoFactorToken = req.headers['x-2fa-token'];
    if (!twoFactorToken) {
      return res.status(401).json({ 
        message: '2FA verification required. Provide token in x-2fa-token header.',
        requires2FA: true 
      });
    }

    // Verify 2FA token
    const verified = speakeasy.totp.verify({
      secret: req.user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorToken,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({ 
        message: 'Invalid 2FA token.',
        requires2FA: true 
      });
    }

    next();
  } catch (error) {
    console.error('2FA verification error:', error);
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
  require2FA,
  admin,
  contributor,
  selfOrAdmin
};
