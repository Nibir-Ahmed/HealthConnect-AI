const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');

const run = async () => {
  try {
    const users = await User.findAll({ where: { role: 'doctor' }});
    console.log(users.map(u => ({ id: u.id, name: u.name, avatar: u.avatar })));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

run();
