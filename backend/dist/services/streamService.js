"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamService = void 0;
const StreamViewer_1 = __importDefault(require("../models/StreamViewer"));
const StreamChat_1 = __importDefault(require("../models/StreamChat"));
class StreamService {
    static async handleStreamStart(streamerId, streamData) {
        return { success: true };
    }
    static async handleStreamEnd(streamId) {
        return { success: true };
    }
    static async handleStreamUpdate(streamId, data) {
        return { success: true };
    }
    static async addViewer(streamId, viewerId, sessionId) {
        const existing = await StreamViewer_1.default.findOne({
            streamSessionId: streamId,
            odayerId: viewerId,
        });
        if (existing) {
            existing.isActive = true;
            await existing.save();
            return existing;
        }
        const viewer = await StreamViewer_1.default.create({
            streamSessionId: streamId,
            odayerId: viewerId,
            sessionId,
            isActive: true,
        });
        return viewer;
    }
    static async removeViewer(streamId, viewerId, sessionId) {
        await StreamViewer_1.default.updateOne({ streamSessionId: streamId, odayerId: viewerId }, { isActive: false });
        return { success: true };
    }
    static async sendChatMessage(streamId, userId, message, replyToId) {
        const chatMessage = await StreamChat_1.default.create({
            streamId,
            userId,
            message,
            replyToId: replyToId || undefined,
        });
        return chatMessage;
    }
}
exports.StreamService = StreamService;
exports.default = StreamService;
