const { Blog, BlogInteraction } = require('../models/Blog');
const User = require('../models/User');

const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      where: { isPublished: true },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['name', 'avatar', 'role']
        },
        {
          model: BlogInteraction
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const userId = req.user ? req.user.id : null;

    const formattedBlogs = blogs.map(blog => {
      const b = blog.toJSON();
      let likes = 0;
      let isLiked = false;
      let isSaved = false;

      if (b.BlogInteractions) {
        likes = b.BlogInteractions.filter(i => i.isLiked).length;
        if (userId) {
          const myInteraction = b.BlogInteractions.find(i => i.userId === userId);
          if (myInteraction) {
            isLiked = myInteraction.isLiked;
            isSaved = myInteraction.isSaved;
          }
        }
      }

      delete b.BlogInteractions;
      return {
        ...b,
        likes,
        isLiked,
        isSaved
      };
    });

    res.json(formattedBlogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching blogs' });
  }
};

const getSavedBlogs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const savedInteractions = await BlogInteraction.findAll({
      where: { userId, isSaved: true },
      include: [{
        model: Blog,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['name', 'avatar', 'role']
          },
          {
            model: BlogInteraction
          }
        ]
      }]
    });

    const formattedBlogs = savedInteractions.map(interaction => {
      const b = interaction.Blog.toJSON();
      let likes = 0;
      let isLiked = false;
      let isSaved = true;

      if (b.BlogInteractions) {
        likes = b.BlogInteractions.filter(i => i.isLiked).length;
        const myInteraction = b.BlogInteractions.find(i => i.userId === userId);
        if (myInteraction) {
          isLiked = myInteraction.isLiked;
        }
      }

      delete b.BlogInteractions;
      return {
        ...b,
        likes,
        isLiked,
        isSaved
      };
    });

    res.json(formattedBlogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching saved blogs' });
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    let coverImage = null;

    if (req.file) {
      coverImage = `${req.protocol}://${req.get('host')}/uploads/blogs/${req.file.filename}`;
    }
    
    // Parse tags if it comes as a string (FormData sends arrays differently)
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = [tags];
      }
    }

    // Admin or Doctor can create blogs
    const blog = await Blog.create({
      authorId: req.user.id,
      title,
      content,
      tags: parsedTags,
      coverImage
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating blog' });
  }
};

const toggleSaveBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id;

    let interaction = await BlogInteraction.findOne({ where: { userId, blogId } });

    if (interaction) {
      interaction.isSaved = !interaction.isSaved;
      await interaction.save();
    } else {
      interaction = await BlogInteraction.create({
        userId,
        blogId,
        isSaved: true
      });
    }

    res.json(interaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleLikeBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id;

    let interaction = await BlogInteraction.findOne({ where: { userId, blogId } });

    if (interaction) {
      interaction.isLiked = !interaction.isLiked;
      await interaction.save();
    } else {
      interaction = await BlogInteraction.create({
        userId,
        blogId,
        isLiked: true
      });
    }

    res.json(interaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getBlogs,
  createBlog,
  toggleSaveBlog,
  toggleLikeBlog,
  getSavedBlogs
};
