require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const protectedRoute = require("./routes/protected");
const signupRoute = require("./routes/signup");
const loginRoute = require("./routes/login");
const DB_connection = require("./config/mongoConn");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// Import routes
app.use("/", protectedRoute);
app.use("/signup", signupRoute);
app.use("/login", loginRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
