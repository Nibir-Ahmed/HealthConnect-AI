const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Appointment = require('./Appointment');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
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
  content: {
    type: DataTypes.TEXT,
    allowNull: true, // Allow null if there's only an attachment
  },
  attachmentUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  attachmentType: {
    type: DataTypes.STRING, // e.g., 'image', 'document', 'report'
    allowNull: true,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  timestamps: true,
  tableName: 'messages'
});

// Relationships
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

Appointment.hasMany(Message, { foreignKey: 'appointmentId' });
Message.belongsTo(Appointment, { foreignKey: 'appointmentId' });

module.exports = Message;
