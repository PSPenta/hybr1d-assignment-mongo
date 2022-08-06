const { isValidObjectId } = require('mongoose');
const router = require('express').Router();
const { check, param } = require('express-validator');

const dependencies = require('./routesDependencies');

/**
 * @swagger
 * /buyer/list-of-sellers:
 *  get:
 *    tags:
 *      - Buyer
 *    name: Sellers List API
 *    summary: This api provides a list of all the sellers available.
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
  '/list-of-sellers',
  dependencies.controllers.buyer.listOfSellers
);

/**
 * @swagger
 * /buyer/seller-catalog/:sellerId:
 *  get:
 *    tags:
 *      - Buyer
 *    name: Seller Catalog API
 *    summary: This api provides the catalog info of specified seller.
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: Param Data
 *        in: param
 *        schema:
 *         type: object
 *         properties:
 *          sellerId:
 *            type: number
 *        required:
 *         - sellerId
 *    responses:
 *      200:
 *        description: All the blogs and videos.
 *      422:
 *        description: Input validation error messages.
 *      500:
 *        description: Internal server error.
 */
router.get(
  '/seller-catalog/:sellerId',
  [
    param('sellerId')
      .exists().withMessage('Seller is mandatory!')
      .custom((value) => {
        if (typeof value !== 'string' || !isValidObjectId(value)) {
          throw new Error('Invalid seller!');
        }
        return true;
      })
  ],
  dependencies.middlewares.requestValidator.validateRequest,
  dependencies.controllers.buyer.sellerCatalog
);

/**
 * @swagger
 * /buyer/create-order/:sellerId:
 *  post:
 *    tags:
 *      - Buyer
 *    name: Create Order API
 *    summary: This API let buyers to place orders from specific seller's catalog.
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: Param Data
 *        in: param
 *        schema:
 *         type: object
 *         properties:
 *          sellerId:
 *            type: number
 *        required:
 *         - sellerId
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
  '/create-order/:sellerId',
  [
    param('sellerId')
      .exists().withMessage('Seller is mandatory!')
      .custom((value) => {
        if (typeof value !== 'string' || !isValidObjectId(value)) {
          throw new Error('Invalid seller!');
        }
        return true;
      }),
    check('products')
      .exists().withMessage('Products are missing!')
      .isArray()
      .custom(async (value) => {
        await value.forEach((product) => {
          if (typeof product !== 'string' || !isValidObjectId(product)) {
            throw new Error('Invalid seller!');
          }
        });
        return true;
      })
      .withMessage('Invalid products!')
  ],
  dependencies.middlewares.requestValidator.validateRequest,
  dependencies.controllers.buyer.createOrder
);

module.exports = router;
