// functions/index.js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Stripe = require("stripe");

// Load environment variables
// Ensure your .env file is INSIDE the functions folder
dotenv.config();

// Initialize Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
// origin: true allows any origin (perfect for development)
app.use(cors({ origin: true }));
app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Success! Firebase Functions are working.",
    stripe_configured: !!process.env.STRIPE_SECRET_KEY 
  });
});

// Payment route
app.post("/payment/create", async (req, res) => {
  const total = parseInt(req.query.total); // Ensure total is an integer

  console.log("Payment Request Received for amount:", total);

  if (!total || total <= 0) {
    console.error("Invalid Amount received:", req.query.total);
    return res.status(400).json({ 
      error: "Invalid total amount. Amount must be greater than 0." 
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total, // amount in cents
      currency: "usd",
    });

    console.log("PaymentIntent Created Successfully:", paymentIntent.id);

    // Send back the clientSecret to the frontend
    res.status(201).json({ 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (err) {
    console.error("Stripe error detail:", err.message);
    res.status(500).json({ 
      error: "Payment Intent creation failed", 
      message: err.message 
    });
  }
});

// Firebase export
exports.api = functions.https.onRequest(app);