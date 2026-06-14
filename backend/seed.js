/**
 * Database Seeder Script
 * Run: node backend/seed.js
 * Creates one Admin, two Doctors, and three Patient demo accounts.
 */

const bcrypt = require('bcryptjs');
const { User, Doctor, EmergencyContact, Payment, Appointment } = require('./config/db');

const seed = async () => {
  console.log('🌱 Seeding database with demo accounts...\n');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('patient123', salt);

  // ── Admin ──────────────────────────────────────────────
  const existingAdmin = await User.findOne({ email: 'admin@medicare.com' });
  if (!existingAdmin) {
    await User.create({
      name: 'Super Admin',
      email: 'admin@medicare.com',
      password: await bcrypt.hash('admin123', salt),
      role: 'admin',
      phone: '+1 (555) 000-0001',
      address: 'Medicare HQ, NY',
      status: 'active'
    });
    console.log('✅ Admin created  → admin@medicare.com / admin123');
  } else {
    console.log('⏩ Admin already exists, skipping.');
  }

  // ── Doctor 1 ──────────────────────────────────────────
  let doc1User = await User.findOne({ email: 'dr.sarah@medicare.com' });
  if (!doc1User) {
    doc1User = await User.create({
      name: 'Sarah Johnson',
      email: 'dr.sarah@medicare.com',
      password: await bcrypt.hash('doctor123', salt),
      role: 'doctor',
      phone: '+1 (555) 100-2001',
      address: '10 Cardiology Wing, NY',
      status: 'active'
    });
    await Doctor.create({
      userId: doc1User._id,
      specialization: 'Cardiology',
      experience: 12,
      qualification: 'MD, FACC',
      consultationFee: 120,
      rating: 4.9,
      availability: {
        Monday: ['09:00 AM - 01:00 PM'],
        Tuesday: ['09:00 AM - 01:00 PM'],
        Wednesday: ['02:00 PM - 06:00 PM'],
        Thursday: ['09:00 AM - 01:00 PM'],
        Friday: ['09:00 AM - 01:00 PM']
      }
    });
    console.log('✅ Doctor 1 created  → dr.sarah@medicare.com / doctor123  (Cardiology)');
  } else {
    console.log('⏩ Doctor 1 already exists, skipping.');
  }

  // ── Doctor 2 ──────────────────────────────────────────
  let doc2User = await User.findOne({ email: 'dr.james@medicare.com' });
  if (!doc2User) {
    doc2User = await User.create({
      name: 'James Martinez',
      email: 'dr.james@medicare.com',
      password: await bcrypt.hash('doctor123', salt),
      role: 'doctor',
      phone: '+1 (555) 100-2002',
      address: '5 Neuro Center, NY',
      status: 'active'
    });
    await Doctor.create({
      userId: doc2User._id,
      specialization: 'Neurology',
      experience: 8,
      qualification: 'MBBS, DM Neurology',
      consultationFee: 90,
      rating: 4.7,
      availability: {
        Monday: ['10:00 AM - 02:00 PM'],
        Wednesday: ['10:00 AM - 02:00 PM'],
        Friday: ['10:00 AM - 02:00 PM']
      }
    });
    console.log('✅ Doctor 2 created  → dr.james@medicare.com / doctor123  (Neurology)');
  } else {
    console.log('⏩ Doctor 2 already exists, skipping.');
  }

  // ── Patient 1 (Alice) ──────────────────────────────────
  const existingPat1 = await User.findOne({ email: 'alice@patient.com' });
  if (!existingPat1) {
    await User.create({
      name: 'Alice Thompson',
      email: 'alice@patient.com',
      password: hashedPassword,
      role: 'patient',
      phone: '+1 (555) 200-3001',
      address: '22 Maple Ave, NY',
      status: 'active'
    });
    console.log('✅ Patient 1 created → alice@patient.com / patient123');
  } else {
    console.log('⏩ Patient 1 already exists, skipping.');
  }

  // ── Patient 2 (Bob) ──────────────────────────────────
  const existingPat2 = await User.findOne({ email: 'bob@patient.com' });
  if (!existingPat2) {
    await User.create({
      name: 'Bob Williams',
      email: 'bob@patient.com',
      password: hashedPassword,
      role: 'patient',
      phone: '+1 (555) 200-3002',
      address: '8 Oak Street, NY',
      status: 'active'
    });
    console.log('✅ Patient 2 created → bob@patient.com / patient123');
  } else {
    console.log('⏩ Patient 2 already exists, skipping.');
  }

  // ── Patient 3 (John) — Expanded profile ─────────────────
  let patient = await User.findOne({ email: 'john@patient.com' });
  if (!patient) {
    patient = await User.create({
      name: 'John Patient',
      email: 'john@patient.com',
      password: hashedPassword,
      role: 'patient',
      phone: '+1-555-0123',
      address: '123 Health St, Medical City',
      status: 'active',
      // New fields
      profilePhoto: null,
      gender: 'Male',
      dateOfBirth: '1990-05-15',
      city: 'Medical City',
      state: 'California',
      country: 'United States',
      postalCode: '90210',
      patientId: 'MED-10001',
      isVerified: true,
      bloodGroup: 'O+',
      height: '175',
      weight: '72',
      allergies: ['Penicillin', 'Peanuts'],
      chronicDiseases: ['Mild Asthma'],
      currentMedications: ['Ventolin Inhaler'],
      previousSurgeries: ['Appendectomy (2015)'],
      familyMedicalHistory: 'Father: Type 2 Diabetes. Mother: Hypertension.',
      governmentIdType: 'Passport',
      governmentIdFile: null,
      governmentIdNumber: '****1234',
    });

    // Create emergency contact for John
    await EmergencyContact.create({
      userId: patient._id,
      name: 'Jane Patient',
      relationship: 'Spouse',
      phone: '+1-555-0124',
    });

    // Create sample payment for John
    const appointments = await Appointment.find({ patientId: patient._id });
    await Payment.create({
      patientId: patient._id,
      doctorId: doc1User?._id || 'unknown',
      appointmentId: appointments[0]?._id || 'sample',
      amount: 50,
      status: 'completed',
      method: 'card',
      transactionId: 'TXN-SEED-001',
      invoiceNumber: 'INV-SEED-001',
      description: 'Initial consultation fee',
    });

    console.log('✅ Patient 3 created → john@patient.com / patient123  (Expanded profile)');
  } else {
    console.log('⏩ Patient 3 (John) already exists, skipping.');
  }

  console.log('\n🎉 Seeding complete! You can now log in with any of the above credentials.\n');
};

seed().catch(console.error);
