const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ecommarce",
});

db.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected with database... ");
});

const findByEmail = async (email) => {
  const query = "SELECT * FROM UserDetails WHERE email = ?";
  return new Promise((resolve, reject) => {
    db.query(query, [email], (err, res) => {
      if (err) {
        reject("User not found"); // Rejecting the promise with an error message
        return; // Exit early on error
      }
      resolve(res[0]); // Resolving with the first result
    });
  });
};

const updatePasswordByEmail = async (hashedPassword, email) => {
  const query = `UPDATE UserDetails SET password = ? WHERE email = ?`;
  return new Promise((resolve, reject) => {
    db.query(query, [hashedPassword, email], (err, result) => {
      if (err) {
        reject("Something went wrong while updating the password");
      }
      resolve(result);
    });
  });
};

module.exports = { db, findByEmail, updatePasswordByEmail };
