const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON, // e.g. ["Heart Health", "Diet"]
    allowNull: true,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  timestamps: true,
  tableName: 'blogs'
});

const BlogInteraction = sequelize.define('BlogInteraction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  blogId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Blog,
      key: 'id'
    }
  },
  isSaved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isLiked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  timestamps: true,
  tableName: 'blog_interactions'
});

// Relationships
User.hasMany(Blog, { foreignKey: 'authorId' });
Blog.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

User.hasMany(BlogInteraction, { foreignKey: 'userId' });
BlogInteraction.belongsTo(User, { foreignKey: 'userId' });

Blog.hasMany(BlogInteraction, { foreignKey: 'blogId' });
BlogInteraction.belongsTo(Blog, { foreignKey: 'blogId' });

module.exports = { Blog, BlogInteraction };
