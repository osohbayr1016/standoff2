import { Router, Request, Response, NextFunction } from "express";
import Message, { MessageStatus } from "../models/Message";
import User from "../models/User";
import { authenticateToken } from "../middleware/auth";
import { NotificationService } from "../utils/notificationService";

const router = Router();

// Sockets disabled; always treat receiver as offline

// Send message
router.post(
  "/messages",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { receiverId, content } = req.body;
      const senderId = (req.user as any).id;

      // Validate input
      if (!receiverId || !content) {
        return res
          .status(400)
          .json({ message: "Receiver ID and content are required" });
      }

      // Check if receiver exists
      const receiver = await User.findById(receiverId);

      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }

      // Prevent sending message to self
      if (senderId === receiverId) {
        return res
          .status(400)
          .json({ message: "Cannot send message to yourself" });
      }

      // Create message
      const message = await Message.create({
        senderId,
        receiverId,
        content,
        status: MessageStatus.SENT,
      });

      // Populate sender and receiver details
      await message.populate([
        { path: "senderId", select: "id name avatar" },
        { path: "receiverId", select: "id name avatar" },
      ]);

      // Sockets disabled; create notification
      await NotificationService.createMessageNotification(
        senderId,
        receiverId,
        message._id.toString(),
        content
      );

      return res.status(201).json({
        message: "Message sent successfully",
        data: message,
      });
    } catch (error) {
      console.error("Send message error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get conversation messages
router.get(
  "/messages/:userId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const currentUserId = (req.user as any).id;
      const { page = 1, limit = 50 } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Get messages between the two users
      const messages = await Message.find({
        $or: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      })
        .populate("senderId", "id name avatar")
        .populate("receiverId", "id name avatar")
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip(offset)
        .lean();

      // Mark received messages as read
      await Message.updateMany(
        {
          senderId: userId,
          receiverId: currentUserId,
          status: { $in: [MessageStatus.SENT, MessageStatus.DELIVERED] },
        },
        { status: MessageStatus.READ }
      );

      // Mark notifications from this sender as seen
      await NotificationService.markNotificationsAsSeen(currentUserId, userId);

      return res.json({
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          page: pageNum,
          limit: limitNum,
          hasMore: messages.length === limitNum,
        },
      });
    } catch (error) {
      console.error("Get messages error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get user conversations
router.get(
  "/conversations",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      // Get all messages where user is sender or receiver
      const messages = await Message.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
        .populate("senderId", "id name avatar")
        .populate("receiverId", "id name avatar")
        .sort({ createdAt: -1 })
        .lean();

      // Group messages by conversation partner
      const conversationsMap = new Map();

      messages.forEach((message) => {
        const sender = message.senderId as any;
        const receiver = message.receiverId as any;

        const partnerId = sender._id === userId ? receiver._id : sender._id;

        const partner = sender._id === userId ? receiver : sender;

        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, {
            partner: {
              _id: partnerId,
              name: partner.name,
              avatar: partner.avatar,
              isOnline: false, // You can implement online status logic here
            },
            lastMessage: message,
            unreadCount: 0,
          });
        } else {
          const conversation = conversationsMap.get(partnerId);
          // Update unread count for messages received by current user
          if (receiver._id === userId && message.status === "SENT") {
            conversation.unreadCount++;
          }
        }
      });

      const conversations = Array.from(conversationsMap.values());

      return res.json({
        conversations,
        total: conversations.length,
      });
    } catch (error) {
      console.error("Get conversations error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Mark messages as read
router.patch(
  "/messages/read",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { senderId } = req.body;
      const receiverId = (req.user as any).id;

      if (!senderId) {
        return res.status(400).json({ message: "Sender ID is required" });
      }

      await Message.updateMany(
        {
          senderId,
          receiverId,
          status: { $in: [MessageStatus.SENT, MessageStatus.DELIVERED] },
        },
        { status: MessageStatus.READ }
      );

      return res.json({ message: "Messages marked as read" });
    } catch (error) {
      console.error("Mark messages as read error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get unread message count
router.get(
  "/messages/unread/count",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      const unreadCount = await Message.countDocuments({
        receiverId: userId,
        status: { $in: [MessageStatus.SENT, MessageStatus.DELIVERED] },
      });

      return res.json({ unreadCount });
    } catch (error) {
      console.error("Get unread count error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete message (only sender can delete)
router.delete(
  "/messages/:messageId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;
      const userId = (req.user as any).id;

      const message = await Message.findById(messageId);

      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      if (message.senderId.toString() !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await Message.findByIdAndDelete(messageId);

      return res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Delete message error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
