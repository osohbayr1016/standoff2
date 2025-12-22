// Stream Service
import StreamSession from "../models/StreamSession";
import StreamViewer from "../models/StreamViewer";
import StreamChat from "../models/StreamChat";

export class StreamService {
  static async handleStreamStart(streamerId: string, streamData: any) {
    return { success: true };
  }

  static async handleStreamEnd(streamId: string) {
    return { success: true };
  }

  static async handleStreamUpdate(streamId: string, data: any) {
    return { success: true };
  }

  static async addViewer(
    streamId: string,
    viewerId: string,
    sessionId: string
  ) {
    const existing = await StreamViewer.findOne({
      streamSessionId: streamId,
      odayerId: viewerId,
    });
    if (existing) {
      existing.isActive = true;
      await existing.save();
      return existing;
    }

    const viewer = await StreamViewer.create({
      streamSessionId: streamId,
      odayerId: viewerId,
      sessionId,
      isActive: true,
    });
    return viewer;
  }

  static async removeViewer(
    streamId: string,
    viewerId: string,
    sessionId: string
  ) {
    await StreamViewer.updateOne(
      { streamSessionId: streamId, odayerId: viewerId },
      { isActive: false }
    );
    return { success: true };
  }

  static async sendChatMessage(
    streamId: string,
    userId: string,
    message: string,
    replyToId?: string
  ) {
    const chatMessage = await StreamChat.create({
      streamId,
      userId,
      message,
      replyToId: replyToId || undefined,
    });
    return chatMessage;
  }
}

export default StreamService;
