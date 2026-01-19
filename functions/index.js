// functions/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Stripe = require("stripe");

// Load environment variables
dotenv.config();

// Initialize Stripe
// Ensure STRIPE_SECRET_KEY is added in Render Dashboard -> Settings -> Environment
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Simple test route
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Success! Your Amazon API is running on Render.",
    stripe_configured: !!process.env.STRIPE_SECRET_KEY 
  });
});

// Payment route
app.post("/payment/create", async (req, res) => {
  // Use req.query.total or req.body.total depending on your frontend setup
  // Usually, Stripe totals are passed in the URL query for this project
  const total = parseInt(req.query.total); 

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

// --- RENDER SPECIFIC START COMMAND ---
// This replaces the "exports.api" line used for Firebase
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});