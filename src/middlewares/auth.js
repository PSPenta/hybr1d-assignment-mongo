const { StatusCodes } = require('http-status-codes');
const { verify } = require('jsonwebtoken');
const { model, isValidObjectId } = require('mongoose');

const { jwt } = require('../config/serverConfig');
const { response, checkIfDataExists } = require('../helpers/utils');

// eslint-disable-next-line consistent-return
exports.jwtAuth = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(StatusCodes.UNAUTHORIZED).json(response('You are not authorized to access this page!'));
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json(response('You are not authorized to access this page!'));
    }

    const blacklistedToken = await model('user').find({ blacklistedTokens: token });
    if (checkIfDataExists(blacklistedToken)) {
      return res.status(StatusCodes.UNAUTHORIZED).json(response('You are not authorized to access this page!'));
    }

    // eslint-disable-next-line consistent-return
    verify(token, jwt.secret, (err, decoded) => {
      if (err) {
        console.error('JWT Error:', err);
        return res.status(StatusCodes.UNAUTHORIZED).json(response('Your login session is either expired or the token is invalid, please try logging in again!'));
      }

      if (decoded && decoded.userId && isValidObjectId(decoded.userId) && decoded.role) {
        req.userId = decoded.userId;
        req.userType = decoded.role;
        next();
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json(response('You are not authorized to access this page!'));
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};

// eslint-disable-next-line consistent-return
exports.isSeller = (req, res, next) => {
  try {
    if (req.userType.toLowerCase() !== 'seller') {
      return res.status(StatusCodes.UNAUTHORIZED).json(response('Unauthorized user!'));
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};
