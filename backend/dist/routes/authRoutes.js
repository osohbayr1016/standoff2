"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importStar(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const validatePassword = (password) => {
    if (password.length < 6) {
        return {
            isValid: false,
            message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой",
        };
    }
    if (password.length > 128) {
        return { isValid: false, message: "Нууц үг хэт урт байна" };
    }
    return { isValid: true, message: "" };
};
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
});
router.get("/facebook", passport_1.default.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", passport_1.default.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
});
router.post("/register", async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: "И-мэйл, нууц үг болон нэр шаардлагатай",
            });
        }
        if (email === null ||
            email === undefined ||
            password === null ||
            password === undefined ||
            name === null ||
            name === undefined) {
            return res.status(400).json({
                success: false,
                message: "И-мэйл, нууц үг болон нэр хоосон байж болохгүй",
            });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "И-мэйл хаяг буруу форматтай байна",
            });
        }
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message,
            });
        }
        if (name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Нэр хамгийн багадаа 2 тэмдэгт байх ёстой",
            });
        }
        if (name.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: "Нэр хэт урт байна",
            });
        }
        const role = User_1.UserRole.PLAYER;
        const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Энэ и-мэйл хаягтай хэрэглэгч аль хэдийн бүртгэлтэй байна",
            });
        }
        const user = await User_1.default.create({
            email: email.toLowerCase().trim(),
            password,
            name: name.trim(),
            role,
            isVerified: false,
            isOnline: true,
            lastSeen: new Date(),
        });
        const token = generateToken(user);
        return res.status(201).json({
            success: true,
            message: "Хэрэглэгч амжилттай бүртгэгдлээ",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
                avatar: user.avatar,
            },
            token,
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Серверийн алдаа гарлаа. Дахин оролдоно уу.",
        });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "И-мэйл болон нууц үг шаардлагатай",
            });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "И-мэйл хаяг буруу форматтай байна",
            });
        }
        const user = await User_1.default.findOne({ email: email.toLowerCase() });
        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                message: "И-мэйл эсвэл нууц үг буруу байна",
            });
        }
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "И-мэйл эсвэл нууц үг буруу байна",
            });
        }
        await User_1.default.findByIdAndUpdate(user._id, {
            lastSeen: new Date(),
            isOnline: true,
        });
        const token = generateToken(user);
        return res.json({
            success: true,
            message: "Амжилттай нэвтэрлээ",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
                avatar: user.avatar,
            },
            token,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Серверийн алдаа гарлаа. Дахин оролдоно уу.",
        });
    }
});
router.put("/role", auth_1.authenticateToken, async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.user.id;
        if (!Object.values(User_1.UserRole).includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Буруу үүрэг",
            });
        }
        const updatedUser = await User_1.default.findByIdAndUpdate(userId, { role }, { new: true, select: "id email name role isVerified avatar" });
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Хэрэглэгч олдсонгүй",
            });
        }
        const token = generateToken(updatedUser);
        return res.json({
            success: true,
            message: "Үүрэг амжилттай шинэчлэгдлээ",
            user: updatedUser,
            token,
        });
    }
    catch (error) {
        console.error("Role update error:", error);
        return res.status(500).json({
            success: false,
            message: "Серверийн алдаа гарлаа. Дахин оролдоно уу.",
        });
    }
});
router.get("/me", auth_1.authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user,
    });
});
router.post("/logout", auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await User_1.default.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
        });
        res.json({
            success: true,
            message: "Амжилттай гарлаа",
        });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Серверийн алдаа гарлаа",
        });
    }
});
router.post("/refresh", auth_1.authenticateToken, (req, res) => {
    try {
        const user = req.user;
        const newToken = generateToken(user);
        res.json({
            success: true,
            token: newToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
                avatar: user.avatar,
            },
        });
    }
    catch (error) {
        console.error("Token refresh error:", error);
        res.status(500).json({
            success: false,
            message: "Токен шинэчлэхэд алдаа гарлаа",
        });
    }
});
exports.default = router;
