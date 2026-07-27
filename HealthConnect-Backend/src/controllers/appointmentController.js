const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, type, reason } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      date,
      time,
      type,
      reason
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating appointment' });
  }
};

const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { patientId: req.user.id },
      include: [
        {
          model: Doctor,
          as: 'doctor',
          include: [
            {
              model: User,
              attributes: ['name', 'avatar']
            }
          ]
        }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) {
      return res.json([]);
    }

    const appointments = await Appointment.findAll({
      where: { doctorId: doctor.id },
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['name', 'avatar', 'phone']
        }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || appointment.doctorId !== doctor.id) {
        return res.status(403).json({ message: 'Unauthorized to update this appointment' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this appointment' });
    }
    
    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus
};
