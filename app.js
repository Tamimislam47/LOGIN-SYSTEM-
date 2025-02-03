const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");

require("dotenv").config();

const router = require("./routers.js");

app.use(
  cors({
    origin: "http://localhost:3001", // Update with your frontend URL
    credentials: true, // Make sure cookies are sent and received
  })
);

app.use(express.json());
app.use(cookieParser());

console.log(process.env.VALIDMIMITYPE);

app.use("/api", router);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
