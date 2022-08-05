/* eslint-disable global-require */
module.exports = {
  controllers: {
    authClient: require('../controllers/authController'),
    buyer: require('../controllers/buyerController'),
    seller: require('../controllers/sellerController')
  },
  middlewares: {
    auth: require('../middlewares/auth'),
    requestValidator: require('../middlewares/validation')
  }
};
