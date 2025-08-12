import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User, { UserRole } from "../models/User";
import { authenticateToken, JWTPayload } from "../middleware/auth";
import mongoose from "mongoose";

const router = Router();

// Debug endpoint to test database connection
router.get("/debug", async (req: Request, res: Response) => {
  try {
    // Test database connection
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    // Test User model
    const userCount = await User.countDocuments();

    res.json({
      success: true,
      database: {
        state: dbStates[dbState as keyof typeof dbStates],
        readyState: dbState,
        userCount,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasSessionSecret: !!process.env.SESSION_SECRET,
        frontendUrl: process.env.FRONTEND_URL,
      },
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.stack
            : undefined
          : undefined,
    });
  }
});

// Input validation middleware
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (
  password: string
): { isValid: boolean; message: string } => {
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

// Generate JWT token
const generateToken = (user: any): string => {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as jwt.SignOptions);
};

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req: Request, res: Response) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Facebook OAuth routes
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req: Request, res: Response) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Local registration
router.post("/register", async (req: Request, res: Response) => {
  try {
    console.log("🔍 Registration request received:", {
      email: req.body.email,
      name: req.body.name,
      role: req.body.role,
      hasPassword: !!req.body.password,
    });

    const { email, password, name, role = "PLAYER" } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "И-мэйл, нууц үг болон нэр шаардлагатай",
      });
    }

    // Additional validation to prevent null/undefined values
    if (
      email === null ||
      email === undefined ||
      password === null ||
      password === undefined ||
      name === null ||
      name === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "И-мэйл, нууц үг болон нэр хоосон байж болохгүй",
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "И-мэйл хаяг буруу форматтай байна",
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // Validate name length
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

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Буруу үүрэг сонгосон",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Энэ и-мэйл хаягтай хэрэглэгч аль хэдийн бүртгэлтэй байна",
      });
    }

    // Create user (password will be hashed by the model pre-save hook)
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      role: role as UserRole,
      isVerified: false, // Local accounts need verification
      isOnline: true,
      lastSeen: new Date(),
    });

    // Generate token
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
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Серверийн алдаа гарлаа. Дахин оролдоно уу.",
    });
  }
});

// Local login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "И-мэйл болон нууц үг шаардлагатай",
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "И-мэйл хаяг буруу форматтай байна",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "И-мэйл эсвэл нууц үг буруу байна",
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "И-мэйл эсвэл нууц үг буруу байна",
      });
    }

    // Update last seen and online status
    await User.findByIdAndUpdate(user._id, {
      lastSeen: new Date(),
      isOnline: true,
    });

    // Generate token
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
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Серверийн алдаа гарлаа. Дахин оролдоно уу.",
    });
  }
});

// Update user role (requires authentication)
router.put("/role", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const userId = (req.user as any).id;

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Буруу үүрэг",
      });
    }

    // Update user role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, select: "id email name role isVerified avatar" }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Хэрэглэгч олдсонгүй",
      });
    }

    // Generate new token with updated role
    const token = generateToken(updatedUser);

    return res.json({
      success: true,
      message: "Үүрэг амжилттай шинэчлэгдлээ",
      user: updatedUser,
      token,
    });
  } catch (error) {
    console.error("Role update error:", error);
    return res.status(500).json({
      success: false,
      message: "Серверийн алдаа гарлаа. Дахин оролдоно уу.",
    });
  }
});

// Get current user
router.get("/me", authenticateToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Logout (client-side token removal)
router.post(
  "/logout",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      // Update user's online status
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      res.json({
        success: true,
        message: "Амжилттай гарлаа",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Refresh token endpoint
router.post("/refresh", authenticateToken, (req: Request, res: Response) => {
  try {
    const user = req.user as any;
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
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Токен шинэчлэхэд алдаа гарлаа",
    });
  }
});

export default router;
