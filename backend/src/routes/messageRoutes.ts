import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { MessageStatus } from '@prisma/client';

const router = Router();

// Send message
router.post('/messages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = (req.user as any).id;

    // Validate input
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Prevent sending message to self
    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        status: 'SENT',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get conversation messages
router.get('/messages/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req.user as any).id;
    const { page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Get messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: userId,
          },
          {
            senderId: userId,
            receiverId: currentUserId,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      skip: offset,
    });

    // Mark received messages as read
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: currentUserId,
        status: { in: ['SENT', 'DELIVERED'] },
      },
      data: { status: 'READ' },
    });

    return res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: pageNum,
        limit: limitNum,
        hasMore: messages.length === limitNum,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all conversations for current user
router.get('/conversations', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    // Get the latest message from each conversation
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isOnline: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isOnline: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner and get the latest message
    const conversationMap = new Map();
    
    conversations.forEach((message) => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      const partner = message.senderId === userId ? message.receiver : message.sender;
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner,
          lastMessage: message,
          unreadCount: 0,
        });
      }
      
      // Count unread messages
      if (message.receiverId === userId && message.status !== 'READ') {
        conversationMap.get(partnerId).unreadCount++;
      }
    });

    const conversationList = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );

    return res.json({ conversations: conversationList });
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark messages as read
router.patch('/messages/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { senderId } = req.body;
    const receiverId = (req.user as any).id;

    if (!senderId) {
      return res.status(400).json({ message: 'Sender ID is required' });
    }

    await prisma.message.updateMany({
      where: {
        senderId,
        receiverId,
        status: { in: ['SENT', 'DELIVERED'] },
      },
      data: { status: 'READ' },
    });

    return res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get unread message count
router.get('/messages/unread/count', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    const unreadCount = await prisma.message.count({
      where: {
        receiverId: userId,
        status: { in: ['SENT', 'DELIVERED'] },
      },
    });

    return res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete message (only sender can delete)
router.delete('/messages/:messageId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = (req.user as any).id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    return res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 