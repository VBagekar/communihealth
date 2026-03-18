const express = require('express');
const { body, validationResult } = require('express-validator');
const { Parser } = require('json2csv');
const Patient = require('../models/Patient');
const { verifyToken, roleCheck } = require('../middleware/auth');

const router = express.Router();

const ALL_ROLES = ['admin', 'health_worker', 'viewer'];
const WORKER_ROLES = ['admin', 'health_worker'];
const ADMIN_ROLE = ['admin'];

// @route   POST /api/patients
// @desc    Create a new patient
router.post('/', verifyToken, roleCheck(WORKER_ROLES), [
  body('name', 'Name is required').not().isEmpty(),
  body('age', 'Age is required').isNumeric(),
  body('gender', 'Gender is required').not().isEmpty(),
  body('village', 'Village is required').not().isEmpty(),
  body('district', 'District is required').not().isEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const patientData = { ...req.body, registeredBy: req.user.id };
    const patient = new Patient(patientData);
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/patients
// @desc    List + search + filter patients (with pagination)
router.get('/', verifyToken, roleCheck(ALL_ROLES), async (req, res) => {
  try {
    // Pagination defaults
    const { page = 1, limit = 10, name, village, gender } = req.query;
    const query = {};

    // Filters and case-insensitive regex search
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (village) {
      query.village = { $regex: village, $options: 'i' };
    }
    if (gender) {
      query.gender = gender;
    }

    const patients = await Patient.find(query)
      .populate('registeredBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Patient.countDocuments(query);

    res.json({
      patients,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalCount: count
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/patients/export/csv
// @desc    Export all patients as CSV
router.get('/export/csv', verifyToken, roleCheck(ADMIN_ROLE), async (req, res) => {
  try {
    const patients = await Patient.find().lean().exec();
    if (!patients || patients.length === 0) {
      return res.status(404).json({ message: 'No patients found to export' });
    }

    const fields = ['patientId', 'name', 'age', 'gender', 'village', 'district', 'phone', 'bloodGroup', 'createdAt'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(patients);

    res.header('Content-Type', 'text/csv');
    res.attachment('patients.csv');
    return res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient details
router.get('/:id', verifyToken, roleCheck(ALL_ROLES), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('registeredBy', 'name role');
    
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Patient not found' });
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/patients/:id
// @desc    Update patient
router.patch('/:id', verifyToken, roleCheck(WORKER_ROLES), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // Return the updated document
    );
    
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Patient not found' });
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/patients/:id/vaccines
// @desc    Add vaccine to patient
router.post('/:id/vaccines', verifyToken, roleCheck(WORKER_ROLES), [
  body('name', 'Vaccine name is required').not().isEmpty(),
  body('date', 'Date is required').not().isEmpty(),
  body('status', 'Status is required').isIn(['completed', 'pending', 'overdue'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    patient.vaccines.push(req.body);
    await patient.save();

    res.json(patient);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Patient not found' });
    res.status(500).send('Server Error');
  }
});

module.exports = router;
