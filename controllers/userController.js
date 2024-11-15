const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Sign up new user
exports.signup = async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser.username });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
};

// Login user and issue JWT token
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            // Create JWT token
            const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
            return res.status(200).json({ message: 'Login successful', token });
        } else {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Error logging in' });
    }
};

// Dashboard access - protected route
exports.dashboard = (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({
            message: 'Welcome to the Admin Dashboard',
            user: decoded.username,
        });
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};
