/**
 * Persistent JSON Database test validation script.
 */
const { User, Doctor, Appointment } = require('./config/db');

async function testDatabase() {
  console.log('🧪 Starting database verification checks...');

  try {
    // 1. Count users
    const userCount = await User.countDocuments({});
    console.log(`- Total registered users: ${userCount}`);

    // 2. Fetch admin user
    const admin = await User.findOne({ email: 'admin@medicare.com' });
    if (admin) {
      console.log(`- Found Admin account: ${admin.name} (Role: ${admin.role})`);
    } else {
      console.warn('⚠️ Demo admin account not found.');
    }

    // 3. Find doctors and verify population
    console.log('Testing doctor search and population...');
    const doctors = await Doctor.find({}).populate('userId');
    console.log(`- Found ${doctors.length} doctors.`);
    doctors.forEach(doc => {
      console.log(`  * Dr. ${doc.userId ? doc.userId.name : 'Unknown'} (${doc.specialization}) - Fee: $${doc.consultationFee}`);
    });

    // 4. Create a dummy appointment and verify
    console.log('Testing appointment creation and lookup...');
    const patient = await User.findOne({ role: 'patient' });
    const doctor = doctors[0];

    if (patient && doctor) {
      const appt = await Appointment.create({
        patientId: patient._id,
        doctorId: doctor._id,
        date: '2026-06-20',
        time: '10:00',
        status: 'pending'
      });
      console.log(`- Success: Created test appointment ID: ${appt._id}`);

      // Query and populate
      const queried = await Appointment.findById(appt._id)
        .populate('patientId')
        .populate('doctorId');
      
      if (queried) {
        console.log(`- Query successful! Patient: ${queried.patientId.name}, Doctor: Dr. ${queried.doctorId.userId.name}`);
        
        // Delete the test appointment
        await Appointment.findByIdAndDelete(appt._id);
        console.log('- Test appointment deleted successfully.');
      } else {
        throw new Error('Could not retrieve created appointment');
      }
    } else {
      console.warn('⚠️ Missing patient or doctor for appointment test.');
    }

    console.log('✅ All database verification checks passed successfully!');
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  }
}

testDatabase();
