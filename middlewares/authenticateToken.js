const jwt = require("jsonwebtoken");
const { findByEmail } = require("../db.js");

const middleware = {
  authenticateToken: async (req, res, next) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.headers["authorization"]?.replace("Bearer", " ").trim();

      if (!token) {
        return res.status(401).json({ message: "Access Denied" });
      }

      const user = jwt.verify(token, process.env.SECRETKEYJWT);
      if (!user) {
        return res.status(401).json({ message: "Access Denied" });
      }

      const validUser = await findByEmail(user.email);

      res.user = validUser;
      req.access = true;
    } catch (error) {
      return res.status(401).json({ message: "Invalid User" });
    }

    next();
  },

  authorizeUser: (role) => {
    return (req, res, next) => {
      if (res.user.role != role) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    };
  },
};

module.exports = middleware;
