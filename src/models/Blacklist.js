const { paginate } = require('sequelize-paginate');

module.exports = (sequelize, Sequelize) => {
  const Blacklist = sequelize.define('blacklist', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      model: 'users',
      key: 'id'
    }
  });

  paginate(Blacklist);
  return Blacklist;
};
