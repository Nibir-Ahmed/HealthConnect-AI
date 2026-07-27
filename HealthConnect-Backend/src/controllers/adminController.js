const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { Blog } = require('../models/Blog');

const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await User.count({ where: { role: 'patient' } });
    const totalDoctors = await User.count({ where: { role: 'doctor' } });
    const totalAppointments = await Appointment.count();
    const totalBlogs = await Blog.count();

    res.json({
      patients: totalPatients,
      doctors: totalDoctors,
      appointments: totalAppointments,
      blogs: totalBlogs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      where: { isApproved: false },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'phone'] }]
    });
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    doctor.isApproved = true;
    await doctor.save();
    res.json({ message: 'Doctor approved successfully', doctor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getPendingDoctors,
  approveDoctor,
  getAllUsers
};
