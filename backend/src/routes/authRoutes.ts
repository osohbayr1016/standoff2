import { Router, Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User, { UserRole } from "../models/User";
import { authenticateToken, JWTPayload } from "../middleware/auth";

const router = Router();

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
    const { email, password, name, role = "PLAYER" } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "И-мэйл, нууц үг болон нэр шаардлагатай" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user (password will be hashed by the model pre-save hook)
    const user = await User.create({
      email,
      password,
      name,
      role: role as UserRole,
      isVerified: false, // Local accounts need verification
    });

    // Generate token
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
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Local login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "И-мэйл болон нууц үг шаардлагатай" });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(401).json({ message: "Буруу нэвтрэх мэдээлэл" });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Буруу нэвтрэх мэдээлэл" });
    }

    // Update last seen
    await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });

    // Generate token
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
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update user role (requires authentication)
router.put("/role", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const userId = (req.user as any).id;

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: "Буруу үүрэг" });
    }

    // Update user role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, select: "id email name role isVerified" }
    );

    // Generate new token with updated role
    const token = generateToken(updatedUser);

    return res.json({
      message: "Үүрэг амжилттай шинэчлэгдлээ",
      user: updatedUser,
      token,
    });
  } catch (error) {
    console.error("Role update error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user
router.get("/me", authenticateToken, (req: Request, res: Response) => {
  res.json({
    user: req.user,
  });
});

// Logout (client-side token removal)
router.post("/logout", (req: Request, res: Response) => {
  res.json({ message: "Амжилттай гарлаа" });
});

export default router;
