const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {uploadRoutes} = require('./routes/uploadRoutes');
const { uploadPhoto, uploadResume } = require('./multerConfig');
const protect = require('./middleware/authMiddleware');
const User = require('./models/User');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();


// Middleware
app.use(cors());
app.use(cors({
  origin: ['https://metahire.vercel.app', 'http://localhost:3000'], // Add your frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.post('/upload-photo', uploadPhoto.single('photo'), (req, res) => {
  res.status(200).json({ message: 'Photo uploaded successfully', data: req.file });
  console.log("backend "+ JSON.stringify(req.file))
});

app.post('/upload-resume', uploadResume.single('resume'), (req, res) => {
  res.status(200).json({ message: 'Resume uploaded successfully', data: req.file });
});

// Base Route
app.get('/', (req, res) => {
  res.send('API is running...');
});
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

// Existing Gemini API Call
app.post("/api/gemini", async (req, res) => {
  const { prompt } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    const responseText = result.response.text(); // Extract response text
    res.json({ questions: responseText.split("|") }); // Example split logic
  } catch (error) {
    console.error("Error calling Gemini API:", error.message);
    res.status(500).json({ message: "Error generating questions." });
  }
});

// New API Endpoint for Scoring and Feedback
app.post("/api/gemini/feedback", async (req, res) => {
  const { questionsAndAnswers } = req.body;

  // Build prompt
  const prompt = `
    For the following questions and answers, provide feedback in JSON format:
    [
      {
        "question": "What is your greatest strength?",
        "answer": "I am a quick learner.",
        "score": 8,
        "feedback": "Good response, but provide specific examples."
      }
    ]

    Questions and Answers:
    ${questionsAndAnswers.map((qa, index) => `${index + 1}. Q: ${qa.question} A: ${qa.answer}`).join("\n")}
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);


    let rawResponse = result.response.text();

    // Remove code block markers (e.g., ```json and ```)
    rawResponse = rawResponse.replace(/```json|```/g, "").trim();

    // Initialize a variable to hold the parsed feedback
    let feedback;

    try {
      // Parse the raw response as JSON
      const parsedOnce = JSON.parse(rawResponse);

      // Check if the parsed content is still a stringified JSON
      if (typeof parsedOnce === "string") {
        feedback = JSON.parse(parsedOnce); // Parse again
      } else {
        feedback = parsedOnce; // Already a JSON object
      }
    } catch (err) {
      console.error("Error parsing Gemini API response:", err.message);
      return res.status(500).json({
        message: "Invalid response format from Gemini API.",
        rawResponse, // Send the raw response for debugging purposes
      });
    }



    // Calculate total score
    const totalScore = feedback.reduce((sum, item) => sum + (item.score || 0), 0);

    res.json({ feedback, totalScore });
  } catch (error) {
    console.error("Error calling Gemini API for feedback:", error.message);
    res.status(500).json({ message: "Failed to generate feedback." });
  }
});


app.post("/api/user/feedback", protect, async (req, res) => {
  try {
    const  userId  = req.user.id; // Extract userId from the token
    const {feedback, totalScore, role, company, createdAt } = req.body;
    
    const feedbacks = feedback;
    // Update the user document with feedback
    const user = await User.findById(userId);
    await User.findByIdAndUpdate(userId, {
      $push: {
        feedbacks: {
          feedbacks,
          totalScore,
          role,
          company,
          createdAt,
        },
      },
    });
  
    res.status(200).json({ message: "Feedback saved successfully" });
  } catch (error) {
    console.error("Error saving feedback:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/user/get-feedback", protect, async (req, res) => {
  try {
    const userId = req.user.id; 
    const user = await User.findById(userId); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user); 
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});





// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
