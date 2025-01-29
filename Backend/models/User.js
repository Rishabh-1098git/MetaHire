const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  question: String,
  answer: String,
  score: Number,
  feedback: String,
});

const feedbacksSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Reference to User
  feedbacks: [feedbackSchema], 
  totalScore: Number,
  role: String,
  company: String,
  createdAt: Date,
});

// User Schema
const userSchema = new mongoose.Schema({
  photoUrl: { type: String, default: "" },
  email: { type: String, required: true, unique: true, match: [/\S+@\S+\.\S+/, 'Please enter a valid email'] },
  password: { type: String, required: true },
  name: { type: String, default: "" },
  bio: { type: String, default: "" },
  skills: { type: [String], default: [] },
  feedbacks: [feedbacksSchema],  // Nested feedbacks schema
}, { timestamps: true });  // Adds createdAt and updatedAt

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare the password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// Create the model
module.exports = mongoose.model('User', userSchema);
