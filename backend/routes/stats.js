const express = require('express');
const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');
const { verifyToken, roleCheck } = require('../middleware/auth');

const router = express.Router();

const ALL_ROLES = ['admin', 'health_worker', 'viewer'];

// @route   GET /api/stats/dashboard
// @desc    Get all dashboard numbers
router.get('/dashboard', verifyToken, roleCheck(ALL_ROLES), async (req, res) => {
  try {
    const [
      totalPatients,
      totalConsultations,
      villagesArray
    ] = await Promise.all([
      Patient.countDocuments(),
      Consultation.countDocuments(),
      Patient.distinct('village')
    ]);

    const villagesCovered = villagesArray.length;

    // topDiagnoses (top 5) using aggregation
    const topDiagnosesAgg = await Consultation.aggregate([
      { $group: { _id: '$diagnosis', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const topDiagnoses = topDiagnosesAgg.map(d => ({ name: d._id, count: d.count }));

    // vaccinationCoverage % 
    // Definition: % of total patients who have at least one 'completed' vaccine
    const patientsWithCompletedVaccines = await Patient.countDocuments({
      'vaccines.status': 'completed'
    });
    
    let vaccinationCoverage = 0;
    if (totalPatients > 0) {
      vaccinationCoverage = Math.round((patientsWithCompletedVaccines / totalPatients) * 100);
    }

    // recentActivity: fetch last 5 consultations
    const recentActivity = await Consultation.find()
      .populate('patient', 'name patientId village')
      .populate('healthWorker', 'name role')
      .sort({ consultationDate: -1 })
      .limit(5)
      .exec();

    // patientsByVillage
    const patientsByVillageAgg = await Patient.aggregate([
      { $group: { _id: '$village', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const patientsByVillage = patientsByVillageAgg.map(v => ({ village: v._id, count: v.count }));

    res.json({
      totalPatients,
      totalConsultations,
      villagesCovered,
      topDiagnoses,
      vaccinationCoverage,
      recentActivity,
      patientsByVillage
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
