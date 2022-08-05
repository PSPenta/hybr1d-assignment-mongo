const { paginate } = require('sequelize-paginate');

module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define('order', {
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

  paginate(Order);
  return Order;
};
