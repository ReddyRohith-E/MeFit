const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  addressLine1: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  addressLine2: {
    type: String,
    trim: true,
    maxlength: 100,
    default: null
  },
  addressLine3: {
    type: String,
    trim: true,
    maxlength: 100,
    default: null
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    default: 'South Africa'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
addressSchema.index({ user: 1 });

module.exports = mongoose.model('Address', addressSchema);
