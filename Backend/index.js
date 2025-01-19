const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { GoogleGenerativeAI } = require("@google/generative-ai");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('API is running...');
});


const genAI = new GoogleGenerativeAI("AIzaSyAYMKoVfDVgIAdZUPah5pE3tDAPKGhGfGE");

// Define the Gemini API Endpoint
app.post("/api/gemini", async (req, res) => {
  const { prompt } = req.body;

  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content based on the prompt
    const result = await model.generateContent(prompt);

    console.log("Gemini API Result:", result);

    // Extract questions or response text from the API result
    const responseText = result.response.text();
    console.log("Gemini API response:", result.response); // Inspect the API response structure
    res.json({ questions: responseText.split("|") });

  } catch (error) {
    console.error("Error calling Gemini API:", error.message);
    res.status(500).json({ message: "Error generating questions." });
  }
});
  

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
