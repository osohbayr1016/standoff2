"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { useNotifications } from "../hooks/useNotifications";

interface DebugInfo {
  user: {
    id: string;
    name: string;
    role: string;
  } | null;
  socketConnected: boolean;
  unreadCount: number;
  notificationsCount: number;
  timestamp: string;
}

export default function TestChatPage() {
  const { getToken, user } = useAuth();
  const { isConnected, socket } = useSocket();
  const { unreadCount, notifications } = useNotifications();
  const [testMessage, setTestMessage] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    user: null,
    socketConnected: false,
    unreadCount: 0,
    notificationsCount: 0,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    // Update debug info
    setDebugInfo({
      user: user ? { id: user.id, name: user.name, role: user.role } : null,
      socketConnected: isConnected,
      unreadCount,
      notificationsCount: notifications.length,
      timestamp: new Date().toISOString(),
    });
  }, [user, isConnected, unreadCount, notifications]);

  const sendTestMessage = async () => {
    const token = getToken();
    if (!token || !testMessage.trim() || !targetUserId.trim()) return;

    try {
      console.log("🚀 Sending test message...");
      console.log("Target User ID:", targetUserId);
      console.log("Message:", testMessage);
      console.log("Token:", token ? "Present" : "Missing");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            receiverId: targetUserId,
            content: testMessage,
          }),
        }
      );

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Message sent successfully:", data);
        alert(
          "Test message sent! Check the Instagram-style chat in the bottom-right corner and notifications in the top-right corner."
        );
        setTestMessage("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Failed to send message:", errorData);
        alert(
          `Failed to send test message: ${
            errorData.message || response.statusText
          }`
        );
      }
    } catch (error) {
      console.error("❌ Error sending test message:", error);
      alert("Error sending test message");
    }
  };

  const sendSocketMessage = () => {
    if (
      !socket ||
      !isConnected ||
      !testMessage.trim() ||
      !targetUserId.trim()
    ) {
      alert("Socket not connected or missing data");
      return;
    }

    console.log("🔌 Sending message via socket...");
    socket.emit("send_message", {
      receiverId: targetUserId,
      content: testMessage,
    });

    alert("Message sent via socket! Check for notifications.");
    setTestMessage("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Chat System Test</h1>

      {/* Debug Information */}
      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <strong>User:</strong>{" "}
              {debugInfo.user
                ? `${debugInfo.user.name} (${debugInfo.user.id})`
                : "Not logged in"}
            </p>
            <p>
              <strong>Socket Connected:</strong>{" "}
              {debugInfo.socketConnected ? "✅ Yes" : "❌ No"}
            </p>
            <p>
              <strong>Unread Count:</strong> {debugInfo.unreadCount}
            </p>
            <p>
              <strong>Notifications:</strong> {debugInfo.notificationsCount}
            </p>
          </div>
          <div>
            <p>
              <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}
            </p>
            <p>
              <strong>Last Update:</strong> {debugInfo.timestamp}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Test Chat Features</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Target User ID
            </label>
            <input
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Enter user ID to send message to..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Test Message
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Enter test message..."
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={sendTestMessage}
              disabled={!testMessage.trim() || !targetUserId.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Send via API
            </button>
            <button
              onClick={sendSocketMessage}
              disabled={
                !testMessage.trim() || !targetUserId.trim() || !isConnected
              }
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Send via Socket
            </button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>• Look for the purple chat button in the bottom-right corner</p>
            <p>• Click it to open the Instagram-style chat interface</p>
            <p>• You&apos;ll see all your conversations listed</p>
            <p>• Click on a conversation to start chatting</p>
            <p>
              • Notifications will appear as toasts: &quot;username чам руу чат
              бичсэн байна&quot;
            </p>
            <p>
              • Check the notification bell in the navigation for unread counts
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Features Included:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">🎯 Instagram-Style Interface</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Bottom-right corner chat button</li>
              <li>• Conversation list with avatars</li>
              <li>• Real-time messaging</li>
              <li>• Online/offline status</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">🔔 Notification System</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Toast notifications</li>
              <li>• Unread message count</li>
              <li>• &quot;username чам руу чат бичсэн байна&quot; format</li>
              <li>• Offline message storage</li>
              <li>• Auto-delete after 7 days</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">💬 Chat Features</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Search conversations</li>
              <li>• Message timestamps</li>
              <li>• Read receipts</li>
              <li>• Minimize/maximize</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">🎨 UI/UX</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Dark mode support</li>
              <li>• Smooth animations</li>
              <li>• Responsive design</li>
              <li>• Modern gradient design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
