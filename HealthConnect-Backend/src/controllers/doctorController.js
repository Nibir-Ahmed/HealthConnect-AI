const Doctor = require('../models/Doctor');
const User = require('../models/User');
const DoctorAvailability = require('../models/DoctorAvailability');

const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      where: { isApproved: true }, // Only return approved doctors
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone', 'avatar', 'isOnline']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching doctors' });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone', 'avatar', 'isOnline']
        },
        {
          model: DoctorAvailability,
          as: 'availabilities'
        }
      ]
    });
    
    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createDoctorProfile = async (req, res) => {
  try {
    // Ensuring only doctors can create doctor profiles
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create doctor profiles' });
    }

    const { specialty, university, licenseNumber, experience, bio, consultationFee } = req.body;

    const doctorExists = await Doctor.findOne({ where: { userId: req.user.id } });
    if (doctorExists) {
      return res.status(400).json({ message: 'Doctor profile already exists for this user' });
    }

    const doctor = await Doctor.create({
      userId: req.user.id,
      specialty,
      university,
      licenseNumber,
      experience,
      bio,
      consultationFee
    });

    res.status(201).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating profile' });
  }
};

const setAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can set availability' });
    }

    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const { availabilities } = req.body; // Array of { dayOfWeek, startTime, endTime }

    // Clear existing
    await DoctorAvailability.destroy({ where: { doctorId: doctor.id } });

    // Create new
    const newAvails = availabilities.map(a => ({
      doctorId: doctor.id,
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime
    }));

    await DoctorAvailability.bulkCreate(newAvails);

    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating availability' });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can update profiles' });
    }

    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const { specialty, university, licenseNumber, experience, bio, consultationFee } = req.body;

    // Update fields if provided
    if (specialty) doctor.specialty = specialty;
    if (university) doctor.university = university;
    if (licenseNumber) doctor.licenseNumber = licenseNumber;
    if (experience !== undefined) doctor.experience = experience;
    if (bio) doctor.bio = bio;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;

    await doctor.save();

    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

const getDoctorProfile = async (req, res) => {
  try {
    let doctor = await Doctor.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          attributes: ['name', 'email', 'phone', 'avatar']
        },
        {
          model: DoctorAvailability,
          as: 'availabilities'
        }
      ]
    });

    if (!doctor && req.user.role === 'doctor') {
      await Doctor.create({
        userId: req.user.id,
        specialty: 'General Physician',
        university: 'Unknown',
        licenseNumber: 'PENDING',
        experience: 0,
        bio: '',
        consultationFee: 100,
        isApproved: true
      });
      // Re-fetch with includes
      doctor = await Doctor.findOne({
        where: { userId: req.user.id },
        include: [
          { model: User, attributes: ['name', 'email', 'phone', 'avatar'] },
          { model: DoctorAvailability, as: 'availabilities' }
        ]
      });
    }

    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor profile not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctorProfile,
  setAvailability,
  updateDoctorProfile,
  getDoctorProfile
};
