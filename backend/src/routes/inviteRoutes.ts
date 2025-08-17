import express from "express";
import { Request, Response } from "express";
import { emailService } from "../utils/emailService";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

interface AuthenticatedRequest extends Request {
  user?: any;
}

interface InviteEmailRequest {
  recipientEmail: string;
  customMessage?: string;
}

// POST /api/v1/invite/email
router.post(
  "/email",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { recipientEmail, customMessage } = req.body as InviteEmailRequest;
      const user = req.user;

      // Validation
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Нэвтэрч ороогүй байна",
        });
      }

      if (!recipientEmail || !recipientEmail.includes("@")) {
        return res.status(400).json({
          success: false,
          message: "Зөв и-мэйл хаяг оруулна уу",
        });
      }

      // Check if user is trying to invite themselves
      if (user.email.toLowerCase() === recipientEmail.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: "Өөрийгөө урих боломжгүй",
        });
      }

      const senderName = user.name || user.email.split("@")[0];

      // Create invite link with referral tracking
      const frontendUrl =
        process.env.FRONTEND_URL || "https://e-sport-connection.vercel.app";
      const inviteLink = `${frontendUrl}/auth/register?ref=${encodeURIComponent(
        user.email
      )}&inviter=${encodeURIComponent(senderName)}`;

      // Send invite email
      const emailSent = await emailService.sendInviteEmail(
        senderName,
        user.email,
        recipientEmail,
        inviteLink
      );

      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: "И-мэйл илгээхэд алдаа гарлаа",
        });
      }

      // Log invitation for tracking (optional)
      console.log(
        `Invite sent: ${
          user.email
        } -> ${recipientEmail} at ${new Date().toISOString()}`
      );

      res.status(200).json({
        success: true,
        message: "Урилга амжилттай илгээгдлээ",
        data: {
          recipientEmail,
          senderName,
          senderEmail: user.email,
          inviteLink,
          sentAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error sending invite email:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// POST /api/v1/invite/test-email (for testing purposes)
router.post(
  "/test-email",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Нэвтэрч ороогүй байна",
        });
      }

      // Test email connection
      const connectionTest = await emailService.testConnection();

      if (!connectionTest) {
        return res.status(500).json({
          success: false,
          message: "И-мэйл серверт холбогдож чадсангүй",
        });
      }

      // Send test email to user's own email
      const senderName = user.name || user.email.split("@")[0];
      const emailSent = await emailService.sendInviteEmail(
        senderName,
        user.email,
        user.email, // Send to self for testing
        `${
          process.env.FRONTEND_URL || "https://e-sport-connection.vercel.app"
        }/auth/register?test=true`
      );

      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: "Тест и-мэйл илгээхэд алдаа гарлаа",
        });
      }

      res.status(200).json({
        success: true,
        message: "Тест и-мэйл амжилттай илгээгдлээ",
        data: {
          testEmail: user.email,
          sentAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// GET /api/v1/invite/config (get invite configuration)
router.get(
  "/config",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Нэвтэрч ороогүй байна",
        });
      }

      const frontendUrl =
        process.env.FRONTEND_URL || "https://e-sport-connection.vercel.app";
      const senderName = user.name || user.email.split("@")[0];

      res.status(200).json({
        success: true,
        message: "Урилгын тохиргоо",
        data: {
          senderName,
          senderEmail: user.email,
          platformUrl: frontendUrl,
          defaultInviteUrl: `${frontendUrl}/auth/register?ref=${encodeURIComponent(
            user.email
          )}&inviter=${encodeURIComponent(senderName)}`,
          emailServiceEnabled:
            !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS,
        },
      });
    } catch (error) {
      console.error("Error getting invite config:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

export default router;
