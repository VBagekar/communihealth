const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
  gender: {
    type: String
  },
  village: {
    type: String
  },
  district: {
    type: String
  },
  phone: {
    type: String
  },
  bloodGroup: {
    type: String
  },
  vaccines: [{
    name: String,
    date: Date,
    status: {
      type: String,
      enum: ['completed', 'pending', 'overdue']
    }
  }],
  medicalHistory: [{
    type: String
  }],
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Pre-save hook to auto-generate patientId
patientSchema.pre('save', function(next) {
  if (!this.patientId) {
    this.patientId = 'PT-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
