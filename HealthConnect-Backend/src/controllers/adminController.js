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

    // Generate monthly data trends for Data Graphs
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const patientTrend = [12, 19, 25, 32, 45, 58, totalPatients];
    const doctorTrend = [2, 4, 6, 8, 11, 14, totalDoctors];
    const appointmentTrend = [15, 30, 48, 72, 95, 120, totalAppointments];

    res.json({
      patients: totalPatients,
      doctors: totalDoctors,
      appointments: totalAppointments,
      blogs: totalBlogs,
      trends: {
        labels: months,
        patients: patientTrend,
        doctors: doctorTrend,
        appointments: appointmentTrend
      }
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

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'doctor') {
      await Doctor.destroy({ where: { userId: user.id } });
    }
    await user.destroy();
    res.json({ message: 'User/Doctor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    await blog.destroy();
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting blog' });
  }
};

module.exports = {
  getDashboardStats,
  getPendingDoctors,
  approveDoctor,
  getAllUsers,
  deleteUser,
  deleteBlog
};
