require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// ---------------- DB CONNECTION ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ---------------- SEND EMAIL API (BREVO) ----------------
app.post("/sendemail", async (req, res) => {
  try {
    const { msg, emails } = req.body;

    if (!msg || !emails || emails.length === 0) {
      return res.status(400).send(false);
    }

    for (let email of emails) {
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            name: "Madhavan",
            email: "madhavanvg408@gmail.com", // MUST be verified in Brevo
          },
          to: [{ email }],
          subject: "Bulk Mail",
          htmlContent: `<p>${msg}</p>`,
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
            accept: "application/json",
          },
        }
      );

      console.log("✅ Mail sent to:", email);

      // prevent rate limiting
      await new Promise((r) => setTimeout(r, 1000));
    }

    res.send(true);
  } catch (err) {
    console.error(
      "❌ MAIL ERROR:",
      err.response?.data || err.message
    );
    res.status(500).send(false);
  }
});

// ---------------- HEALTH CHECK ----------------
app.get("/check", (req, res) => {
  res.send("Server is running fine");
});

// ---------------- SERVER ----------------
app.listen(5000, () => {
  console.log("🚀 Backend running on port 5000");
});
