const HealthRecord = require('../models/HealthRecord');
const createHealthRecord = async (req, res) => {
  try {
    const { title, type, date, notes, patientId } = req.body;
    
    // Using local storage
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const record = await HealthRecord.create({
      patientId: patientId || req.user.id,
      doctorId: req.user.role === 'doctor' ? req.user.id : null,
      title,
      type: type || 'general',
      date: date || new Date().toISOString().split('T')[0],
      notes,
      fileUrl
    });

    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getHealthRecords = async (req, res) => {
  try {
    // If patient, get own records. If doctor, get records of a specific patient.
    const patientId = req.user.role === 'patient' ? req.user.id : req.query.patientId;

    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    if (req.user.role === 'doctor') {
      const Doctor = require('../models/Doctor');
      const Appointment = require('../models/Appointment');
      
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor) return res.status(403).json({ message: 'Doctor profile not found' });
      
      const hasAppointment = await Appointment.findOne({
        where: { doctorId: doctor.id, patientId }
      });
      
      if (!hasAppointment) {
        return res.status(403).json({ message: 'Unauthorized to view these records' });
      }
    }

    const records = await HealthRecord.findAll({
      where: { patientId },
      order: [['date', 'DESC']]
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await HealthRecord.findOne({ where: { id, patientId: req.user.id } });
    if (!record) {
      return res.status(404).json({ message: 'Record not found or unauthorized' });
    }
    await record.destroy();
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createHealthRecord,
  getHealthRecords,
  deleteHealthRecord
};
