const Message = require('../models/Message');
const User = require('../models/User');
const { Op } = require('sequelize');

const getChatHistory = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user.id;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId }
        ]
      },
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, attachmentUrl, attachmentType, appointmentId } = req.body;
    const senderId = req.user.id;

    const message = await Message.create({
      senderId,
      receiverId,
      content,
      attachmentUrl,
      attachmentType,
      appointmentId
    });

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user.id;

    await Message.update(
      { isRead: true },
      {
        where: {
          senderId: partnerId,
          receiverId: userId,
          isRead: false
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error marking messages as read' });
  }
};

const getInbox = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch all messages involving this user
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }]
      },
      order: [['createdAt', 'DESC']]
    });

    const inboxMap = new Map();
    
    messages.forEach(msg => {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!inboxMap.has(partnerId)) {
        inboxMap.set(partnerId, msg);
      }
    });

    const partnerIds = Array.from(inboxMap.keys());
    
    const partners = await User.findAll({
      where: { id: partnerIds },
      attributes: ['id', 'name', 'avatar', 'isOnline', 'role']
    });

    const inbox = partners.map(partner => {
      const lastMessage = inboxMap.get(partner.id);
      return {
        partner,
        lastMessage,
        unreadCount: messages.filter(m => m.senderId === partner.id && m.receiverId === userId && !m.isRead).length
      };
    });

    inbox.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    res.json(inbox);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching inbox' });
  }
};

module.exports = {
  getChatHistory,
  sendMessage,
  markAsRead,
  getInbox
};
