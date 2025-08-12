import { useState, useEffect } from "react";
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
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!user?.token) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
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
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unread/count`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
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
  };

  // Mark notification as seen
  const markAsSeen = async (notificationId: string) => {
    if (!user?.token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/seen`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${user.token}`,
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
    if (!user?.token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/seen/all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${user.token}`,
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
    if (!user?.token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
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
    socket.on(
      "pending_notifications",
      (data: { notifications: Notification[]; count: number }) => {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n._id));
          const newNotifications = data.notifications.filter(
            (n) => !existingIds.has(n._id)
          );
          return [...newNotifications, ...prev];
        });
        setUnreadCount((prev) => prev + data.count);
      }
    );

    return () => {
      socket.off("pending_notifications");
    };
  }, [socket]);

  // Initial fetch
  useEffect(() => {
    if (user?.token) {
      fetchNotifications();
    }
  }, [user?.token]);

  // Auto-refresh unread count every 30 seconds
  useEffect(() => {
    if (!user?.token) return;

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.token]);

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
