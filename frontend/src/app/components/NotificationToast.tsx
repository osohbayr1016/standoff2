"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";

interface NotificationToastProps {
  onNotificationClick?: (notification: {
    _id: string;
    title: string;
    content: string;
    senderId: {
      _id: string;
      name: string;
      avatar?: string;
    };
    createdAt: string;
  }) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  onNotificationClick,
}) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      title: string;
      content: string;
      senderName: string;
      timestamp: string;
    }>
  >([]);

  useEffect(() => {
    if (!socket || !user) return;

    // Listen for new notifications from the notification system
    const handlePendingNotifications = (data: {
      notifications: Array<{
        _id: string;
        title: string;
        content: string;
        senderId?: {
          name: string;
        };
      }>;
      count: number;
    }) => {
      try {
        console.log("📬 Pending notifications received:", data);

        // Validate data structure
        if (!data.notifications || !Array.isArray(data.notifications)) {
          console.warn("📬 Invalid notifications data structure:", data);
          return;
        }

        // Show toast for each new notification
        data.notifications.forEach((notification) => {
          if (!notification._id || !notification.title) {
            console.warn("📬 Invalid notification data:", notification);
            return;
          }

          const toast = {
            id: notification._id,
            title: notification.title,
            content: notification.content || "",
            senderName: notification.senderId?.name || "Unknown",
            timestamp: new Date().toISOString(),
          };

          setToasts((prev) => [...prev, toast]);

          // Auto-remove toast after 5 seconds
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          }, 5000);
        });
      } catch (error) {
        console.error("📬 Error handling pending notifications:", error);
      }
    };

    // Listen for new messages (for real-time chat notifications)
    const handleNewMessage = (data: {
      id?: string;
      content: string;
      senderId: string;
      receiverId?: string;
      timestamp?: string;
      senderName: string;
      senderAvatar?: string;
    }) => {
      try {
        console.log("📨 New message notification received:", data);

        // Validate data structure
        if (!data.content || !data.senderId) {
          console.warn("📨 Invalid message data structure:", data);
          return;
        }

        // Only show notification if the message is for the current user
        if (data.receiverId === user?.id || data.receiverId === undefined) {
          const toast = {
            id: data.id || Date.now().toString(),
            title: `${data.senderName || "Someone"} чам руу чат бичсэн байна`,
            content:
              data.content.length > 50
                ? data.content.substring(0, 50) + "..."
                : data.content,
            senderName: data.senderName || "Unknown",
            timestamp: data.timestamp || new Date().toISOString(),
          };

          setToasts((prev) => [...prev, toast]);

          // Auto-remove toast after 5 seconds
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          }, 5000);
        }
      } catch (error) {
        console.error("📨 Error handling new message notification:", error);
      }
    };

    // Error handling for socket events
    const handleSocketError = (error: Error) => {
      console.error("🔌 Socket error in notification system:", error);
    };

    socket.on("pending_notifications", handlePendingNotifications);
    socket.on("new_message", handleNewMessage);
    socket.on("error", handleSocketError);

    return () => {
      socket.off("pending_notifications", handlePendingNotifications);
      socket.off("new_message", handleNewMessage);
      socket.off("error", handleSocketError);
    };
  }, [socket, user]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleToastClick = (toast: {
    id: string;
    title: string;
    content: string;
    senderName: string;
    timestamp: string;
  }) => {
    if (onNotificationClick) {
      onNotificationClick({
        _id: toast.id,
        title: toast.title,
        content: toast.content,
        senderId: {
          _id: toast.id,
          name: toast.senderName,
          avatar: undefined,
        },
        createdAt: toast.timestamp,
      });
    }
    removeToast(toast.id);
  };

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-80 max-w-sm cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleToastClick(toast)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <MessageCircle
                      size={16}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {toast.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {toast.content}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {new Date(toast.timestamp).toLocaleTimeString("mn-MN")}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
