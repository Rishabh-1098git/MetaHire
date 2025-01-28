const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have a User model
const { request } = require('express');

const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header contains a Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the Authorization header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password'); // Exclude the password from user info

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error('JWT verification failed:', error);
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, bio, skills } = req.body;

    // Find the user by ID (we'll get the user ID from the JWT token)
    const user = await User.findById(req.user.id); // `req.user.id` comes from the authenticate middleware

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user data
    user.name = name || user.name;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.skills = skills || user.skills;

    // Save the updated user data
    await user.save();

    // Return the updated user data
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        feedbacks: user.feedbacks,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = protect;
