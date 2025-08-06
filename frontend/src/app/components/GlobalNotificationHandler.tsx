"use client";

import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import notificationService from "../utils/notificationService";

export default function GlobalNotificationHandler() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Request notification permission on component mount
    notificationService.requestPermission();

    const handleNewMessage = (event: CustomEvent) => {
      const { senderId, senderName, content } = event.detail;

      // Don't show notification if the user is the sender
      if (senderId === user.id) return;

      // Show notification for new messages
      notificationService.showMessageNotification(
        senderName,
        content,
        senderId
      );
    };

    const handleNotification = (event: CustomEvent) => {
      const { type, title, message } = event.detail;

      switch (type) {
        case "new_message":
          // Already handled by handleNewMessage
          break;
        case "user_online":
          notificationService.showGeneralNotification(
            "User Online",
            `${event.detail.userName} is now online`,
            "info"
          );
          break;
        case "user_offline":
          notificationService.showGeneralNotification(
            "User Offline",
            `${event.detail.userName} is now offline`,
            "info"
          );
          break;
        default:
          notificationService.showGeneralNotification(title, message, "info");
      }
    };

    const handleUserStatusChanged = (event: CustomEvent) => {
      const { userName, status } = event.detail;

      notificationService.showGeneralNotification(
        "Status Update",
        `${userName} is now ${status}`,
        "info"
      );
    };

    // Add event listeners
    window.addEventListener("new_message", handleNewMessage as EventListener);
    window.addEventListener(
      "notification",
      handleNotification as EventListener
    );
    window.addEventListener(
      "user_status_changed",
      handleUserStatusChanged as EventListener
    );

    return () => {
      window.removeEventListener(
        "new_message",
        handleNewMessage as EventListener
      );
      window.removeEventListener(
        "notification",
        handleNotification as EventListener
      );
      window.removeEventListener(
        "user_status_changed",
        handleUserStatusChanged as EventListener
      );
    };
  }, [user]);

  return null; // This component doesn't render anything
}
