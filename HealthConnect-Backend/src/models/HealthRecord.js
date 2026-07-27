const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Doctor = require('./Doctor');

const HealthRecord = sequelize.define('HealthRecord', {
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
    allowNull: true,
    references: {
      model: Doctor,
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('lab_result', 'xray', 'mri', 'general'),
    defaultValue: 'general',
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
  tableName: 'health_records'
});

// Relationships
User.hasMany(HealthRecord, { foreignKey: 'patientId', as: 'records' });
HealthRecord.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(HealthRecord, { foreignKey: 'doctorId' });
HealthRecord.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'uploadedBy' });

module.exports = HealthRecord;
