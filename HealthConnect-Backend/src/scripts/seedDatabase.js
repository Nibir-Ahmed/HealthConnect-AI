require('dotenv').config();
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { Blog } = require('../models/Blog');

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Syncing models (Force: true)...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true }); // Warning: This drops tables if they exist!
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Creating Admin User...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@healthconnect.com',
      password: adminPassword,
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Super+Admin'
    });

    console.log('Creating Doctors...');
    const docPassword = await bcrypt.hash('doc123', 10);
    
    // Doctor 1
    const docUser1 = await User.create({
      name: 'Dr. Rafiq Hasan',
      email: 'rafiq@healthconnect.com',
      password: docPassword,
      role: 'doctor',
      phone: '+8801711000001',
      avatar: 'https://ui-avatars.com/api/?name=Rafiq+Hasan'
    });
    const doctor1 = await Doctor.create({
      userId: docUser1.id,
      specialty: 'Cardiologist',
      university: 'Dhaka Medical College',
      licenseNumber: 'DMC-12345',
      experience: 15,
      bio: 'Senior Consultant Cardiologist at DMCH with over 15 years of experience in interventional cardiology.',
      consultationFee: 1000,
      rating: 4.8,
      isApproved: true
    });

    // Doctor 2
    const docUser2 = await User.create({
      name: 'Dr. Tasnim Ara',
      email: 'tasnim@healthconnect.com',
      password: docPassword,
      role: 'doctor',
      phone: '+8801711000002',
      avatar: 'https://ui-avatars.com/api/?name=Tasnim+Ara'
    });
    const doctor2 = await Doctor.create({
      userId: docUser2.id,
      specialty: 'Gynecologist',
      university: 'Sir Salimullah Medical College',
      licenseNumber: 'SSMC-67890',
      experience: 12,
      bio: 'Specializes in high-risk pregnancies and reproductive endocrinology.',
      consultationFee: 800,
      rating: 4.9,
      isApproved: true
    });

    console.log('Creating Patients...');
    const patientPassword = await bcrypt.hash('patient123', 10);
    const patient1 = await User.create({
      name: 'John Doe',
      email: 'patient@healthconnect.com',
      password: patientPassword,
      role: 'patient',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe'
    });

    console.log('Creating Blogs...');
    await Blog.bulkCreate([
      {
        authorId: docUser1.id,
        title: '10 Heart-Healthy Foods You Should Eat Daily',
        content: `Keeping your heart healthy is one of the most important things you can do for your longevity. Adding heart-healthy foods into your daily diet is a simple yet powerful first step. Leafy green vegetables like spinach and kale are rich in vitamins, minerals, and antioxidants, notably vitamin K which protects arteries and promotes proper blood clotting.\n\nWhole grains like oatmeal, brown rice, and whole wheat are packed with soluble fiber, which actively binds to cholesterol in the digestive system and drags it out of the body before it can be absorbed. Don't forget fatty fish like salmon or mackerel, which are loaded with omega-3 fatty acids that reduce heart disease risks, lower blood pressure, and decrease triglycerides.`,
        tags: ["Heart Health", "Nutrition"],
        isPublished: true,
        coverImage: null
      },
      {
        authorId: docUser2.id,
        title: 'Pregnancy Care: Staying Healthy Week by Week',
        content: `Pregnancy is a beautiful journey that requires active care for both mother and child. Essential factors include balanced nutrition, regular low-impact exercise, and consistent prenatal checkups.\n\nEating a colorful diet rich in folic acid, iron, and calcium supports the baby's neural and skeletal development. Avoid processed foods, raw meats, and unpasteurized dairy. Light physical activity, such as walking or prenatal yoga, improves circulation and reduces pregnancy discomfort.`,
        tags: ["Pregnancy", "Women's Health"],
        isPublished: true,
        coverImage: null
      }
    ]);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
