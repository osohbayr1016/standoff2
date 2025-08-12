"use client";

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function TestChatPage() {
  const { getToken } = useAuth();
  const [testMessage, setTestMessage] = useState("");
  const [targetUserId, setTargetUserId] = useState("");

  const sendTestMessage = async () => {
    const token = getToken();
    if (!token || !testMessage.trim() || !targetUserId.trim()) return;

    try {
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

      if (response.ok) {
        alert(
          "Test message sent! Check the Instagram-style chat in the bottom-right corner."
        );
        setTestMessage("");
      } else {
        alert("Failed to send test message");
      }
    } catch (error) {
      console.error("Error sending test message:", error);
      alert("Error sending test message");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Chat System Test</h1>

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

          <button
            onClick={sendTestMessage}
            disabled={!testMessage.trim() || !targetUserId.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Send Test Message
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>• Look for the purple chat button in the bottom-right corner</p>
            <p>• Click it to open the Instagram-style chat interface</p>
            <p>• You&apos;ll see all your conversations listed</p>
            <p>• Click on a conversation to start chatting</p>
            <p>
              • Notifications will appear as toasts: &quot;username чам руу чат
              бичсэн байна&quot;
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
