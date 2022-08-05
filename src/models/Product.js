const { paginate } = require('sequelize-paginate');

module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define('product', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    catalogId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      model: 'catalogs',
      key: 'id'
    }
  });

  paginate(Product);
  return Product;
};
