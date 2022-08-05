const router = require('express').Router();
const { check } = require('express-validator');

const dependencies = require('./routesDependencies');

/**
 * @swagger
 * /seller/create-catalog:
 *  post:
 *    tags:
 *      - Seller
 *    name: Create Seller Catalog API
 *    summary: This API let sellers to create their catalogs.
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: Body Data
 *        in: body
 *        schema:
 *         type: object
 *         properties:
 *          products:
 *            type: array
 *            items: {
 *              type: object
 *            }
 *        required:
 *         - products
 *    responses:
 *      201:
 *        description: Success message.
 *      400:
 *        description: Something went wrong.
 *      422:
 *        description: Input validation error messages.
 *      500:
 *        description: Internal server error.
 */
router.post(
  '/create-catalog',
  [
    check('products')
      .exists().withMessage('Invalid product details!'),
    check('products.*.name')
      .exists().withMessage('The product name is mandatory!')
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage('The product name must be alphabetic or alphanumeric, and it should not contain spaces!')
      .isLength({ max: 255 })
      .withMessage('The product name length must be less than 255 digits!'),
    check('products.*.price')
      .exists().withMessage('The price is mandatory!')
      .matches(/([0-9]*[.])?[0-9]+$/)
      .withMessage('The price must be numeric or decimal point number only!')
  ],
  dependencies.middlewares.requestValidator.validateRequest,
  dependencies.controllers.seller.createCatalog
);

/**
 * @swagger
 * /seller/orders:
 *  get:
 *    tags:
 *      - Seller
 *    name: Gets all Orders of a seller API
 *    summary: This api provides the list of all the orders related to the logged in seller.
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: Param Data
 *        in: param
 *        schema:
 *          type: object
 *    responses:
 *      200:
 *        description: All the blogs and videos.
 *      422:
 *        description: Input validation error messages.
 *      500:
 *        description: Internal server error.
 */
router.get(
  '/orders',
  dependencies.controllers.seller.allOrders
);

module.exports = router;
