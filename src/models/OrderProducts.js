const { paginate } = require('sequelize-paginate');

module.exports = (sequelize, Sequelize) => {
  const OrderProducts = sequelize.define('orderProducts', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    }
  });

  paginate(OrderProducts);
  return OrderProducts;
};
