"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Crown, Users, Tag, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import { Clan } from "../../types/clan";

interface ClanMember {
  id: string;
  name: string;
  avatar: string;
  status: "pending" | "accepted" | "declined";
  invitedAt: string;
  joinedAt?: string;
}

interface ClanSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clan: Clan;
  onClanUpdated?: (clan: Clan) => void;
  onClanDeleted?: () => void;
}

export default function ClanSettingsModal({
  isOpen,
  onClose,
  clan,
  onClanUpdated,
  onClanDeleted,
}: ClanSettingsModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: clan.name,
    description: clan.description || "",
    logo: clan.logo || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.CLANS.UPDATE(clan._id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update clan");
      }

      const data = await response.json();

      if (onClanUpdated) {
        onClanUpdated(data.clan);
      }

      onClose();
    } catch (error) {
      console.error("Error updating clan:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update clan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClan = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.CLANS.GET(clan._id), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete clan");
      }

      if (onClanDeleted) {
        onClanDeleted();
      }

      onClose();
    } catch (error) {
      console.error("Error deleting clan:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete clan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const acceptedMembers =
    clan.members?.filter((m) => m.status === "accepted") || [];

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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Кланын тохиргоо
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Clan Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Кланын мэдээлэл
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Нэр:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {clan.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Тэг:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      [{clan.tag}]
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Гишүүд:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {acceptedMembers.length}/{clan.maxMembers}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Төрөл:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {clan.isPremium ? "Premium" : "Free"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Update Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Кланын нэр
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Кланын нэр"
                    required
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Тайлбар
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Лого (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) => handleInputChange("logo", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Хадгалж байна..." : "Хадгалах"}
                  </button>
                </div>
              </form>

              {/* Danger Zone */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                  Аюултай бүс
                </h3>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Кланыг устгах</span>
                  </button>
                ) : (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                      Та үнэхээр энэ кланыг устгахдаа итгэлтэй байна уу? Энэ
                      үйлдлийг буцаах боломжгүй.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleDeleteClan}
                        disabled={loading}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? "Устгаж байна..." : "Тийм, устгах"}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Цуцлах
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
