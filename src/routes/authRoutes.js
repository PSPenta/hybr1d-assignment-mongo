const router = require('express').Router();
const { check } = require('express-validator');

const dependencies = require('./routesDependencies');

/**
 * @swagger
 * /auth/login:
 *  post:
 *    tags:
 *      - Authentication
 *    name: Login API
 *    summary: Based on user's data, this api sent jwt token which leads to login process.
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
 *          username:
 *            type: string
 *          password:
 *            type: string
 *        required:
 *         - username
 *         - password
 *    responses:
 *      200:
 *        description: JWT token will be in response.
 *      400:
 *        description: Something went wrong.
 *      422:
 *        description: Input validation error messages.
 *      500:
 *        description: Internal server error.
 */
router.post(
  '/login',
  [
    check('username')
      .exists().withMessage('The username is mandatory!')
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage('The username must be alphabetic or alphanumeric, and it should not contain spaces!')
      .isLength({ max: 255 })
      .withMessage('The username length must be less than 255 digits!'),
    check('password', '...')
      .exists().withMessage('The password is mandatory!')
      .matches(/^(?=.*\d)(?=.*[!@#$&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$&*]{8,15}$/, 'i')
      .withMessage('Wrong username and/or password!')
  ],
  dependencies.middlewares.requestValidator.validateRequest,
  dependencies.controllers.authClient.jwtLogin
);

/**
 * @swagger
 * /auth/logout:
 *  get:
 *    tags:
 *      - Authentication
 *    name: Logout API
 *    summary: This api terminates the login session of the user whose token is passed.
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
 *        description: Success message.
 *      403:
 *        description: Unauthorized user.
 *      500:
 *        description: Internal server error.
 */
router.get(
  '/logout',
  dependencies.middlewares.auth.jwtAuth,
  dependencies.controllers.authClient.jwtLogout
);

/**
 * @swagger
 * /auth/register:
 *  post:
 *    tags:
 *      - Authentication
 *    name: User Register API
 *    summary: This API lets user register himself.
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: Body Data
 *        in: body
 *        schema:
 *          type: object
 *          properties:
 *            username:
 *              type: string
 *            password:
 *              type: string
 *            role:
 *              type: string
 *        required:
 *         - username
 *         - password
 *         - role
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
  '/register',
  [
    check('username')
      .exists().withMessage('The username is mandatory!')
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage('The username must be alphabetic or alphanumeric, and it should not contain spaces!')
      .isLength({ max: 255 })
      .withMessage('The username length must be less than 255 digits!'),
    check('password', '...')
      .exists()
      .withMessage('The password is mandatory!')
      .isLength({ min: 8, max: 15 })
      .withMessage('The password length must be between 8 and 15 digits!')
      .matches(/^(?=.*\d)(?=.*[!@#$&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$&*]{8,15}$/, 'i')
      .withMessage('The password must contain at least 1 uppercase, 1 lowercase, 1 special character and 1 number!'),
    check('role')
      .exists().withMessage('The role is mandatory!')
      .custom((value) => {
        if (value.toLowerCase() === 'buyer' || value.toLowerCase() === 'seller') {
          return true;
        }
        throw new Error('Invalid role selected!');
      })
  ],
  dependencies.middlewares.requestValidator.validateRequest,
  dependencies.controllers.authClient.register
);

module.exports = router;
