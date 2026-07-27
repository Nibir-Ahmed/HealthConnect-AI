const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Doctor,
      key: 'id'
    }
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Appointment,
      key: 'id'
    }
  },
  medications: {
    type: DataTypes.JSON, // e.g. [{ name: 'Amoxicillin', dosage: '500mg', instructions: '2 times a day' }]
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
  tableName: 'prescriptions'
});

// Relationships
User.hasMany(Prescription, { foreignKey: 'patientId', as: 'prescriptions' });
Prescription.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(Prescription, { foreignKey: 'doctorId' });
Prescription.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'prescribedBy' });

module.exports = Prescription;
