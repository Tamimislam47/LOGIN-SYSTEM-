const bcrypt = require("bcrypt");
const { db, findByEmail } = require("../db.js");
const authToken = require("./authToken.js");
const { v4: uuidv4 } = require("uuid");
const cookie = require("cookie-parser");

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

  singin: async (req, res) => {
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
  
  singout: async (req, res) => {
    const { user } = res;

    console.log(user);

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
};

module.exports = { user, options };
