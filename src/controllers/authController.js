const { compare, hash } = require('bcrypt');
const { StatusCodes } = require('http-status-codes');
const { sign } = require('jsonwebtoken');

const { model } = require('../config/dbConfig');
const { jwt } = require('../config/serverConfig');
const { response, checkIfDataExists } = require('../helpers/utils');

exports.jwtLogin = async (req, res) => {
  try {
    const userData = await model('User').findOne({ where: { username: req.body.username } });
    let token = '';
    if (
      checkIfDataExists(userData)
      && await compare(req.body.password, userData.password)
    ) {
      token = sign(
        {
          username: userData.username,
          userId: userData.id.toString(),
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
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        await model('Blacklist').create({
          token,
          user: req.userId
        });
      }
      return res.json(response(null, true, 'Successfully logged out!'));
    }
    return res.status(StatusCodes.UNAUTHORIZED).json(response('You are not authorized to access this page!'));
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};

exports.register = async (req, res) => {
  try {
    const data = await model('User').findOne({ where: { username: req.body.username } });
    if (!checkIfDataExists(data)) {
      const hashedPassword = await hash(req.body.password, 256);
      const user = await model('User').create({
        username: req.body.username,
        password: hashedPassword,
        role: req.body.role.toLowerCase()
      });

      if (user) {
        return res.status(StatusCodes.CREATED).json(response(null, true, { message: 'User added successfully!' }));
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response('Something went wrong!'));
    }
    return res.status(StatusCodes.BAD_REQUEST).json(response('Username is already taken!'));
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response('Internal server error!'));
  }
};
