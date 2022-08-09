const { compare, hash } = require('bcrypt');
const { StatusCodes } = require('http-status-codes');
const { sign } = require('jsonwebtoken');
const { model } = require('mongoose');

const { jwt } = require('../config/serverConfig');
const { response, checkIfDataExists } = require('../helpers/utils');

exports.jwtLogin = async (req, res) => {
  try {
    const userData = await model('user').findOne({ username: req.body.username });
    let token = '';
    if (
      checkIfDataExists(userData)
      && await compare(req.body.password, userData.password)
    ) {
      token = sign(
        {
          username: userData.username,
          // eslint-disable-next-line no-underscore-dangle
          userId: userData._id.toString(),
          role: userData.role
        },
        jwt.secret,
        { expiresIn: jwt.expireIn }
      );
    }

    if (token) {
      return res.json(response(null, true, { token }));
    }
    return res.status(StatusCodes.BAD_REQUEST).json(response('User not found!'));
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};

exports.jwtLogout = async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return res.status(StatusCodes.UNAUTHORIZED).json(response('You are not authorized to access this page!'));
    }

    const token = req.headers.authorization.split(' ')[1];
    if (token) {
      model('user').findByIdAndUpdate(
        req.userId,
        { $push: { blacklistedTokens: token } },
        { useFindAndModify: false }
      );
    }
    return res.json(response(null, true, 'Successfully logged out!'));
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};

exports.register = async (req, res) => {
  try {
    const data = await model('user').findOne({ username: req.body.username });
    if (checkIfDataExists(data)) {
      return res.status(StatusCodes.BAD_REQUEST).json(response('Username is already taken!'));
    }

    const hashedPassword = await hash(req.body.password, 256);
    const user = await model('user').create({
      username: req.body.username,
      password: hashedPassword,
      role: req.body.role.toLowerCase()
    });

    if (checkIfDataExists(user)) {
      return res.status(StatusCodes.CREATED).json(response(null, true, { message: 'User added successfully!' }));
    }
    return res.status(StatusCodes.BAD_REQUEST).json(response('Something went wrong!'));
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};
