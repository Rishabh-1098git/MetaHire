const User = require('../models/User');
const jwt = require('jsonwebtoken');
const  nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

exports.hashPassword = hashPassword;
exports.generateToken = generateToken;

// Register a new user
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create user but set isVerified to false and save OTP details
    const user = await User.create({
      email,
      password,
      isVerified: false,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires
    });

    // Send verification email using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD
      }
    });

    const receiver = {
      from: "mockAI@gmail.com",
      to: email,
      subject: "Verify Your Email Address - MetaHire",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #1A6EFA; text-align: center;">Welcome to MetaHire!</h2>
          <p>Thank you for signing up. Please verify your email address to get started.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; background: #f0f4ff; color: #1A6EFA; padding: 10px 20px; border-radius: 6px; border: 1px dashed #1A6EFA;">
              ${otp}
            </span>
          </div>
          <p>This code is valid for 10 minutes. If you did not sign up for MetaHire, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #666; text-align: center;">MetaHire AI Interview Platform</p>
        </div>
      `
    };

    await transporter.sendMail(receiver);

    res.status(201).json({
      message: 'Registration successful! Verification code sent to your email.',
      email // Send email back so frontend knows where to direct the OTP verification request
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

    // Check email verification status
    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        isNotVerified: true,
        email: user.email
      });
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

// Google OAuth verification
exports.googleAuth = async (req, res) => {
  const { credential, token } = req.body;
  if (!credential && !token) {
    return res.status(400).json({ message: "Google credential or token is required" });
  }
  try {
    let googleId, email, name, photoUrl;

    if (credential) {
      // ID Token verification (using google-auth-library)
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      photoUrl = payload.picture;
    } else {
      // Access Token verification (via userinfo endpoint)
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user info from Google");
      }
      const payload = await response.json();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      photoUrl = payload.picture;
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.photoUrl && photoUrl) user.photoUrl = photoUrl;
        if (!user.name && name) user.name = name;
        user.isVerified = true;
        await user.save();
      }
    } else {
      user = await User.create({
        email,
        name: name || "",
        photoUrl: photoUrl || "",
        googleId,
        isVerified: true
      });
    }

    const tokenJwt = generateToken(user._id);

    return res.status(200).json({
      token: tokenJwt,
      message: "Logged in successfully with Google",
    });
  } catch (error) {
    console.error("Google authentication error:", error);
    return res.status(500).json({ message: "Google authentication failed", error: error.message });
  }
};

// Verify Email OTP
exports.verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and verification code are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      const token = generateToken(user._id);
      return res.status(200).json({ token, message: "Email already verified" });
    }

    if (!user.verificationOtp || user.verificationOtp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (new Date() > user.verificationOtpExpires) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      message: "Email verified successfully!",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Resend Verification OTP
exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "This email is already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationOtp = otp;
    user.verificationOtpExpires = otpExpires;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD
      }
    });

    const receiver = {
      from: "mockAI@gmail.com",
      to: email,
      subject: "Verify Your Email Address - MetaHire (New Code)",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #1A6EFA; text-align: center;">Welcome to MetaHire!</h2>
          <p>Please use this new verification code to verify your email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; background: #f0f4ff; color: #1A6EFA; padding: 10px 20px; border-radius: 6px; border: 1px dashed #1A6EFA;">
              ${otp}
            </span>
          </div>
          <p>This code is valid for 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #666; text-align: center;">MetaHire AI Interview Platform</p>
        </div>
      `
    };

    await transporter.sendMail(receiver);

    return res.status(200).json({ message: "Verification code sent to your email." });
  } catch (error) {
    console.error("Error resending verification code:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

