"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Trash2,
  MessageCircle,
  Crown,
  Check,
  Ban,
} from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { API_ENDPOINTS } from "../../config/api";

const NotificationCenter: React.FC = () => {
  const { getToken } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsSeen,
    markAllAsSeen,
    deleteNotification,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [processingNotification, setProcessingNotification] = useState<
    string | null
  >(null);

  // Fetch notifications when component mounts
  useEffect(() => {
    const token = getToken();
    if (isOpen && token) {
      fetchNotifications();
    }
  }, [isOpen, getToken, fetchNotifications]);

  const handleNotificationClick = async (notification: {
    _id: string;
    status: string;
  }) => {
    if (notification.status === "PENDING") {
      await markAsSeen(notification._id);
    }
    // You can add navigation logic here if needed
  };

  const handleClanInvitation = async (
    notificationId: string,
    clanId: string,
    action: "accept" | "decline"
  ) => {
    const token = getToken();
    if (!token) {
      alert("Та нэвтэрч орох хэрэгтэй");
      return;
    }

    try {
      setProcessingNotification(notificationId);

      const endpoint =
        action === "accept"
          ? API_ENDPOINTS.CLANS.ACCEPT(clanId)
          : API_ENDPOINTS.CLANS.DECLINE(clanId);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Mark notification as seen and refresh notifications
        await markAsSeen(notificationId);
        await fetchNotifications();

        const actionText = action === "accept" ? "хүлээн авлаа" : "татгалзлаа";
        alert(`Кланы урилгыг амжилттай ${actionText}`);
      } else {
        const error = await response.json();
        alert(
          error.message ||
            `Урилгыг ${
              action === "accept" ? "хүлээн авахад" : "татгалзахад"
            } алдаа гарлаа`
        );
      }
    } catch (error) {
      console.error(`Error ${action}ing clan invitation:`, error);
      alert(
        `Урилгыг ${
          action === "accept" ? "хүлээн авахад" : "татгалзахад"
        } алдаа гарлаа`
      );
    } finally {
      setProcessingNotification(null);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Саяхан";
    } else if (diffInHours < 24) {
      return `${diffInHours} цагийн өмнө`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} өдрийн өмнө`;
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-green-400 transition-colors duration-200 relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Мэдэгдэл
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsSeen}
                    className="text-xs text-purple-600 dark:text-green-400 hover:underline"
                  >
                    Бүгдийг уншсан гэж тэмдэглэх
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Уншиж байна...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Мэдэгдэл байхгүй байна
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        notification.status === "PENDING"
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {notification.senderId?.avatar ? (
                            <Image
                              src={notification.senderId.avatar}
                              alt={notification.senderId.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <MessageCircle
                                size={16}
                                className="text-gray-600 dark:text-gray-300"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1">
                              {notification.status === "PENDING" && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification._id);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                              >
                                <Trash2 size={12} className="text-gray-400" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.content}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {formatTime(notification.createdAt)}
                          </p>

                          {/* Clan Invitation Actions */}
                          {notification.type === "CLAN_INVITATION" &&
                            notification.status === "PENDING" &&
                            notification.relatedClanId && (
                              <div className="flex items-center space-x-2 mt-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (notification.relatedClanId) {
                                      handleClanInvitation(
                                        notification._id,
                                        notification.relatedClanId,
                                        "accept"
                                      );
                                    }
                                  }}
                                  disabled={
                                    processingNotification === notification._id
                                  }
                                  className="flex items-center space-x-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {processingNotification ===
                                  notification._id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                                  ) : (
                                    <Check size={12} />
                                  )}
                                  <span>Хүлээн авах</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (notification.relatedClanId) {
                                      handleClanInvitation(
                                        notification._id,
                                        notification.relatedClanId,
                                        "decline"
                                      );
                                    }
                                  }}
                                  disabled={
                                    processingNotification === notification._id
                                  }
                                  className="flex items-center space-x-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {processingNotification ===
                                  notification._id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                                  ) : (
                                    <Ban size={12} />
                                  )}
                                  <span>Татгалзах</span>
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {unreadCount} уншаагүй / {notifications.length} нийт
                  </span>
                  <span>7 хоногийн дараа устана</span>
                </div>
              </div>
            )}

            {/* Clan Invitations Link */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/clan-invitations"
                className="flex items-center space-x-2 text-sm text-purple-600 dark:text-green-400 hover:text-purple-700 dark:hover:text-green-300 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Crown className="w-4 h-4" />
                <span>Кланын урилгуудыг харах</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationCenter;
