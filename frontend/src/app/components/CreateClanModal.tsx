"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Tag, Crown, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import { Clan } from "../../types/clan";

interface CreateClanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClanCreated?: (clan: Clan) => void;
}

export default function CreateClanModal({
  isOpen,
  onClose,
  onClanCreated,
}: CreateClanModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    tag: "",
    description: "",
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let logoUrl = "";
      
      // Upload logo if selected
      if (logo) {
        const formData = new FormData();
        formData.append("image", logo);
        
        const uploadResponse = await fetch(API_ENDPOINTS.UPLOAD.IMAGE, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload logo");
        }

        const uploadData = await uploadResponse.json();
        logoUrl = uploadData.url;
      }

      const response = await fetch(API_ENDPOINTS.CLANS.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          logo: logoUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create clan");
      }

      const data = await response.json();

      // Call callback if provided
      if (onClanCreated) {
        onClanCreated(data.clan);
      }

      // Reset form
      setFormData({ name: "", tag: "", description: "" });
      setLogo(null);
      setLogoPreview("");
      onClose();
    } catch (error) {
      console.error("Error creating clan:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create clan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setLogo(file);
      setError("");
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Клан үүсгэх
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Clan Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Кланын нэр
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Кланын нэрээ оруулна уу"
                  required
                  maxLength={50}
                />
              </div>

              {/* Clan Tag */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Кланын тэг
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) =>
                      handleInputChange("tag", e.target.value.toUpperCase())
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="TAG"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Хамгийн ихдээ 6 тэмдэгт
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Тайлбар (сонгох боломжтой)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Кланын тайлбар..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.description.length}/500 тэмдэгт
                </p>
              </div>

              {/* Clan Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Кланын лого (сонгох боломжтой)
                </label>
                
                {logoPreview ? (
                  <div className="relative">
                    <Image
                      src={logoPreview}
                      alt="Clan logo preview"
                      width={100}
                      height={100}
                      className="rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 dark:hover:border-green-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Лого оруулах
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG эсвэл GIF (5MB хүртэл)
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Plan Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">
                    Free Plan
                  </h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  • Хамгийн ихдээ 10 гишүүн
                  <br />
                  • Үндсэн функцууд
                  <br />• Premium-д шилжих боломжтой
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.tag}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Үүсгэж байна..." : "Клан үүсгэх"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
