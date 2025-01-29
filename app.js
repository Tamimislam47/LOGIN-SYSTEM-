const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");

require("dotenv").config();

const router = require("./routers.js");

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api", router);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
