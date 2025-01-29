const jwt = require("jsonwebtoken");

const authToken = {
  generateJwtToken: async (user) => {
    return jwt.sign(
      {
        email: user.email,
        id: user.userId,
      },
      process.env.SECRETKEYJWT,
      { expiresIn: process.env.JWTEXPIRE }
    );
  },

  generateRefreshToken: async (user) => {
    return jwt.sign(
      {
        email: user.email,
        id: user.userId,
      },
      process.env.SECRETKEYJWT,
      { expiresIn: process.env.REFRESHEXPIRE }
    );
  },
};

module.exports = authToken;
