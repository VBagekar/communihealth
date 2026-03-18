const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  healthWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  consultationDate: {
    type: Date,
    default: Date.now
  },
  symptoms: [{
    type: String
  }],
  diagnosis: {
    type: String,
    required: true
  },
  prescription: [{
    medicine: String,
    dosage: String,
    duration: String
  }],
  followUpDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
