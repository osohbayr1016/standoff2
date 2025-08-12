import { Router, Request, Response } from "express";
import Notification, { NotificationStatus } from "../models/Notification";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Get all notifications for current user
router.get(
  "/notifications",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { page = 1, limit = 20, status } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Build query
      const query: any = { recipientId: userId };
      if (
        status &&
        Object.values(NotificationStatus).includes(status as NotificationStatus)
      ) {
        query.status = status;
      }

      // Get notifications
      const notifications = await Notification.find(query)
        .populate("senderId", "id name avatar")
        .populate("recipientId", "id name avatar")
        .populate("relatedMessageId")
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip(offset)
        .lean();

      // Get total count
      const totalCount = await Notification.countDocuments(query);

      return res.json({
        notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          hasMore: notifications.length === limitNum,
        },
      });
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get unread notification count
router.get(
  "/notifications/unread/count",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      const unreadCount = await Notification.countDocuments({
        recipientId: userId,
        status: NotificationStatus.PENDING,
      });

      return res.json({ unreadCount });
    } catch (error) {
      console.error("Get unread notification count error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Mark notification as seen
router.patch(
  "/notifications/:notificationId/seen",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { notificationId } = req.params;
      const userId = (req.user as any).id;

      const notification = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipientId: userId,
        },
        { status: NotificationStatus.SEEN },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      return res.json({ message: "Notification marked as seen", notification });
    } catch (error) {
      console.error("Mark notification as seen error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Mark all notifications as seen
router.patch(
  "/notifications/seen/all",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      const result = await Notification.updateMany(
        {
          recipientId: userId,
          status: NotificationStatus.PENDING,
        },
        { status: NotificationStatus.SEEN }
      );

      return res.json({
        message: "All notifications marked as seen",
        updatedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Mark all notifications as seen error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Mark notifications from specific sender as seen
router.patch(
  "/notifications/seen/sender/:senderId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { senderId } = req.params;
      const userId = (req.user as any).id;

      const result = await Notification.updateMany(
        {
          recipientId: userId,
          senderId: senderId,
          status: NotificationStatus.PENDING,
        },
        { status: NotificationStatus.SEEN }
      );

      return res.json({
        message: "Notifications from sender marked as seen",
        updatedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Mark notifications from sender as seen error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete notification
router.delete(
  "/notifications/:notificationId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { notificationId } = req.params;
      const userId = (req.user as any).id;

      const notification = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipientId: userId,
        },
        { status: NotificationStatus.DELETED },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      return res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Delete notification error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete all notifications
router.delete(
  "/notifications",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { status } = req.query;

      const query: any = { recipientId: userId };
      if (
        status &&
        Object.values(NotificationStatus).includes(status as NotificationStatus)
      ) {
        query.status = status;
      }

      const result = await Notification.updateMany(query, {
        status: NotificationStatus.DELETED,
      });

      return res.json({
        message: "Notifications deleted successfully",
        deletedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Delete all notifications error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
