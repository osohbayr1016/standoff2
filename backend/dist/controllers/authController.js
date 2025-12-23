"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.logout = exports.getCurrentUser = exports.register = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (userId, email, role) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is required");
    }
    const payload = { id: userId, email, role };
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: "7d" });
};
const login = async (request, reply) => {
    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return reply.status(400).send({
                success: false,
                message: "Email and password are required",
            });
        }
        const user = await User_1.default.findOne({ email }).select("+password");
        if (!user) {
            return reply.status(401).send({
                success: false,
                message: "Invalid email or password",
            });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return reply.status(401).send({
                success: false,
                message: "Invalid email or password",
            });
        }
        const token = generateToken(user._id.toString(), user.email, user.role);
        user.lastSeen = new Date();
        user.isOnline = true;
        await user.save();
        const userResponse = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
        };
        reply.send({
            success: true,
            message: "Login successful",
            user: userResponse,
            token,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        reply.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.login = login;
const register = async (request, reply) => {
    try {
        const { name, email, password, role } = request.body;
        if (!name || !email || !password || !role) {
            return reply.status(400).send({
                success: false,
                message: "Name, email, password, and role are required",
            });
        }
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return reply.status(409).send({
                success: false,
                message: "User with this email already exists",
            });
        }
        const validRoles = ["PLAYER", "COACH", "ORGANIZATION", "ADMIN"];
        if (!validRoles.includes(role)) {
            return reply.status(400).send({
                success: false,
                message: "Invalid role. Must be one of: PLAYER, COACH, ORGANIZATION, ADMIN",
            });
        }
        const user = new User_1.default({
            name,
            email,
            password,
            role,
        });
        await user.save();
        const token = generateToken(user._id.toString(), user.email, user.role);
        const userResponse = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
        };
        reply.status(201).send({
            success: true,
            message: "Registration successful",
            user: userResponse,
            token,
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        reply.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.register = register;
const getCurrentUser = async (request, reply) => {
    try {
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                message: "Authentication required",
            });
        }
        reply.send({
            success: true,
            data: {
                user: request.user,
            },
        });
    }
    catch (error) {
        console.error("Get current user error:", error);
        reply.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getCurrentUser = getCurrentUser;
const logout = async (request, reply) => {
    try {
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                message: "Authentication required",
            });
        }
        await User_1.default.findByIdAndUpdate(request.user.id, {
            isOnline: false,
            lastSeen: new Date(),
        });
        reply.send({
            success: true,
            message: "Logout successful",
        });
    }
    catch (error) {
        console.error("Logout error:", error);
        reply.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.logout = logout;
const refreshToken = async (request, reply) => {
    try {
        if (!request.user) {
            return reply.status(401).send({
                success: false,
                message: "Authentication required",
            });
        }
        const token = generateToken(request.user.id, request.user.email, request.user.role);
        await User_1.default.findByIdAndUpdate(request.user.id, {
            lastSeen: new Date(),
        });
        reply.send({
            success: true,
            message: "Token refreshed successfully",
            user: request.user,
            token,
        });
    }
    catch (error) {
        console.error("Token refresh error:", error);
        reply.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.refreshToken = refreshToken;
