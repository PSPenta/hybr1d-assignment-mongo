const router = require('express').Router();

const dependencies = require('./routesDependencies');
const { response } = require('../helpers/utils');

// Route for server Health Check
router.get('/health', (req, res) => res.json(response(null, true, { success: true })));

router.use('/auth', require('./authRoutes'));

router.use(
  '/buyer',
  dependencies.middlewares.auth.jwtAuth,
  require('./buyerRoutes')
);

router.use(
  '/seller',
  dependencies.middlewares.auth.jwtAuth,
  dependencies.middlewares.auth.isSeller,
  require('./sellerRoutes')
);

module.exports = router;
