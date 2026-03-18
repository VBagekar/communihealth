const express = require('express');
const { body, validationResult } = require('express-validator');
const Consultation = require('../models/Consultation');
const Patient = require('../models/Patient');
const { verifyToken, roleCheck } = require('../middleware/auth');

const router = express.Router();

const ALL_ROLES = ['admin', 'health_worker', 'viewer'];
const WORKER_ROLES = ['admin', 'health_worker'];

// @route   POST /api/consultations
// @desc    Create a consultation
router.post('/', verifyToken, roleCheck(WORKER_ROLES), [
  body('patient', 'Patient ID is required').not().isEmpty(),
  body('diagnosis', 'Diagnosis is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    // Check if patient exists
    const patient = await Patient.findById(req.body.patient);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const consultationData = {
      ...req.body,
      healthWorker: req.user.id
    };

    const consultation = new Consultation(consultationData);
    await consultation.save();
    
    // Populate before returning
    await consultation.populate([
      { path: 'patient', select: 'name patientId age gender village' },
      { path: 'healthWorker', select: 'name role' }
    ]);

    res.status(201).json(consultation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/consultations/recent
// @desc    Get last 20 consultations
router.get('/recent', verifyToken, roleCheck(ALL_ROLES), async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('patient', 'name patientId age gender village')
      .populate('healthWorker', 'name role')
      .sort({ consultationDate: -1 })
      .limit(20)
      .exec();
    
    res.json(consultations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/consultations/patient/:id
// @desc    Get a patient's consultations
router.get('/patient/:id', verifyToken, roleCheck(ALL_ROLES), async (req, res) => {
  try {
    const consultations = await Consultation.find({ patient: req.params.id })
      .populate('patient', 'name patientId age gender village')
      .populate('healthWorker', 'name role')
      .sort({ consultationDate: -1 })
      .exec();
      
    res.json(consultations);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Patient not found' });
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/consultations/:id
// @desc    Get consultation by ID
router.get('/:id', verifyToken, roleCheck(ALL_ROLES), async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('patient', 'name patientId age gender village district phone')
      .populate('healthWorker', 'name role');
      
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    
    res.json(consultation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Consultation not found' });
    res.status(500).send('Server Error');
  }
});

module.exports = router;
