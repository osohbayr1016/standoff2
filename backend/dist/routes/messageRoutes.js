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
const Message_1 = __importStar(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/messages', auth_1.authenticateToken, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;
        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver ID and content are required' });
        }
        const receiver = await User_1.default.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }
        if (senderId === receiverId) {
            return res.status(400).json({ message: 'Cannot send message to yourself' });
        }
        const message = await Message_1.default.create({
            senderId,
            receiverId,
            content,
            status: Message_1.MessageStatus.SENT,
        });
        await message.populate([
            { path: 'senderId', select: 'id name avatar' },
            { path: 'receiverId', select: 'id name avatar' }
        ]);
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
        const messages = await Message_1.default.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId },
            ],
        })
            .populate('senderId', 'id name avatar')
            .populate('receiverId', 'id name avatar')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip(offset)
            .lean();
        await Message_1.default.updateMany({
            senderId: userId,
            receiverId: currentUserId,
            status: { $in: [Message_1.MessageStatus.SENT, Message_1.MessageStatus.DELIVERED] },
        }, { status: Message_1.MessageStatus.READ });
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
        const conversations = await Message_1.default.find({
            $or: [
                { senderId: userId },
                { receiverId: userId },
            ],
        })
            .populate('senderId', 'id name avatar isOnline')
            .populate('receiverId', 'id name avatar isOnline')
            .sort({ createdAt: -1 })
            .lean();
        const conversationMap = new Map();
        conversations.forEach((message) => {
            const partnerId = message.senderId._id.toString() === userId ? message.receiverId._id.toString() : message.senderId._id.toString();
            const partner = message.senderId._id.toString() === userId ? message.receiverId : message.senderId;
            if (!conversationMap.has(partnerId)) {
                conversationMap.set(partnerId, {
                    partner,
                    lastMessage: message,
                    unreadCount: 0,
                });
            }
            if (message.receiverId._id.toString() === userId && message.status !== Message_1.MessageStatus.READ) {
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
        await Message_1.default.updateMany({
            senderId,
            receiverId,
            status: { $in: [Message_1.MessageStatus.SENT, Message_1.MessageStatus.DELIVERED] },
        }, { status: Message_1.MessageStatus.READ });
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
        const unreadCount = await Message_1.default.countDocuments({
            receiverId: userId,
            status: { $in: [Message_1.MessageStatus.SENT, Message_1.MessageStatus.DELIVERED] },
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
        const message = await Message_1.default.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        if (message.senderId.toString() !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await Message_1.default.findByIdAndDelete(messageId);
        return res.json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Delete message error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=messageRoutes.js.map