import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const messageRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Health check
  fastify.get("/messages/health", async (request, reply) => {
    return {
      success: true,
      message: "Message routes available",
      timestamp: new Date().toISOString(),
    };
  });

  // Get messages between two users
  fastify.get(
    "/messages/:userId",
    {
      preHandler: authenticateToken,
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { userId } = request.params as { userId: string };
        const currentUserId = request.user?.id;

        if (!currentUserId) {
          return reply.status(401).send({
            success: false,
            message: "Authentication required",
          });
        }

        // For now, return empty messages array with proper structure
        // This can be extended with actual database queries later
        return reply.send({
          success: true,
          messages: [],
          count: 0,
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to fetch messages",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Send a message
  fastify.post(
    "/messages",
    {
      preHandler: authenticateToken,
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { receiverId, content } = request.body as {
          receiverId: string;
          content: string;
        };
        const currentUserId = request.user?.id;

        if (!currentUserId) {
          return reply.status(401).send({
            success: false,
            message: "Authentication required",
          });
        }

        if (!receiverId || !content) {
          return reply.status(400).send({
            success: false,
            message: "Receiver ID and content are required",
          });
        }

        if (content.trim().length === 0) {
          return reply.status(400).send({
            success: false,
            message: "Message content cannot be empty",
          });
        }

        // Create message object (this would normally be saved to database)
        const message = {
          id: Date.now().toString(),
          content: content.trim(),
          senderId: currentUserId,
          receiverId,
          createdAt: new Date().toISOString(),
          sender: {
            id: currentUserId,
            name: request.user?.name || "Unknown",
            avatar: request.user?.avatar,
          },
          receiver: {
            id: receiverId,
            name: "Unknown", // This would be fetched from database
            avatar: undefined,
          },
        };

        return reply.status(201).send({
          success: true,
          message: "Message sent successfully",
          data: message,
        });
      } catch (error) {
        console.error("Error sending message:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to send message",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Mark messages as read
  fastify.post(
    "/messages/read",
    {
      preHandler: authenticateToken,
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { senderId } = request.body as { senderId: string };
        const currentUserId = request.user?.id;

        if (!currentUserId) {
          return reply.status(401).send({
            success: false,
            message: "Authentication required",
          });
        }

        if (!senderId) {
          return reply.status(400).send({
            success: false,
            message: "Sender ID is required",
          });
        }

        // This would normally update the database
        return reply.send({
          success: true,
          message: "Messages marked as read",
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to mark messages as read",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Get unread message count
  fastify.get(
    "/messages/unread/count",
    {
      preHandler: authenticateToken,
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const currentUserId = request.user?.id;

        if (!currentUserId) {
          return reply.status(401).send({
            success: false,
            message: "Authentication required",
          });
        }

        // For now, return 0 unread messages
        return reply.send({
          success: true,
          count: 0,
        });
      } catch (error) {
        console.error("Error fetching unread count:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to fetch unread count",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
};

export default messageRoutes;
