"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, Camera, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { API_ENDPOINTS } from "../../config/api";
import { safeFetch, parseJsonSafe } from "../../lib/safeFetch";

interface ImageUploaderProps {
  currentImage?: string;
  onImageUpload: (url: string, publicId: string) => void;
  onImageRemove: () => void;
  className?: string;
}

export default function ImageUploader({
  currentImage,
  onImageUpload,
  onImageRemove,
  className = "",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    try {
      setIsUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to upload images");
        return;
      }

      const response = await safeFetch(API_ENDPOINTS.UPLOAD.IMAGE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        retries: 1,
        timeoutMs: 12000,
      } as any);

      const data = (await parseJsonSafe(response)) || {};
      if (response.ok && data.success) {
        setUploadedImage(data.url);
        setUploadedPublicId(data.publicId);
        onImageUpload(data.url, data.publicId);
      } else {
        let errorMessage = "Failed to upload image";

        if (response.status === 503) {
          errorMessage =
            "Image upload service is not configured. Please contact administrator.";
        } else if (response.status === 413) {
          errorMessage = "Image too large. Please upload under 5MB.";
        } else if (response.status === 401) {
          errorMessage = "Please log in to upload images";
        } else if (data && data.message) {
          errorMessage = data.message;
        }

        setError(errorMessage);
      }
    } catch (error) {
      console.error("Upload error:", error);
      if (error instanceof Error && error.name === "AbortError") {
        setError("Upload timed out. Please try again.");
      } else {
        setError(
          "Failed to upload image. Please check your connection and try again."
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      if (uploadedPublicId) {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token available for image deletion");
          // Still remove from UI
        } else {
          const response = await fetch(
            API_ENDPOINTS.UPLOAD.DELETE_IMAGE(uploadedPublicId),
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            console.warn(
              "Failed to delete image from server, but removing from UI"
            );
          }
        }
      }

      setUploadedImage(null);
      setUploadedPublicId(null);
      onImageRemove();
    } catch (error) {
      console.error("Remove image error:", error);
      // Still remove from UI even if deletion fails
      setUploadedImage(null);
      setUploadedPublicId(null);
      onImageRemove();
    }
  };

  const displayImage = uploadedImage || currentImage;

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

      {/* Image Display */}
      {displayImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className="relative w-32 h-32 mx-auto">
            <Image
              src={displayImage}
              alt="Profile"
              fill
              className="rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Upload Area */}
      {!displayImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 dark:hover:border-green-500 transition-colors duration-200 group"
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="w-8 h-8 text-purple-500 dark:text-green-500 animate-spin" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Uploading...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Camera className="w-8 h-8 text-gray-400 group-hover:text-purple-500 dark:group-hover:text-green-500 transition-colors duration-200" />
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Upload Photo
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Upload Button */}
      {displayImage && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full py-2 px-4 bg-purple-600 dark:bg-green-600 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Change Photo</span>
            </>
          )}
        </motion.button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          JPG, PNG, GIF up to 5MB
        </p>
      </div>
    </div>
  );
}
