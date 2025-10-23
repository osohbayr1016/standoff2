import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Send, Facebook } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../contexts/AuthContext";

interface MatchChatProps {
  matchId: string;
  onClose: () => void;
}

export default function MatchChat({ matchId, onClose }: MatchChatProps) {
  const { user, getToken } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (fetching) return; // Prevent multiple simultaneous requests
    
    setFetching(true);
    setError("");
    
    try {
      console.log("Fetching messages for match:", matchId);
      const token = getToken();
      
      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }
      
      console.log("Using token:", token.substring(0, 20) + "...");
      
      const response = await fetch(
        API_ENDPOINTS.MATCHES.CHAT(matchId),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );
      
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.success) {
        setMessages(data.data);
      } else {
        console.error("Failed to fetch messages:", data.message);
        setError(data.message);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to fetch messages");
    } finally {
      setFetching(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    setError("");

    try {
      console.log("Sending message:", newMessage.trim());
      const token = getToken();
      
      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }
      
      console.log("Using token for send:", token.substring(0, 20) + "...");
      
      const response = await fetch(
        API_ENDPOINTS.MATCHES.CHAT(matchId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ message: newMessage.trim() }),
        }
      );

      console.log("Send response status:", response.status);
      const data = await response.json();
      console.log("Send response data:", data);

      if (data.success) {
        setNewMessage("");
        fetchMessages();
      } else {
        console.error("Failed to send message:", data.message);
        setError(data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Error sending message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-lg p-6 max-w-xl w-full h-[600px] flex flex-col"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Facebook className="w-6 h-6 text-blue-500" />
            Match Chat
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-3 mb-4">
          <p className="text-blue-300 text-sm">
            💡 Та энд Facebook link-ээ солилцоод group chat үүсгээрэй
          </p>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm">
              ❌ {error}
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {fetching && messages.length === 0 ? (
            <p className="text-gray-400 text-center mt-8">
              Мессеж уншиж байна...
            </p>
          ) : messages.length === 0 ? (
            <p className="text-gray-400 text-center mt-8">
              Мессеж байхгүй байна
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.senderId._id === user?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.senderId._id === user?.id
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1">
                    {msg.senderId.name}
                  </p>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString("mn-MN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Facebook link-ээ бичнэ үү..."
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
