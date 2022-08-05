const { paginate } = require('sequelize-paginate');

module.exports = (sequelize, Sequelize) => {
  const Catalog = sequelize.define('catalog', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      model: 'users',
      key: 'id'
    }
  });

  paginate(Catalog);
  return Catalog;
};
