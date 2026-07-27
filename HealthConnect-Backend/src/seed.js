const { sequelize } = require('./config/database');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const { Blog } = require('./models/Blog');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    await sequelize.sync({ force: true }); // Reset database
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
    console.log('Database synced.');

    // Create test user (patient)
    const patientPassword = await bcrypt.hash('password123', 10);
    const patient = await User.create({
      name: 'John Doe',
      email: 'patient@test.com',
      password: patientPassword,
      role: 'patient',
      phone: '1234567890'
    });

    // Create doctors
    const doctorPassword = await bcrypt.hash('docpassword', 10);
    const doctorUser1 = await User.create({
      name: 'Dr. Sarah Connor',
      email: 'sarah.connor@test.com',
      password: doctorPassword,
      role: 'doctor',
      phone: '9876543210',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    });
    
    await Doctor.create({
      userId: doctorUser1.id,
      specialty: 'Cardiologist',
      university: 'Harvard Medical School',
      experience: 15,
      bio: 'Expert in heart-related conditions and preventive care.',
      consultationFee: 150.00,
      rating: 4.8
    });

    const doctorUser2 = await User.create({
      name: 'Dr. Gregory House',
      email: 'house@test.com',
      password: doctorPassword,
      role: 'doctor',
      phone: '1112223333',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    });
    
    await Doctor.create({
      userId: doctorUser2.id,
      specialty: 'Diagnostician',
      university: 'Johns Hopkins',
      experience: 20,
      bio: 'Specializes in rare diseases and complex cases.',
      consultationFee: 200.00,
      rating: 4.9
    });

    // Create blogs
    await Blog.create({
      authorId: doctorUser1.id,
      title: '5 Tips for a Healthy Heart',
      content: 'Eating a balanced diet, exercising regularly, managing stress, avoiding smoking, and getting enough sleep are crucial for heart health.',
      coverImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      tags: ['Heart Health', 'Wellness']
    });

    console.log('✅ Database seeded successfully with dummy data.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    process.exit(1);
  }
}

seedDatabase();
