const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { uploadPhoto, uploadResume } = require('./multerConfig');
const protect = require('./middleware/authMiddleware');
const User = require('./models/User');
const { generateQuestions, generateFeedback } = require('./services/geminiService');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();


// Middleware
app.use(cors({
  origin: ['https://metahire.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options('*', cors());


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

app.post('/api/gemini', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({
      message: 'Prompt is required.',
      retryable: false,
    });
  }

  try {
    const questions = await generateQuestions(prompt);
    return res.json({ questions });
  } catch (error) {
    console.error('Error calling Gemini API for questions:', error.message);
    return res.status(500).json({
      message: 'Failed to generate interview questions.',
      retryable: true,
      error: error.message,
    });
  }
});

app.post('/api/gemini/feedback', async (req, res) => {
  const { questionsAndAnswers } = req.body;

  if (!Array.isArray(questionsAndAnswers) || questionsAndAnswers.length === 0) {
    return res.status(400).json({
      message: 'questionsAndAnswers must be a non-empty array.',
      retryable: false,
    });
  }

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
    ${questionsAndAnswers.map((qa, index) => `${index + 1}. Q: ${qa.question} A: ${qa.answer}`).join('\n')}
  `;

  try {
    const feedback = await generateFeedback(prompt);
    const totalScore = feedback.reduce((sum, item) => sum + (item.score || 0), 0);

    return res.json({ feedback, totalScore });
  } catch (error) {
    console.error('Error calling Gemini API for feedback:', error.message);
    return res.status(500).json({
      message: 'Failed to generate feedback.',
      retryable: true,
      error: error.message,
    });
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
