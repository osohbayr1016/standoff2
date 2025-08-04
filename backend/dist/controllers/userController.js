"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        const existingUser = await User_1.User.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            res.status(400).json({
                error: 'User with this email or username already exists'
            });
            return;
        }
        const user = new User_1.User({
            username,
            email,
            password,
            firstName,
            lastName
        });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            token
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            token
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user._id).select('-password');
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get profile' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, bio, avatar } = req.body;
        const user = await User_1.User.findByIdAndUpdate(req.user._id, { firstName, lastName, bio, avatar }, { new: true, runValidators: true }).select('-password');
        res.json({
            message: 'Profile updated successfully',
            user
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=userController.js.map