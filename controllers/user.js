const bcrypt = require("bcrypt");
const { db, findByEmail, updatePasswordByEmail } = require("../db.js");
const authToken = require("./authToken.js");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const emailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const options = {
  httpOnly: true,
  secure: true, // Secure in production
  sameSite: "Strict",
};

const user = {
  signup: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !emailValidator.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ error: "password must be at least 6 characters long" });
    }

    const hashPass = await bcrypt.hash(
      password,
      parseInt(process.env.SALTROUND)
    );

    const query =
      "insert into UserDetails (userId,email,password) values (?,?,?) ";
    const values = [uuidv4(), email, hashPass];

    db.query(query, values, (err, _) => {
      if (err) return res.status(500).json({ error: err.message });

      return res.status(201).json({ message: "Record inserted successfully" });
    });
  },

  signin: async (req, res) => {
    const { email, password: pass } = req.body;

    if (!email || !emailValidator.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!pass || pass.length < 8) {
      return res
        .status(400)
        .json({ error: "password must be at least 6 characters long" });
    }

    const user = await findByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const matchWithHash = await bcrypt.compare(pass, user.password);
    if (!matchWithHash) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const refreshToken = await authToken.generateRefreshToken(user);
    const accessToken = await authToken.generateJwtToken(user);

    // Set cookies and send the login response
    res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .status(200)
      .json({
        message: "Login Successful",
        accessToken,
        refreshToken,
      });

    // Insert the refresh token into the database asynchronously after response
    const query = "UPDATE UserDetails SET refreshToken = ? WHERE email = ?";
    db.query(query, [refreshToken, email], (err, result) => {
      if (err) {
        console.error("Error updating refresh token:", err);
      } else {
        console.log("Refresh token updated:", result);
      }
    });
  },

  signout: async (_, res) => {
    const { user } = res;
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .status(200)
      .json({
        message: "LogOut Successfully",
      });
  },

  uploadImages: async (req, res) => {
    try {
      for (const file of req.files) {
        if (!fs.existsSync(file.path)) {
          return res
            .status(400)
            .json({ message: `File not found: ${file.path}` });
        }

        console.log("Uploading file:", file.path);
        const result = await cloudinary.uploader.upload(file.path);
      }

      res.status(200).json({
        message: "Files uploaded successfully",
      });
    } catch (error) {
      res.status(500).json({ message: "Upload failed", error: error.message });
    }
  },

  passwordChange: async (req, res) => {
    try {
      const { email, oldPassword, newPassword } = req.body;

      const validUser = await findByEmail(email);
      if (!validUser) {
        return res.status(400).json({ message: "User not found" });
      }

      const match = await bcrypt.compare(oldPassword, validUser.password);
      console.log(match);

      if (!match) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log(hashedPassword);

      const updated = await updatePasswordByEmail(
        hashedPassword,
        validUser.email
      );

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = { user, options };
