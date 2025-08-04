"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/messages', auth_1.authenticateToken, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;
        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver ID and content are required' });
        }
        const receiver = await database_1.default.user.findUnique({
            where: { id: receiverId },
        });
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }
        if (senderId === receiverId) {
            return res.status(400).json({ message: 'Cannot send message to yourself' });
        }
        const message = await database_1.default.message.create({
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
    }
    catch (error) {
        console.error('Send message error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/messages/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        const { page = 1, limit = 50 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        const messages = await database_1.default.message.findMany({
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
        await database_1.default.message.updateMany({
            where: {
                senderId: userId,
                receiverId: currentUserId,
                status: { in: ['SENT', 'DELIVERED'] },
            },
            data: { status: 'READ' },
        });
        return res.json({
            messages: messages.reverse(),
            pagination: {
                page: pageNum,
                limit: limitNum,
                hasMore: messages.length === limitNum,
            },
        });
    }
    catch (error) {
        console.error('Get messages error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/conversations', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await database_1.default.message.findMany({
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
            if (message.receiverId === userId && message.status !== 'READ') {
                conversationMap.get(partnerId).unreadCount++;
            }
        });
        const conversationList = Array.from(conversationMap.values()).sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
        return res.json({ conversations: conversationList });
    }
    catch (error) {
        console.error('Get conversations error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.patch('/messages/read', auth_1.authenticateToken, async (req, res) => {
    try {
        const { senderId } = req.body;
        const receiverId = req.user.id;
        if (!senderId) {
            return res.status(400).json({ message: 'Sender ID is required' });
        }
        await database_1.default.message.updateMany({
            where: {
                senderId,
                receiverId,
                status: { in: ['SENT', 'DELIVERED'] },
            },
            data: { status: 'READ' },
        });
        return res.json({ message: 'Messages marked as read' });
    }
    catch (error) {
        console.error('Mark messages as read error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/messages/unread/count', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const unreadCount = await database_1.default.message.count({
            where: {
                receiverId: userId,
                status: { in: ['SENT', 'DELIVERED'] },
            },
        });
        return res.json({ unreadCount });
    }
    catch (error) {
        console.error('Get unread count error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.delete('/messages/:messageId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;
        const message = await database_1.default.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        if (message.senderId !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await database_1.default.message.delete({
            where: { id: messageId },
        });
        return res.json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Delete message error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=messageRoutes.js.map