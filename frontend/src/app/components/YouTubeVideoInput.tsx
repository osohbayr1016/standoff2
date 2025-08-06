"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Youtube, Play, X, AlertCircle, CheckCircle } from "lucide-react";

interface YouTubeVideoInputProps {
  currentVideo?: string;
  onVideoChange: (url: string) => void;
  onVideoRemove: () => void;
  className?: string;
}

export default function YouTubeVideoInput({
  currentVideo,
  onVideoChange,
  onVideoRemove,
  className = "",
}: YouTubeVideoInputProps) {
  const [videoUrl, setVideoUrl] = useState(currentVideo || "");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);

  const getYouTubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const validateYouTubeUrl = (url: string) => {
    if (!url.trim()) {
      setIsValid(false);
      setError("");
      return false;
    }

    const videoId = getYouTubeVideoId(url);
    if (!videoId) {
      setIsValid(false);
      setError("Please enter a valid YouTube URL");
      return false;
    }

    setIsValid(true);
    setError("");
    return true;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);

    if (url.trim()) {
      const isValid = validateYouTubeUrl(url);
      if (isValid) {
        // Automatically save valid YouTube URLs
        onVideoChange(url);
      }
    } else {
      setIsValid(false);
      setError("");
    }
  };

  const handleSaveVideo = () => {
    if (validateYouTubeUrl(videoUrl)) {
      onVideoChange(videoUrl);
    }
  };

  const handleRemoveVideo = () => {
    setVideoUrl("");
    setIsValid(false);
    setError("");
    onVideoRemove();
  };

  const videoId = getYouTubeVideoId(videoUrl);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-300 text-sm">
            {error}
          </span>
        </motion.div>
      )}

      {/* Success Message */}
      {isValid && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700 dark:text-green-300 text-sm">
            ✅ YouTube URL saved! Click "Save Changes" to update your profile.
          </span>
        </motion.div>
      )}

      {/* Video Preview */}
      {videoId && isValid && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube Highlight Video"
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              YouTube Highlight Video
            </p>
            <button
              onClick={handleRemoveVideo}
              className="inline-flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
              <span>Remove</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* URL Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          YouTube Highlight Video URL (Optional)
        </label>
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              value={videoUrl}
              onChange={handleUrlChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent"
            />
          </div>
          {videoUrl.trim() && !isValid && (
            <button
              onClick={handleSaveVideo}
              className="px-4 py-3 bg-purple-600 dark:bg-green-600 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Preview</span>
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Paste a YouTube video URL to showcase your skills
        </p>
      </div>
    </div>
  );
}
