"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import {
  X,
  Upload,
  Save,
  Trash2,
  Users,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";

interface Team {
  id: string;
  name: string;
  tag: string;
  logo: string;
  game: string;
  gameIcon: string;
  createdBy: string;
  members: TeamMember[];
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  status: "pending" | "accepted" | "declined";
  invitedAt: string;
}

interface TeamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  onTeamUpdated: (updatedTeam: Team) => void;
  onTeamDeleted: () => void;
}

export default function TeamSettingsModal({
  isOpen,
  onClose,
  team,
  onTeamUpdated,
  onTeamDeleted,
}: TeamSettingsModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"general" | "danger">("general");
  const [teamName, setTeamName] = useState(team.name);
  const [teamTag, setTeamTag] = useState(team.tag);
  const [teamLogo, setTeamLogo] = useState(team.logo);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setActiveTab("general");
    setTeamName(team.name);
    setTeamTag(team.tag);
    setTeamLogo(team.logo);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTeamLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateTeamData = () => {
    return teamName.length >= 3 && teamTag.length >= 2 && teamTag.length <= 4;
  };

  const handleSaveChanges = async () => {
    if (!validateTeamData()) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedTeam: Team = {
      ...team,
      name: teamName,
      tag: teamTag,
      logo: teamLogo,
    };

    // Update localStorage
    localStorage.setItem("userTeam", JSON.stringify(updatedTeam));

    onTeamUpdated(updatedTeam);
    setIsLoading(false);
    onClose();
  };

  const handleDeleteTeam = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Remove from localStorage
    localStorage.removeItem("userTeam");

    onTeamDeleted();
    setIsLoading(false);
    handleClose();
  };

  const isOwner = user && team.createdBy === user.id;

  if (!isOwner) {
    return null; // Only team owner can access settings
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          style={{ minHeight: "100vh", minWidth: "100vw" }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative border border-gray-200 dark:border-gray-700 m-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Багийн тохиргоо
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("general")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === "general"
                    ? "text-purple-600 dark:text-green-400 border-b-2 border-purple-600 dark:border-green-400 bg-purple-50 dark:bg-gray-700"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Ерөнхий
              </button>
              <button
                onClick={() => setActiveTab("danger")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === "danger"
                    ? "text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400 bg-red-50 dark:bg-gray-700"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Аюултай
              </button>
            </div>

            {/* Content Container */}
            <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
              <div className="p-6">
                {/* General Tab */}
                {activeTab === "general" && (
                  <div className="space-y-6">
                    {/* Current Team Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                        Одоогийн багийн мэдээлэл
                      </h3>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 relative">
                          <Image
                            src={team.logo}
                            alt={team.name}
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            [{team.tag}] {team.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {team.game} • {team.members.length} гишүүн
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Team Logo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Багийн лого
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                          {teamLogo ? (
                            <Image
                              src={teamLogo}
                              alt="Team logo"
                              width={64}
                              height={64}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <motion.button
                          onClick={() => fileInputRef.current?.click()}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">Лого солих</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Team Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Багийн нэр
                      </label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Багийн нэрээ оруулна уу"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-400 focus:border-transparent"
                      />
                      {teamName.length > 0 && teamName.length < 3 && (
                        <p className="text-red-500 text-xs mt-1">
                          Багийн нэр дор хаяж 3 тэмдэгт байх ёстой
                        </p>
                      )}
                    </div>

                    {/* Team Tag */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Багийн TAG (2-4 үсэг)
                      </label>
                      <input
                        type="text"
                        value={teamTag}
                        onChange={(e) =>
                          setTeamTag(e.target.value.toUpperCase().slice(0, 4))
                        }
                        placeholder="TEAM"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-400 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        TAG нь тоглогчдын нэрний өмнө харагдана
                      </p>
                      {teamTag.length > 0 &&
                        (teamTag.length < 2 || teamTag.length > 4) && (
                          <p className="text-red-500 text-xs mt-1">
                            TAG нь 2-4 үсэг байх ёстой
                          </p>
                        )}
                    </div>

                    {/* Preview */}
                    {teamName && teamTag && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          Шинэ харагдах байдал:
                        </p>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 relative">
                            {teamLogo ? (
                              <Image
                                src={teamLogo}
                                alt="Team logo"
                                fill
                                className="rounded object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-purple-500 dark:bg-green-500 rounded flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            [{teamTag}] {teamName}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <motion.button
                        onClick={handleSaveChanges}
                        disabled={!validateTeamData() || isLoading}
                        whileHover={{
                          scale: validateTeamData() && !isLoading ? 1.05 : 1,
                        }}
                        whileTap={{
                          scale: validateTeamData() && !isLoading ? 0.95 : 1,
                        }}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
                          validateTeamData() && !isLoading
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 dark:from-green-500 dark:to-blue-500 text-white hover:from-purple-600 hover:to-pink-600 dark:hover:from-green-600 dark:hover:to-blue-600"
                            : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Хадгалж байна...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Өөрчлөлт хадгалах</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Danger Tab */}
                {activeTab === "danger" && (
                  <div className="space-y-6">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-red-800 dark:text-red-200">
                            Анхааруулга
                          </h3>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            Энэ хэсэгт багийн аюултай үйлдлүүд байрладаг.
                            Болгоомжтой хандана уу.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Delete Team */}
                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        Багийг устгах
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Багийг устгасны дараа бүх мэдээлэл алдагдах болно. Энэ
                        үйлдлийг буцаах боломжгүй.
                      </p>

                      {!showDeleteConfirm ? (
                        <motion.button
                          onClick={() => setShowDeleteConfirm(true)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Багийг устгах</span>
                        </motion.button>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            Та үнэхээр энэ багийг устгахыг хүсэж байна уу?
                          </p>
                          <div className="flex space-x-3">
                            <motion.button
                              onClick={handleDeleteTeam}
                              disabled={isLoading}
                              whileHover={{ scale: isLoading ? 1 : 1.05 }}
                              whileTap={{ scale: isLoading ? 1 : 0.95 }}
                              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                isLoading
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-red-600 text-white hover:bg-red-700"
                              }`}
                            >
                              {isLoading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                  <span>Устгаж байна...</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4" />
                                  <span>Тийм, устга</span>
                                </>
                              )}
                            </motion.button>
                            <motion.button
                              onClick={() => setShowDeleteConfirm(false)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              Цуцлах
                            </motion.button>
                          </div>
                        </div>
                      )}
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
