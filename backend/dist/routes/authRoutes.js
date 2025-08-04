"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
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
        const { email, password, name, role = "PLAYER" } = req.body;
        if (!email || !password || !name) {
            return res
                .status(400)
                .json({ message: "И-мэйл, нууц үг болон нэр шаардлагатай" });
        }
        const existingUser = await database_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        const user = await database_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role,
                isVerified: false,
            },
        });
        const token = generateToken(user);
        return res.status(201).json({
            message: "Хэрэглэгч амжилттай бүртгэгдлээ",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
            },
            token,
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "И-мэйл болон нууц үг шаардлагатай" });
        }
        const user = await database_1.default.user.findUnique({
            where: { email },
        });
        if (!user || !user.password) {
            return res.status(401).json({ message: "Буруу нэвтрэх мэдээлэл" });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Буруу нэвтрэх мэдээлэл" });
        }
        await database_1.default.user.update({
            where: { id: user.id },
            data: { lastSeen: new Date() },
        });
        const token = generateToken(user);
        return res.json({
            message: "Амжилттай нэвтэрлээ",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
            },
            token,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/role", auth_1.authenticateToken, async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.user.id;
        if (!Object.values(client_1.UserRole).includes(role)) {
            return res.status(400).json({ message: "Буруу үүрэг" });
        }
        const updatedUser = await database_1.default.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true,
            },
        });
        const token = generateToken(updatedUser);
        return res.json({
            message: "Үүрэг амжилттай шинэчлэгдлээ",
            user: updatedUser,
            token,
        });
    }
    catch (error) {
        console.error("Role update error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/me", auth_1.authenticateToken, (req, res) => {
    res.json({
        user: req.user,
    });
});
router.post("/logout", (req, res) => {
    res.json({ message: "Амжилттай гарлаа" });
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map