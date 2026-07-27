const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Doctor = require('./Doctor');

const DoctorAvailability = sequelize.define('DoctorAvailability', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Doctor,
      key: 'id'
    }
  },
  dayOfWeek: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  timestamps: true,
  tableName: 'doctor_availabilities'
});

// Relationships
Doctor.hasMany(DoctorAvailability, { foreignKey: 'doctorId', as: 'availabilities', onDelete: 'CASCADE' });
DoctorAvailability.belongsTo(Doctor, { foreignKey: 'doctorId' });

module.exports = DoctorAvailability;
