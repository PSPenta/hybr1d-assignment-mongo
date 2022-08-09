/* eslint-disable no-underscore-dangle */
const { StatusCodes } = require('http-status-codes');
const { model } = require('mongoose');

const { response, checkIfDataExists } = require('../helpers/utils');

exports.listOfSellers = async (req, res) => {
  try {
    const sellers = await model('user').find({ role: 'seller' }, { _id: 1, username: 1, role: 1 });
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
    if (!checkIfDataExists(req.params.sellerId)) {
      return res.status(StatusCodes.BAD_REQUEST).json(response('Something went wrong!'));
    }

    const sellerCatalog = await model('user').findById(req.params.sellerId).populate({
      path: 'catalog',
      populate: {
        path: 'products',
        select: { _id: 1, name: 1, price: 1 }
      }
    });

    if (
      checkIfDataExists(sellerCatalog)
      && checkIfDataExists(sellerCatalog.catalog)
      && checkIfDataExists(sellerCatalog.catalog.products)
    ) {
      return res.json(response(null, true, { products: sellerCatalog.catalog.products }));
    }
    return res.status(StatusCodes.BAD_REQUEST).json(response('Invalid seller!'));
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};

exports.createOrder = async (req, res) => {
  try {
    if (!checkIfDataExists(req.params.sellerId) || !checkIfDataExists(req.body.products)) {
      return res.status(StatusCodes.BAD_REQUEST).json(response('Something went wrong!'));
    }

    const sellerProducts = await model('user').findById(req.params.sellerId).populate({
      path: 'catalog',
      populate: {
        path: 'products',
        select: { _id: 1 }
      }
    });
    if (!checkIfDataExists(sellerProducts)) {
      return res.status(StatusCodes.BAD_REQUEST).json(response('Invalid seller!'));
    }

    if (!checkIfDataExists(sellerProducts.catalog)) {
      return res.status(StatusCodes.BAD_REQUEST).json(response('No catalog found for this seller!'));
    }

    if (!checkIfDataExists(sellerProducts.catalog.products)) {
      return res.status(StatusCodes.BAD_REQUEST).json(response('No products found!'));
    }

    const orderedProducts = sellerProducts.catalog.products.filter((product) => {
      if (req.body.products.includes(product._id.toString())) {
        return true;
      }
      return false;
    }).map((product) => (product._id.toString()));

    const order = await model('order').create({
      userId: req.userId
    });
    if (!checkIfDataExists(order)) {
      return res.status(StatusCodes.BAD_REQUEST).json(response('Unable to create the order!'));
    }

    await model('order').findByIdAndUpdate(
      order._id.toString(),
      { $push: { products: orderedProducts } },
      { useFindAndModify: false }
    );

    orderedProducts.forEach(async (product) => {
      await model('product').findByIdAndUpdate(
        product,
        { $push: { orders: order._id.toString() } },
        { useFindAndModify: false }
      );
    });
    return res.status(StatusCodes.CREATED).json(response(null, true, { message: 'Order created successfully!' }));
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};
