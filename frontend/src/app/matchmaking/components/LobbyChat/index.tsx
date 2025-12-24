import React, { useState, useEffect, useCallback } from "react";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import MessageList, { ChatMessage } from "./MessageList";
import ChatInput from "./ChatInput";
import { Socket } from "socket.io-client";

interface LobbyChatProps {
  lobbyId: string;
  socket: Socket | null;
  currentUserId: string;
}

const LobbyChat: React.FC<LobbyChatProps> = ({ lobbyId, socket, currentUserId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Track socket connection status
  useEffect(() => {
    if (!socket) {
      setIsConnected(false);
      return;
    }

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    if (socket.connected) {
      setIsConnected(true);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`lobby_chat_${lobbyId}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved messages", e);
      }
    }
  }, [lobbyId]);

  // Save to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`lobby_chat_${lobbyId}`, JSON.stringify(messages));
    }
  }, [messages, lobbyId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: ChatMessage) => {
      console.log("📩 Received lobby chat:", data);

      setMessages((prev) => {
        // Prevent duplicates by ID
        if (prev.some(m => m.id === data.id)) return prev;

        // If it's our own message, try to replace the optimistic "Me" version
        if (data.senderId?.toString() === currentUserId?.toString()) {
          const optimisticIndex = prev.findIndex(m =>
            m.senderId?.toString() === currentUserId?.toString() &&
            m.message === data.message &&
            m.senderName === "Me"
          );

          if (optimisticIndex !== -1) {
            const newMessages = [...prev];
            newMessages[optimisticIndex] = data;
            return newMessages;
          }

          // If no optimistic message found, just add it if not already there
          return [...prev, data];
        }

        // Someone else's message - add it!
        return [...prev, data];
      });
    };

    socket.on("new_lobby_chat", handleNewMessage);

    socket.on("lobby_chat_history", (history: any[]) => {
      setMessages(history);
    });

    // Listen for match end to wipe history
    socket.on("match_ended", (data: any) => {
      console.log("🛑 Match ended, wiping chat:", data.message);
      // 1. Clear LocalStorage
      localStorage.removeItem(`lobby_chat_${lobbyId}`);
      // 2. Clear UI
      setMessages([]);
      // 3. User feedback
      alert(data.message || "Match finished. Chat history has been deleted for privacy.");
    });

    return () => {
      socket.off("new_lobby_chat", handleNewMessage);
      socket.off("lobby_chat_history");
      socket.off("match_ended");
    };
  }, [socket, lobbyId, currentUserId]);

  const handleSendMessage = useCallback((message: string) => {
    if (socket && lobbyId && message.trim()) {
      const chatData: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lobbyId,
        senderId: currentUserId,
        senderName: "Me", // Immediate feedback
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };

      // Optimistically add to local state
      setMessages((prev) => {
        // Prevent duplicate messages if server broadcast arrives extremely fast
        if (prev.some(m => m.id === chatData.id)) return prev;
        return [...prev, chatData];
      });

      // Emit to server
      socket.emit("send_lobby_chat", { lobbyId, message: message.trim() });
    }
  }, [socket, lobbyId, currentUserId]);

  return (
    <div className={`fixed bottom-4 right-4 z-40 w-80 flex flex-col transition-all duration-300 ${isExpanded ? "h-96" : "h-12"
      } bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700 shadow-2xl overflow-hidden`}>
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-3 cursor-pointer bg-gray-800/80 hover:bg-gray-800 border-b border-gray-700"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold text-white">Lobby Chat</span>
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
      </div>

      {isExpanded && (
        <>
          <MessageList messages={messages} currentUserId={currentUserId} />
          <ChatInput onSendMessage={handleSendMessage} disabled={!isConnected} />
        </>
      )}
    </div>
  );
};

export default LobbyChat;

