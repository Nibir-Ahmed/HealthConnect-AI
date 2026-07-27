const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecretjwtkey123!', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, specialty, university, licenseNumber } = req.body;

    // Admin accounts cannot be created via public registration
    if (role === 'admin') {
      return res.status(403).json({ message: 'Cannot register as an admin' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'patient',
      phone,
    });

    if (role === 'doctor') {
      const Doctor = require('../models/Doctor');
      await Doctor.create({
        userId: user.id,
        specialty: specialty || 'General Physician',
        university: university || 'Unknown University',
        licenseNumber: licenseNumber || 'PENDING',
        experience: 5,
        bio: 'New doctor at HealthConnect.',
        consultationFee: 100.00,
        isApproved: true
      });
    }

    if (user) {
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    if (role && user.role !== role) {
      return res.status(403).json({ message: `Account is not a ${role}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bloodType: user.bloodType,
        age: user.age,
        allergies: user.allergies,
        emergencyContact: user.emergencyContact,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { email, name, avatar, role } = req.body;
    let user = await User.findOne({ where: { email } });

    if (user) {
      // Update avatar if not set or just to keep it synced
      user.avatar = avatar;
      await user.save();
    } else {
      // Create new user with random password
      const randomPassword = Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'patient',
        avatar
      });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bloodType: user.bloodType,
      age: user.age,
      allergies: user.allergies,
      emergencyContact: user.emergencyContact,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during google login', error: error.message, stack: error.stack });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, bloodType, age, allergies, emergencyContact } = req.body;
    const user = await User.findByPk(req.user.id);

    if (user) {
      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.avatar = avatar || user.avatar;
      user.bloodType = bloodType || user.bloodType;
      user.age = age !== undefined ? age : user.age;
      
      if (allergies !== undefined) user.allergies = allergies;
      if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
      
      await user.save();

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        bloodType: user.bloodType,
        age: user.age,
        allergies: user.allergies,
        emergencyContact: user.emergencyContact
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};



module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  googleLogin
};
