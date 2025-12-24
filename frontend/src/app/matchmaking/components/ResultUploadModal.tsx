"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";

interface ResultUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lobbyId: string;
  onSuccess: () => void;
}

const ResultUploadModal: React.FC<ResultUploadModalProps> = ({
  isOpen,
  onClose,
  lobbyId,
  onSuccess,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const MIN_FILES = 2;
  const MAX_FILES = 4;

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name} is not a valid image type. Only JPG, PNG, and WEBP are allowed.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} is too large. Maximum size is 5MB.`;
    }
    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const currentCount = selectedFiles.length;
    const newFilesCount = fileArray.length;

    if (currentCount + newFilesCount > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} images allowed`);
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setError(null);
  }, [selectedFiles.length]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleSubmit = async () => {
    if (selectedFiles.length < MIN_FILES) {
      setError(`Please select at least ${MIN_FILES} images`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("screenshots", file);
      });
      formData.append("lobbyId", lobbyId);

      const token = localStorage.getItem("token");
      const uploadResponse = await fetch(API_ENDPOINTS.MATCH_RESULTS.UPLOAD, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || "Failed to upload images");
      }

      const uploadData = await uploadResponse.json();
      const { imageUrls } = uploadData.data;

      const submitResponse = await fetch(
        API_ENDPOINTS.MATCH_RESULTS.SUBMIT(lobbyId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ imageUrls }),
        }
      );

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.message || "Failed to submit result");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit result");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFiles([]);
      setPreviews([]);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-gradient-to-r from-green-900/50 to-emerald-900/50 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Submit Match Result
            </h2>
            <button
              onClick={handleClose}
              disabled={uploading}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive
                  ? "border-green-500 bg-green-500/10"
                  : "border-gray-600 bg-gray-800/50"
              }`}
            >
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading || selectedFiles.length >= MAX_FILES}
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer ${uploading || selectedFiles.length >= MAX_FILES ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-white font-medium mb-2">
                  Drop images here or click to upload
                </p>
                <p className="text-sm text-gray-400">
                  {MIN_FILES}-{MAX_FILES} screenshots required • Max 5MB each • JPG, PNG, WEBP
                </p>
              </label>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            {previews.length > 0 && (
              <div>
                <p className="text-gray-300 font-medium mb-3">
                  Selected Images ({selectedFiles.length}/{MAX_FILES})
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {previews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg border border-gray-600"
                      />
                      {!uploading && (
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleClose}
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading || selectedFiles.length < MIN_FILES}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Submit Results"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ResultUploadModal;

