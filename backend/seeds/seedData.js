const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');

const runSeed = async () => {
  try {
    console.log('Clearing existing data...');
    // Clear data to start fresh during seed
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Consultation.deleteMany({});

    console.log('Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    
    // Hash passwords for the 3 demo users
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const workerPassword = await bcrypt.hash('Worker@123', salt);
    const viewerPassword = await bcrypt.hash('Viewer@123', salt);

    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@communihealth.org',
        password: adminPassword,
        role: 'admin',
        organization: 'CommuniHealth HQ'
      },
      {
        name: 'Health Worker',
        email: 'worker@communihealth.org',
        password: workerPassword,
        role: 'health_worker',
        village: 'Wardha',
        organization: 'Asha Workers'
      },
      {
        name: 'Viewer',
        email: 'viewer@communihealth.org',
        password: viewerPassword,
        role: 'viewer'
      }
    ]);

    // Keep track of IDs for relationships
    const adminId = users[0]._id;
    const workerId = users[1]._id;

    console.log('Creating demo patients...');
    const villages = ['Wardha', 'Yavatmal', 'Nagpur', 'Amravati', 'Chandrapur'];
    
    const patientsToCreate = [];
    // Creating 10 sample patients as requested
    for (let i = 0; i < 10; i++) {
      patientsToCreate.push({
        patientId: `PT-${Date.now() + i}`, 
        name: `Demo Patient ${i + 1}`,
        age: 20 + Math.floor(Math.random() * 40),
        gender: i % 2 === 0 ? 'Male' : 'Female',
        village: villages[i % villages.length],
        district: villages[i % villages.length], // using village as district for demo purposes
        phone: `+91 98765${43210 + i}`,
        bloodGroup: ['A+', 'B+', 'O+', 'AB+'][i % 4],
        vaccines: [
          { name: 'COVID-19 Dose 1', date: new Date(), status: 'completed' },
          { name: 'COVID-19 Dose 2', date: new Date(), status: i % 2 === 0 ? 'completed' : 'pending' }
        ],
        registeredBy: workerId
      });
    }

    const createdPatients = await Patient.insertMany(patientsToCreate);

    console.log('Creating demo consultations...');
    const diagnoses = ['Malaria', 'Typhoid', 'Anemia', 'Hypertension', 'Tuberculosis'];
    
    const consultationsToCreate = createdPatients.map((patient, i) => ({
      patient: patient._id,
      healthWorker: workerId,
      // Random past date within recent past
      consultationDate: new Date(Date.now() - Math.random() * 10000000000), 
      symptoms: ['Fever', 'Fatigue', 'Cough'].slice(0, 1 + (i % 3)),
      diagnosis: diagnoses[i % diagnoses.length],
      prescription: [
        { medicine: 'Paracetamol', dosage: '500mg', duration: '5 days' },
        { medicine: 'Multivitamin', dosage: '1 tab', duration: '30 days' }
      ].slice(0, 1 + (i % 2)),
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }));

    await Consultation.insertMany(consultationsToCreate);

    console.log('Database successfully seeded!');
  } catch (error) {
    console.error('Error during seeding database:', error.message);
  }
};

// Allow running seed manually via `node seeds/seedData.js`
if (require.main === module) {
  require('dotenv').config({ path: '../.env' }); // Adjusted for running from the root or seeds directory depending on path
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => runSeed())
    .then(() => {
      console.log('Exiting...');
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runSeed };
