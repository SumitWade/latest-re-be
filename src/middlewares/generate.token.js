const jsonWebToken = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET_KEY;

// Function to generate a JWT for the given user details
module.exports = function generateUserJWT(userDetails) {
  return jsonWebToken.sign(userDetails, secretKey, { expiresIn: process.env.JWT_EXPIRE_TIME });
};
