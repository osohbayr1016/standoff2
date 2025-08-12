import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";

interface Notification {
  _id: string;
  title: string;
  content: string;
  type: "MESSAGE" | "SYSTEM";
  status: "PENDING" | "SEEN" | "DELETED";
  senderId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  relatedMessageId?: string;
  createdAt: string;
}

export const useNotifications = () => {
  const { getToken } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(
          data.notifications?.filter(
            (n: Notification) => n.status === "PENDING"
          ).length || 0
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unread/count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [getToken]);

  // Mark notification as seen
  const markAsSeen = async (notificationId: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/seen`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, status: "SEEN" as const } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as seen:", error);
    }
  };

  // Mark all notifications as seen
  const markAllAsSeen = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/seen/all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, status: "SEEN" as const }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as seen:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
        setUnreadCount((prev) => {
          const notification = notifications.find(
            (n) => n._id === notificationId
          );
          return notification?.status === "PENDING"
            ? Math.max(0, prev - 1)
            : prev;
        });
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Listen for pending notifications when user comes online
    const handlePendingNotifications = (data: {
      notifications: Notification[];
      count: number;
    }) => {
      console.log("📬 Pending notifications received in hook:", data);

      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n._id));
        const newNotifications = data.notifications.filter(
          (n) => !existingIds.has(n._id)
        );
        return [...newNotifications, ...prev];
      });
      setUnreadCount((prev) => prev + data.count);
    };

    // Listen for new messages to update unread count
    const handleNewMessage = (data: {
      id?: string;
      content: string;
      senderId: string;
      receiverId?: string;
      timestamp?: string;
      senderName: string;
      senderAvatar?: string;
    }) => {
      console.log("📨 New message received in notifications hook:", data);
      // Update unread count when new message is received
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("pending_notifications", handlePendingNotifications);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("pending_notifications", handlePendingNotifications);
      socket.off("new_message", handleNewMessage);
    };
  }, [socket]);

  // Initial fetch
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchNotifications();
    }
  }, [getToken, fetchNotifications]);

  // Auto-refresh unread count every 30 seconds
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [getToken, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsSeen,
    markAllAsSeen,
    deleteNotification,
  };
};
