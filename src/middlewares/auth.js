const { StatusCodes } = require('http-status-codes');
const { verify } = require('jsonwebtoken');

const { model } = require('../config/dbConfig');
const { jwt } = require('../config/serverConfig');
const { response, checkIfDataExists } = require('../helpers/utils');

// eslint-disable-next-line consistent-return
exports.jwtAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        const blacklistedToken = await model('Blacklist').findOne({ where: { token } });
        if (!checkIfDataExists(blacklistedToken)) {
          const decodedToken = verify(token, jwt.secret, (err, decoded) => {
            if (err) {
              console.error('JWT Error:', err);
              return res.status(StatusCodes.UNAUTHORIZED).json(response('Your login session is either expired or the token is invalid, please try logging in again!'));
            }
            return decoded;
          });
          if (decodedToken) {
            req.userId = decodedToken.userId;
            req.userType = decodedToken.role;
            next();
          } else {
            return res.status(StatusCodes.UNAUTHORIZED).json(response('You are not authorized to access this page!'));
          }
        } else {
          return res.status(StatusCodes.UNAUTHORIZED).json(response('You are not authorized to access this page!'));
        }
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json(response('You are not authorized to access this page!'));
      }
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).json(response('You are not authorized to access this page!'));
    }
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};

// eslint-disable-next-line consistent-return
exports.isSeller = (req, res, next) => {
  try {
    if (req.userType.toLowerCase() === 'seller') {
      next();
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).json(response('Unauthorized user!'));
    }
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};
