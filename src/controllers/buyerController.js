const { StatusCodes } = require('http-status-codes');
const { QueryTypes: { INSERT } } = require('sequelize');

const sequelize = require('../config/dbConfig');
const { response, checkIfDataExists } = require('../helpers/utils');

const { model } = sequelize;

exports.listOfSellers = async (req, res) => {
  try {
    const sellers = await model('User').findAll({ where: { role: 'seller' }, attributes: ['id', 'username', 'role'] });
    if (checkIfDataExists(sellers)) {
      return res.json(response(null, true, { sellers }));
    }
    return res.status(StatusCodes.BAD_REQUEST).json(response('No sellers found!'));
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};

exports.sellerCatalog = async (req, res) => {
  try {
    if (checkIfDataExists(req.params.sellerId)) {
      const seller = await model('User').findOne({ where: { id: req.params.sellerId } });
      if (checkIfDataExists(seller)) {
        const catalog = await model('Catalog').findOne({ where: { userId: req.params.sellerId } });
        if (checkIfDataExists(catalog)) {
          const products = await model('Product').findAll({ where: { catalogId: catalog.id }, attributes: ['id', 'name', 'price'] });
          if (checkIfDataExists(products)) {
            return res.json(response(null, true, { products }));
          }
          return res.status(StatusCodes.BAD_REQUEST).json(response('No products found!'));
        }
        return res.status(StatusCodes.BAD_REQUEST).json(response('No catalog found for this seller!'));
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response('Invalid seller!'));
    }
    return res.status(StatusCodes.BAD_REQUEST).json(response('Something went wrong!'));
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};

exports.createOrder = async (req, res) => {
  try {
    if (checkIfDataExists(req.params.sellerId) && checkIfDataExists(req.body.products)) {
      const seller = await model('User').findOne({ where: { id: req.params.sellerId } });
      if (checkIfDataExists(seller)) {
        const catalog = await model('Catalog').findOne({ where: { userId: req.params.sellerId } });
        if (checkIfDataExists(catalog)) {
          const products = await model('Product').findAll({ where: { id: req.body.products } });
          if (checkIfDataExists(products)) {
            const order = await model('Order').create({ userId: req.userId });
            await products.forEach(async (product) => {
              // await order.addProduct(product);
              // await model('OrderProducts').create({ order, product });

              // Using the raw query as the above functions are not working as expected.
              await sequelize.default.query('INSERT INTO order_products (product_id, order_id) VALUES (?, ?)', { replacements: [product.id, order.id], type: INSERT });
            });
            return res.status(StatusCodes.CREATED).json(response(null, true, { message: 'Order created successfully!' }));
          }
          return res.status(StatusCodes.BAD_REQUEST).json(response('No products found!'));
        }
        return res.status(StatusCodes.BAD_REQUEST).json(response('No catalog found for this seller!'));
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response('Invalid seller!'));
    }
    return res.status(StatusCodes.BAD_REQUEST).json(response('Something went wrong!'));
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};
