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
      process.env.SECRETREFRESHTOKEN,
      { expiresIn: process.env.REFRESHEXPIRE }
    );
  },

  generateJwtTokenAndRefreshToken: async (user) => {
    const newAccessToken = await authToken.generateJwtToken(user);
    const newRefreshToken = await authToken.generateRefreshToken(user);
    return { newAccessToken, newRefreshToken };
  },
};

module.exports = authToken;
