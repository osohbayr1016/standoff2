import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const notificationRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  // Health check
  fastify.get("/notifications/health", async (request, reply) => {
    return {
      success: true,
      message: "Notification routes available",
      timestamp: new Date().toISOString(),
    };
  });

  // Get all notifications for the current user
  fastify.get(
    "/notifications",
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

        // For now, return empty notifications array with proper structure
        // This can be extended with actual database queries later
        return reply.send({
          success: true,
          notifications: [],
          count: 0,
          unreadCount: 0,
        });
      } catch (error) {
        console.error("Error fetching notifications:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to fetch notifications",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Get unread notifications count
  fastify.get(
    "/notifications/unread/count",
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

        // For now, return 0 unread notifications
        return reply.send({
          success: true,
          count: 0,
        });
      } catch (error) {
        console.error("Error fetching unread notification count:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to fetch unread notification count",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Mark notification as read
  fastify.post(
    "/notifications/:notificationId/read",
    {
      preHandler: authenticateToken,
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { notificationId } = request.params as { notificationId: string };
        const currentUserId = request.user?.id;

        if (!currentUserId) {
          return reply.status(401).send({
            success: false,
            message: "Authentication required",
          });
        }

        if (!notificationId) {
          return reply.status(400).send({
            success: false,
            message: "Notification ID is required",
          });
        }

        // This would normally update the database
        return reply.send({
          success: true,
          message: "Notification marked as read",
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to mark notification as read",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Mark all notifications as read
  fastify.post(
    "/notifications/read-all",
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

        // This would normally update the database
        return reply.send({
          success: true,
          message: "All notifications marked as read",
        });
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to mark all notifications as read",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Delete a notification
  fastify.delete(
    "/notifications/:notificationId",
    {
      preHandler: authenticateToken,
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const { notificationId } = request.params as { notificationId: string };
        const currentUserId = request.user?.id;

        if (!currentUserId) {
          return reply.status(401).send({
            success: false,
            message: "Authentication required",
          });
        }

        if (!notificationId) {
          return reply.status(400).send({
            success: false,
            message: "Notification ID is required",
          });
        }

        // This would normally delete from the database
        return reply.send({
          success: true,
          message: "Notification deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting notification:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to delete notification",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );
};

export default notificationRoutes;
