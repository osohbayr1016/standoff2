"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Youtube, Twitch, Globe, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { API_ENDPOINTS } from "@/config/api";

interface StreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStreamStarted: () => void;
}

interface StreamPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  placeholder: string;
}

const platforms: StreamPlatform[] = [
  {
    id: "youtube",
    name: "YouTube",
    icon: <Youtube className="w-5 h-5 text-red-600" />,
    placeholder: "https://www.youtube.com/watch?v=...",
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: <Twitch className="w-5 h-5 text-purple-600" />,
    placeholder: "https://www.twitch.tv/your_channel",
  },
  {
    id: "kick",
    name: "Kick",
    icon: <Globe className="w-5 h-5 text-green-500" />,
    placeholder: "https://kick.com/your_channel",
  },
  {
    id: "facebook",
    name: "Facebook Gaming",
    icon: <Globe className="w-5 h-5 text-blue-600" />,
    placeholder: "https://www.facebook.com/gaming/your_page",
  },
];

export default function StreamModal({ isOpen, onClose, onStreamStarted }: StreamModalProps) {
  const { getToken } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("youtube");
  const [streamUrl, setStreamUrl] = useState("");
  const [streamTitle, setStreamTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartStream = async () => {
    if (!streamUrl.trim()) {
      setError("Stream URL is required");
      return;
    }

    if (!streamTitle.trim()) {
      setError("Stream title is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = getToken();
      
      // First, check if stream is valid
      const checkResponse = await fetch(API_ENDPOINTS.STREAMS.CHECK_EXTERNAL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streamUrl,
          platform: selectedPlatform,
        }),
      });

      if (!checkResponse.ok) {
        if (checkResponse.status === 404) {
          setError("Stream validation endpoint not found. Please restart backend server.");
        } else if (checkResponse.status === 401) {
          setError("Authentication required. Please log in again.");
        } else {
          setError(`Failed to validate stream URL (${checkResponse.status})`);
        }
        return;
      }

      const checkData = await checkResponse.json();

      if (!checkData.success) {
        setError(checkData.message || "Failed to validate stream URL");
        return;
      }

      // Create stream in database
      const createResponse = await fetch(API_ENDPOINTS.STREAMS.CREATE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: streamTitle,
          description: description || "Live streaming now!",
          externalStreamUrl: streamUrl,
          externalPlatform: selectedPlatform,
          externalThumbnail: checkData.data.thumbnail,
          isLiveStatus: checkData.data.isLive ? "live" : "offline",
          status: "live",
          isPublic: true,
          tags: ["MLBB", "Gaming"],
        }),
      });

      if (createResponse.ok) {
        onStreamStarted();
        handleClose();
      } else {
        const data = await createResponse.json();
        setError(data.message || "Failed to create stream");
      }
    } catch (err) {
      console.error("Error starting stream:", err);
      setError("Failed to start stream. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStreamUrl("");
    setStreamTitle("");
    setDescription("");
    setError("");
    setSelectedPlatform("youtube");
    onClose();
  };

  const selectedPlatformData = platforms.find((p) => p.id === selectedPlatform);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <span>📺</span>
                <span>Start Streaming</span>
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-600/20 border border-red-500/50 text-white p-4 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Stream Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stream Title *
                </label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="e.g., Playing MLBB Ranked - Mythic Glory"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you streaming about?"
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Streaming Platform *
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedPlatform === platform.id
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-gray-600 bg-gray-700 hover:border-gray-500"
                      }`}
                    >
                      {platform.icon}
                      <p className="text-xs mt-2 text-gray-300">{platform.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stream URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stream URL *
                </label>
                <div className="flex items-center space-x-2 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2">
                  {selectedPlatformData?.icon}
                  <input
                    type="url"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder={selectedPlatformData?.placeholder}
                    className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Enter the full URL to your live stream
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-600/20 border border-blue-500/50 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  💡 <strong>Tip:</strong> Make sure your stream is already live on{" "}
                  {selectedPlatformData?.name} before starting.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-700">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartStream}
                disabled={loading || !streamUrl || !streamTitle}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Go Live!</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
