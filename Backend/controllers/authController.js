const User = require('../models/User');
const jwt = require('jsonwebtoken');
const  nodemailer = require('nodemailer');



const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

exports.test = async(req, res) => {
  const {email, password} = req.body;

  return res.status(200).json({email, password});
}

// Register a new user
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login an existing user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);


    res.status(200).json({
      token,
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    console.log("User : backend " + user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      email: user.email,
      name: user.name,
      bio: user.bio,
      skills: user.skills,
      photoUrl: user.photoUrl,
      feedbacks: user.feedbacks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, bio, skills, photoUrl } = req.body;

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
    user.photoUrl = photoUrl || user.photoUrl;
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
        photoUrl: user.photoUrl,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgetPassword = async (req, res) => {
  try{
    const {email} = req.body;

    if(!email){
      return res.status(400).json({message: "Email is required"});
    }

    const checkUser = await User.findOne({email});

    if(!checkUser){
      return res.status(404).json({message: "User not found"});
    }
    // console.log("User : " + checkUser)

    const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '1h'});

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD
      }
    })

    const receiver = {
      from: "mockAI@gmail.com",
      to: email,
      subject: "Password Reset Request",
      // Change this line to use your frontend URL and route
      text: `Click on this link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`
      // Assuming your frontend runs on port 3000
    };


    await transporter.sendMail(receiver);

    return res.status(200).json({message: "Password reset link sent to your email"});
  }catch(error){
    return res.status(500).json({message: "Server error"});
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decode.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password;  // Directly assign, will be hashed automatically
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

