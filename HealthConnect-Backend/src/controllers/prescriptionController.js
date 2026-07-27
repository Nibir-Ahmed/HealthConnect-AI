const Prescription = require('../models/Prescription');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medications, notes } = req.body;
    
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: doctor.id,
      appointmentId,
      medications,
      notes
    });

    res.status(201).json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating prescription' });
  }
};

const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      where: { patientId: req.user.id },
      include: [
        {
          model: Doctor,
          as: 'prescribedBy',
          include: [{ model: User, attributes: ['name', 'avatar'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id, {
      include: [
        {
          model: Doctor,
          as: 'prescribedBy',
          include: [{ model: User, attributes: ['name', 'avatar', 'phone'] }]
        },
        {
          model: User,
          as: 'patient',
          attributes: ['name', 'avatar', 'phone']
        }
      ]
    });
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Auth check: only involved patient or doctor
    if (prescription.patientId !== req.user.id) {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || prescription.doctorId !== doctor.id) {
         return res.status(403).json({ message: 'Unauthorized to view this prescription' });
      }
    }

    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPrescription,
  getPatientPrescriptions,
  getPrescriptionById
};
