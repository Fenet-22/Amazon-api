// functions/index.js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Stripe = require("stripe");

// Load environment variables from .env
dotenv.config();

// Initialize Stripe using only env variable (no functions.config())
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

// Payment route
app.post("/payment/create", async (req, res) => {
  const total = req.query.total;

  if (!total || total <= 0) {
    return res.status(400).json({ error: "Invalid total amount" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
    });

    console.log("Payment received:", total);

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Payment failed" });
  }
});

// Firebase export (REQUIRED)
exports.api = functions.https.onRequest(app);
