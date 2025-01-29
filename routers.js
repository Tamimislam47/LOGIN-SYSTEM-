const express = require("express");
const router = express.Router();
const middleware = require("./middlewares/authenticateToken.js");

const { user } = require("./controllers/user.js");

router.post("/signup", user.signup);
router.post("/signin", user.singin);
router.post("/singout", middleware.authenticateToken, user.singout);

module.exports = router;
