const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// ---------------- DB CONNECTION ----------------
mongoose
  .connect({MONGO_URI})
  .then(() => {
    console.log("✅ Connected to MongoDB");
    initMailer(); // ⬅️ start mailer AFTER DB connect
  })
  .catch(() => {
    console.log("❌ Failed to connect MongoDB");
  });

// ---------------- MODEL ----------------
const Credential = mongoose.model(
  "credential",
  {},
  "bulkmail"
);

// ---------------- GLOBAL TRANSPORTER ----------------
let transporter;

// ---------------- INIT MAILER ----------------
async function initMailer() {
  try {
    const data = await Credential.find();

    if (data.length === 0) {
      console.log("❌ No email credentials found in DB");
      return;
    }

    const creds = data[0].toJSON();

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: creds.user,
        pass: creds.pass, // Gmail App Password
      },
    });

    console.log("✅ Mail transporter ready");
  } catch (err) {
    console.error("❌ Mailer init error:", err);
  }
}

// ---------------- SEND EMAIL API ----------------
app.post("/sendemail", async (req, res) => {
  try {
    const { msg, emails } = req.body;

    if (!transporter) {
      console.log("❌ Transporter not ready");
      return res.status(500).send(false);
    }

    if (!msg || !emails || emails.length === 0) {
      return res.status(400).send(false);
    }

    for (let email of emails) {
      await transporter.sendMail({
        from: transporter.options.auth.user,
        to: email,
        subject: "Bulk Mail",
        text: msg,
      });

      console.log("✅ Mail sent to:", email);

      // avoid Gmail rate limit
      await new Promise((r) => setTimeout(r, 2000));
    }
    res.
    res.send(true);
  } catch (err) {
    console.error("❌ MAIL ERROR:", err);
    res.send(false);
  }
});

app.get("/check", async (req, res) => {
  try {
    res.send("Server is running fine");
  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).send("Something went wrong");
  }
});



// ---------------- SERVER ----------------
app.listen(5000, () => {
  console.log("🚀 Backend running on port 5000");
});
