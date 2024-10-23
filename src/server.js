require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const protectedRoute = require("./routes/protected");
const signupRoute = require("./routes/signup");
const loginRoute = require("./routes/login");
const exploreRoute=require("./routes/explore")
const ngoRoute=require("./routes/ngodetail");
const DB_connection = require("./config/mongoConn");
const messagesRoute = require("./routes/messages");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const http = require("http");
const socketIo = require("socket.io");

// const setupSocket = require("./socket");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware to parse JSON bodies

app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3001", // Change this to your React app port
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("chatMessage", (msg) => {
    io.emit("chatMessage", msg); // Broadcast the message to all clients
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const MERCHANT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const MERCHANT_ID = "PGTESTPAYUAT86";

// const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
// const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/status"

const MERCHANT_BASE_URL =
  "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
const MERCHANT_STATUS_URL =
  "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status";

const redirectUrl = "http://localhost:3000/status";

const successUrl = "http://localhost:3001/payment-success";
const failureUrl = "http://localhost:3001/payment-failure";

app.post("/create-order", async (req, res) => {
  const { name, mobileNumber, amount } = req.body;
  const orderId = uuidv4();

  //payment
  const paymentPayload = {
    merchantId: MERCHANT_ID,
    merchantUserId: name,
    mobileNumber: mobileNumber,
    amount: amount * 100,
    merchantTransactionId: orderId,
    redirectUrl: `${redirectUrl}/?id=${orderId}`,
    redirectMode: "POST",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const payload = Buffer.from(JSON.stringify(paymentPayload)).toString(
    "base64"
  );
  const keyIndex = 1;
  const string = payload + "/pg/v1/pay" + MERCHANT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const option = {
    method: "POST",
    url: MERCHANT_BASE_URL,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    data: {
      request: payload,
    },
  };
  try {
    const response = await axios.request(option);
    console.log(response.data.data.instrumentResponse.redirectInfo.url);
    res.status(200).json({
      msg: "OK",
      url: response.data.data.instrumentResponse.redirectInfo.url,
    });
  } catch (error) {
    console.log("error in payment", error);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

app.post("/status", async (req, res) => {
  const merchantTransactionId = req.query.id;

  const keyIndex = 1;
  const string =
    `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const option = {
    method: "GET",
    url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": MERCHANT_ID,
    },
  };

  axios.request(option).then((response) => {
    if (response.data.success === true) 
      {
        //call here middle ware to add donar
      app.use("/donar",donarRoute);
      return res.redirect(successUrl);
    } else {
      return res.redirect(failureUrl);
    }
  });
});

app.use(bodyParser.json());

// Import routes
app.use("/", protectedRoute);
app.use("/signup", signupRoute);
app.use("/login", loginRoute);
app.use("/explore", exploreRoute);
app.use("/messages", messagesRoute);
app.use("/register-ngo",ngoRoute);
// Start the server
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
