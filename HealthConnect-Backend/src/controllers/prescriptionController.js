const Prescription = require('../models/Prescription');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Message = require('../models/Message');

const createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medications, notes } = req.body;
    
    let doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) {
      doctor = await Doctor.findOne({ where: { id: req.user.id } });
    }
    if (!doctor) {
      doctor = await Doctor.findOne();
    }
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: doctor.id,
      appointmentId: appointmentId || null,
      medications,
      notes
    });

    // Auto-create chat notification for the digital prescription
    let medText = 'Digital Prescription Issued';
    try {
      const parsedMeds = typeof medications === 'string' ? JSON.parse(medications) : medications;
      if (Array.isArray(parsedMeds) && parsedMeds.length > 0) {
        medText = parsedMeds.map(m => `💊 ${m.name} (${m.dosage}, ${m.frequency} for ${m.duration})`).join('\n');
      }
    } catch (e) {}

    const chatContent = `📋 DIGITAL PRESCRIPTION\n${medText}${notes ? `\n\n📝 Advice: ${notes}` : ''}`;

    await Message.create({
      senderId: req.user.id,
      receiverId: patientId,
      content: chatContent,
      appointmentId
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
