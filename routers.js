const express = require("express");
const router = express.Router();
const middleware = require("./middlewares/authenticateToken.js");
const { upload } = require("./middlewares/multer.js");
const { user } = require("./controllers/user.js");
const fs = require("fs");
const cloudinar = require("cloudinary").v2;

router.post("/signup", user.signup);
router.post("/signin", user.signin);
router.post("/signout", middleware.authenticateToken, user.signout);
router.post("/passwordchange", user.passwordChange);

// Handle image upload
router.post(
  "/upload",
  middleware.authenticateToken,
  upload.array("avater", 2),
  user.uploadImages
);

router.post("/refreshTokenGen", middleware.newRefreshAccessToken);

module.exports = router;
