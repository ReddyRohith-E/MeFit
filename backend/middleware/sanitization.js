const DOMPurify = require('isomorphic-dompurify');
const validator = require('validator');

/**
 * Input sanitization middleware to prevent XSS and NoSQL injection attacks
 * SRS SEC-02: Input Sanitation - MongoDB/NoSQL focused
 */
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    res.status(400).json({ message: 'Invalid input data' });
  }
};

/**
 * Recursively sanitize an object for MongoDB safety
 */
const sanitizeObject = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Prevent NoSQL injection through key names
      const cleanKey = sanitizeKey(key);
      if (cleanKey) {
        sanitized[cleanKey] = sanitizeObject(value);
      }
    }
    return sanitized;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  return obj;
};

/**
 * Sanitize object keys to prevent NoSQL injection
 */
const sanitizeKey = (key) => {
  if (typeof key !== 'string') return null;
  
  // Remove dangerous MongoDB operators and characters
  const dangerousPatterns = [
    /^\$/,           // MongoDB operators start with $
    /\./,            // Dot notation can be dangerous
    /where/i,        // JavaScript injection via $where
    /function/i,     // Function injection
    /eval/i,         // Eval injection
    /javascript/i,   // JavaScript injection
    /script/i        // Script injection
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(key)) {
      console.warn(`Dangerous key detected and removed: ${key}`);
      return null;
    }
  }
  
  // Clean the key
  return key.replace(/[^a-zA-Z0-9_]/g, '');
};

/**
 * Sanitize a string value for MongoDB and XSS prevention
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove potential XSS vectors
  let cleaned = DOMPurify.sanitize(str, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Escape HTML entities for additional XSS protection
  cleaned = validator.escape(cleaned);
  
  // Remove potential NoSQL injection patterns
  const noSqlPatterns = [
    /\$where/gi,
    /\$regex/gi,
    /javascript:/gi,
    /function\s*\(/gi,
    /eval\s*\(/gi,
    /setTimeout/gi,
    /setInterval/gi
  ];
  
  noSqlPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
};

/**
 * NoSQL injection prevention middleware for MongoDB
 */
const preventNoSQLInjection = (req, res, next) => {
  const noSqlInjectionPatterns = [
    // MongoDB operators
    /\$where/gi,
    /\$ne/gi,
    /\$in/gi,
    /\$nin/gi,
    /\$gt/gi,
    /\$gte/gi,
    /\$lt/gi,
    /\$lte/gi,
    /\$regex/gi,
    /\$exists/gi,
    /\$elemMatch/gi,
    
    // JavaScript injection patterns
    /javascript:/gi,
    /function\s*\(/gi,
    /eval\s*\(/gi,
    /setTimeout/gi,
    /setInterval/gi,
    /this\./gi,
    
    // Object prototype pollution
    /__proto__/gi,
    /constructor/gi,
    /prototype/gi
  ];

  const checkForNoSQLInjection = (value) => {
    if (typeof value === 'string') {
      return noSqlInjectionPatterns.some(pattern => pattern.test(value));
    }
    if (Array.isArray(value)) {
      return value.some(checkForNoSQLInjection);
    }
    if (value && typeof value === 'object') {
      // Check object keys for MongoDB operators
      const keys = Object.keys(value);
      if (keys.some(key => key.startsWith('$') || key.includes('.'))) {
        return true;
      }
      return Object.values(value).some(checkForNoSQLInjection);
    }
    return false;
  };

  // Check all input sources
  const inputs = [req.body, req.query, req.params];
  for (const input of inputs) {
    if (checkForNoSQLInjection(input)) {
      console.warn('NoSQL injection attempt detected:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      return res.status(400).json({ 
        message: 'Invalid input detected',
        code: 'INVALID_INPUT'
      });
    }
  }

  next();
};

/**
 * Additional security middleware to prevent prototype pollution
 */
const preventPrototypePollution = (req, res, next) => {
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  
  const checkObject = (obj, path = '') => {
    if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        if (dangerousKeys.includes(key.toLowerCase())) {
          console.warn(`Prototype pollution attempt detected at ${path}.${key}:`, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            timestamp: new Date().toISOString()
          });
          return false;
        }
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (!checkObject(obj[key], `${path}.${key}`)) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Check all input sources
  const inputs = [
    { data: req.body, name: 'body' },
    { data: req.query, name: 'query' },
    { data: req.params, name: 'params' }
  ];

  for (const { data, name } of inputs) {
    if (!checkObject(data, name)) {
      return res.status(400).json({ 
        message: 'Security violation detected',
        code: 'PROTOTYPE_POLLUTION_ATTEMPT'
      });
    }
  }

  next();
};

module.exports = {
  sanitizeInput,
  preventNoSQLInjection,
  preventPrototypePollution
};
