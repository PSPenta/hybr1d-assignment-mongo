/* eslint-disable array-callback-return */
/* eslint-disable no-underscore-dangle */
const { StatusCodes } = require('http-status-codes');
const { model } = require('mongoose');

const { response, checkIfDataExists } = require('../helpers/utils');

exports.createCatalog = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(StatusCodes.BAD_REQUEST).json(response('Invalid request!'));
    }

    let catalog = await model('catalog').findOne({ userId: req.userId });
    if (!checkIfDataExists(catalog)) {
      catalog = await model('catalog').create({ userId: req.userId });
      await model('user').findByIdAndUpdate(
        req.userId,
        { catalog: catalog._id.toString() },
        { useFindAndModify: false }
      );
    }
    await req.body.products.forEach(async (product) => {
      let newProduct = await model('product').create({
        name: product.name,
        price: product.price,
        catalogId: catalog._id.toString()
      });

      await model('catalog').findByIdAndUpdate(
        catalog._id.toString(),
        { $push: { products: newProduct._id.toString() } },
        { useFindAndModify: false }
      );
      newProduct = null;
    });

    if (catalog) {
      return res.status(StatusCodes.CREATED).json(response(null, true, { message: 'Products added to seller catalog successfully!' }));
    }
    return res.status(StatusCodes.BAD_REQUEST).json(response('Unable to add products in the catalog!'));
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};

exports.allOrders = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(StatusCodes.BAD_REQUEST).json(response('Invalid user!'));
    }

    const catalog = await model('catalog').findOne({ userId: req.userId }).populate({
      path: 'products',
      populate: {
        path: 'orders',
        select: { _id: 1, userId: 1, products: 1 }
      }
    });
    if (!checkIfDataExists(catalog)) {
      return res.status(StatusCodes.BAD_REQUEST).json(response('No catalogs for you!'));
    }

    if (!checkIfDataExists(catalog.products)) {
      return res.status(StatusCodes.BAD_REQUEST).json(response('No products found in the catalog!'));
    }

    // eslint-disable-next-line consistent-return
    const orders = catalog.products.filter((product) => {
      if (checkIfDataExists(product.orders)) {
        const orderIds = product.orders.map((order) => order._id);
        return orderIds;
      }
    }).map((order) => order.orders);
    if (checkIfDataExists(orders)) {
      return res.json(response(null, true, { orders }));
    }
    return res.status(StatusCodes.BAD_REQUEST).json(response('No orders found for your catalog!'));
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};
