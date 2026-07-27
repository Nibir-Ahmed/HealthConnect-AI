const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const Doctor = require('./src/models/Doctor');
const DoctorAvailability = require('./src/models/DoctorAvailability');
require('dotenv').config();

const dummyDoctors = [
  {
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@healthconnect.com',
    specialty: 'Cardiologist',
    university: 'Harvard Medical School',
    licenseNumber: 'MD1029384',
    experience: 12,
    bio: 'Specializing in heart disease prevention and minimally invasive cardiovascular procedures with over a decade of clinical excellence.',
    consultationFee: 150.00,
    rating: 4.9,
    avatar: 'http://localhost:5000/uploads/doctors/doc_1_cardiologist_1784745594469.jpg'
  },
  {
    name: 'Dr. Emily Chen',
    email: 'emily.chen@healthconnect.com',
    specialty: 'Dermatologist',
    university: 'Stanford University',
    licenseNumber: 'MD5928374',
    experience: 8,
    bio: 'Board-certified dermatologist focusing on medical and cosmetic dermatology, including advanced laser therapies.',
    consultationFee: 120.00,
    rating: 4.8,
    avatar: 'http://localhost:5000/uploads/doctors/doc_2_dermatologist_1784745609704.jpg'
  },
  {
    name: 'Dr. Michael Roberts',
    email: 'michael.roberts@healthconnect.com',
    specialty: 'Pediatrician',
    university: 'Johns Hopkins University',
    licenseNumber: 'MD2384759',
    experience: 15,
    bio: 'Dedicated pediatrician providing comprehensive care for infants, children, and adolescents. Passionate about early childhood development.',
    consultationFee: 100.00,
    rating: 5.0,
    avatar: 'http://localhost:5000/uploads/doctors/doc_3_pediatrician_1784745623520.jpg'
  },
  {
    name: 'Dr. William Carter',
    email: 'william.carter@healthconnect.com',
    specialty: 'General Physician',
    university: 'UCSF School of Medicine',
    licenseNumber: 'MD4829103',
    experience: 20,
    bio: 'Primary care physician with a holistic approach to adult medicine and chronic disease management.',
    consultationFee: 80.00,
    rating: 4.7,
    avatar: 'http://localhost:5000/uploads/doctors/doc_4_physician_1784745637619.jpg'
  },
  {
    name: 'Dr. Olivia Martinez',
    email: 'olivia.martinez@healthconnect.com',
    specialty: 'Neurologist',
    university: 'Yale School of Medicine',
    licenseNumber: 'MD7482931',
    experience: 10,
    bio: 'Expert in treating complex neurological disorders including migraines, epilepsy, and neurodegenerative diseases.',
    consultationFee: 180.00,
    rating: 4.9,
    avatar: 'http://localhost:5000/uploads/doctors/doc_5_neurologist_1784745650022.jpg'
  },
  {
    name: 'Dr. James Wilson',
    email: 'james.wilson@healthconnect.com',
    specialty: 'Psychiatrist',
    university: 'Columbia University',
    licenseNumber: 'MD9384752',
    experience: 14,
    bio: 'Compassionate psychiatrist specializing in anxiety, depression, and cognitive behavioral therapy (CBT).',
    consultationFee: 140.00,
    rating: 4.8,
    avatar: 'http://localhost:5000/uploads/doctors/doc_6_psychiatrist_1784745682183.jpg'
  },
  {
    name: 'Dr. Richard Davis',
    email: 'richard.davis@healthconnect.com',
    specialty: 'Orthopedic',
    university: 'Mayo Clinic Alix School of Medicine',
    licenseNumber: 'MD1928374',
    experience: 18,
    bio: 'Orthopedic surgeon highly skilled in sports injuries, joint replacement, and trauma surgery.',
    consultationFee: 200.00,
    rating: 4.9,
    avatar: 'http://localhost:5000/uploads/doctors/doc_7_orthopedic_1784745695064.jpg'
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // We do NOT drop tables to avoid deleting real users/patients.
    // We just insert if they don't exist.
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    let doctorsAdded = 0;

    for (const doc of dummyDoctors) {
      // Check if user exists
      let user = await User.findOne({ where: { email: doc.email } });
      
      if (!user) {
        user = await User.create({
          name: doc.name,
          email: doc.email,
          password: hashedPassword,
          role: 'doctor',
          avatar: doc.avatar,
          phone: '+1 (555) 000-' + Math.floor(1000 + Math.random() * 9000)
        });

        // Add doctor profile
        const doctorProfile = await Doctor.create({
          userId: user.id,
          specialty: doc.specialty,
          university: doc.university,
          licenseNumber: doc.licenseNumber,
          experience: doc.experience,
          bio: doc.bio,
          consultationFee: doc.consultationFee,
          rating: doc.rating,
          isApproved: true,
          // Shift createdAt back so they appear AFTER any real new doctors
          createdAt: new Date(Date.now() - 100000000)
        });

        // Add sample availabilities (Mon-Fri, 9AM to 5PM)
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const avails = days.map(day => ({
          doctorId: doctorProfile.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00'
        }));
        await DoctorAvailability.bulkCreate(avails);

        doctorsAdded++;
      }
    }

    console.log(`✅ Seeding complete. Added ${doctorsAdded} new doctors.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
