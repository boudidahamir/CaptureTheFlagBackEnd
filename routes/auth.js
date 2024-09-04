require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // For secure token generation
const User = require('../models/User');

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Use environment variable

// Register Route
router.post('/register', async (req, res) => {
    const { email, password, nickname } = req.body;

    // Basic field validation
    if (!email || !password || !nickname) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // Password strength validation (optional)
    if (password.length < 2) {
        return res.status(400).json({ success: false, message: 'Password must be at least 2 characters long.' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email is already in use.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new user
        const user = new User({ email, password: hashedPassword, nickname });
        await user.save();

        res.status(201).json({ success: true, message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});



// Password Recovery Route
router.post('/recover', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('User not found');
        
        const token = crypto.randomBytes(32).toString('hex'); // Generate a secure token
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();
        
        // Send recovery email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER, // Use environment variables
                pass: process.env.EMAIL_PASS
            }
        });
        
        const resetLink = `https://capturetheflagfrontend-production.up.railway.app/resetpassword/${token}`; // Adjust the URL based on your environment

        const mailOptions = {
            to: email,
            from: process.env.EMAIL_FROM,
            subject: 'Password Recovery',
            text: `You requested a password reset. Click the following link to reset your password: ${resetLink}`,
            html: `<p>You requested a password reset. Click the following link to reset your password:</p><a href="${resetLink}">Reset Password</a>` // HTML version
        };
        
        await transporter.sendMail(mailOptions);
        res.send('Password recovery email sent');
    } catch (error) {
        console.error('Error during password recovery:', error); // Log the error for debugging
        res.status(500).send('Server error');
    }
});

// Password Reset Route
router.post('/reset/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        });
        
        if (!user) return res.status(400).send('Token is invalid or expired');
        
        user.password = await bcrypt.hash(password, 12);
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();
        
        res.send('Password updated');
    } catch (error) {
        console.error('Error during password reset:', error); // Log the error for debugging
        res.status(500).send('Server error');
    }
});

// Validate Route
router.post('/validate', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ isValid: false, message: 'User not found' });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ isValid: false, message: 'Invalid password' });
        }

        console.log("Response Payload:", { isValid: true, nickname: user.nickname });
        res.json({ isValid: true, nickname: user.nickname });

    } catch (error) {
        res.status(500).json({ isValid: false, message: 'Server error' });
    }
});

// API endpoint to get player stats by nickname
app.get('/player/:nickname', async (req, res) => {
    const { nickname } = req.params;

    try {
        const player = await Player.findOne({ nickname });

        if (player) {
            res.json({
                wins: player.wins,
                losses: player.losses,
                ratio: player.losses > 0 ? player.wins / player.losses : player.wins
            });
        } else {
            res.status(404).json({ error: 'Player not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});




module.exports = router;
