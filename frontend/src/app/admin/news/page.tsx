"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Calendar,
  User,
  Trophy,
  Gamepad2,
  Star,
  TrendingUp,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";

interface NewsItem {
  _id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  type: "update" | "player" | "tournament" | "winner" | "feature";
  category: string;
  author: string;
  featured: boolean;
  readTime: string;
  tags: string[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface NewsFormData {
  title: string;
  description: string;
  content: string;
  image: string;
  type: "update" | "player" | "tournament" | "winner" | "feature";
  category: string;
  author: string;
  featured: boolean;
  readTime: string;
  tags: string[];
}

export default function AdminNewsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Add error boundary
  const [error, setError] = useState<string | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories] = useState(["Game Updates", "E-Sport", "Other"]);
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    description: "",
    content: "",
    image: "",
    type: "update",
    category: "Game Updates",
    author: "",
    featured: false,
    readTime: "3 min read",
    tags: [],
  });

  // Check admin access
  useEffect(() => {
    console.log("User:", user);
    const isAdmin =
      user?.role === "ADMIN" || user?.email === "admin@esport-connection.com";
    console.log("Is admin:", isAdmin);
    if (!user || !isAdmin) {
      console.log("Redirecting to home - not admin");
      router.push("/");
      return;
    }
  }, [user, router]);

  // Fetch news data
  useEffect(() => {
    const isAdmin =
      user?.role === "ADMIN" || user?.email === "admin@esport-connection.com";
    console.log("Fetch news effect - user:", user, "isAdmin:", isAdmin);
    if (user && isAdmin) {
      fetchNews();
    }
  }, [user]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-white mb-4">
                Error Occurred
              </h1>
              <p className="text-gray-400 mb-6">
                Sorry, an error occurred. Please try again.
              </p>
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const fetchNews = async () => {
    try {
      setLoading(true);
      console.log("Fetching news from:", API_ENDPOINTS.NEWS.ALL);
      const response = await fetch(API_ENDPOINTS.NEWS.ALL);
      console.log("News response status:", response.status);
      const data = await response.json();
      console.log("News data:", data);

      if (data.success) {
        setNews(data.news);
      } else {
        console.error("News fetch failed:", data.message);
        setError(`Failed to fetch news: ${data.message}`);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setError(
        `Error fetching news: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      image: "",
      type: "update",
      category: "Game Updates",
      author: "",
      featured: false,
      readTime: "3 min read",
      tags: [],
    });
    setEditingNews(null);
  };

  const handleCreateNews = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditNews = (newsItem: NewsItem) => {
    setFormData({
      title: newsItem.title,
      description: newsItem.description,
      content: newsItem.content,
      image: newsItem.image,
      type: newsItem.type,
      category: newsItem.category,
      author: newsItem.author,
      featured: newsItem.featured,
      readTime: newsItem.readTime,
      tags: newsItem.tags,
    });
    setEditingNews(newsItem);
    setShowForm(true);
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news article?")) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.NEWS.GET(id), {
        method: "DELETE",
      });

      if (response.ok) {
        setNews(news.filter((item) => item._id !== id));
      } else {
        alert("Failed to delete news article");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      alert("Error deleting news article");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingNews
        ? API_ENDPOINTS.NEWS.GET(editingNews._id)
        : API_ENDPOINTS.NEWS.ALL;

      const method = editingNews ? "PUT" : "POST";

      console.log("Submitting news:", { url, method, formData });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Submit response status:", response.status);
      const data = await response.json();
      console.log("Submit response data:", data);

      if (data.success) {
        if (editingNews) {
          setNews(
            news.map((item) =>
              item._id === editingNews._id ? data.news : item
            )
          );
        } else {
          setNews([data.news, ...news]);
        }

        setShowForm(false);
        resetForm();
      } else {
        alert(data.message || "Failed to save news article");
      }
    } catch (error) {
      console.error("Error saving news:", error);
      alert("Error saving news article");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof NewsFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagChange = (tags: string) => {
    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    setFormData((prev) => ({
      ...prev,
      tags: tagArray,
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "update":
        return <Gamepad2 className="w-4 h-4" />;
      case "tournament":
        return <Trophy className="w-4 h-4" />;
      case "player":
        return <User className="w-4 h-4" />;
      case "winner":
        return <Star className="w-4 h-4" />;
      case "feature":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Gamepad2 className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "update":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "tournament":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "player":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "winner":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "feature":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Show loading or redirect if not admin
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading user data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isAdmin =
    user?.role === "ADMIN" || user?.email === "admin@esport-connection.com";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-white mb-4">
                Access Denied
              </h1>
              <p className="text-gray-400 mb-6">
                You don&apos;t have permission to access the admin panel.
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Current user: {user.email} (Role: {user.role})
              </p>
              <Link
                href="/admin-setup"
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-4"
              >
                <span>Make Yourself Admin</span>
              </Link>
              <br />
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading news management...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  News Management
                </h1>
                <p className="text-gray-300">
                  Manage news articles, updates, and announcements
                </p>
              </div>
              <button
                onClick={handleCreateNews}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add News</span>
              </button>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <div className="text-right">
                <span className="text-gray-400 text-sm">
                  {filteredNews.length} articles
                </span>
              </div>
            </div>
          </motion.div>

          {/* News List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {filteredNews.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={120}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(
                              item.type
                            )}`}
                          >
                            {getTypeIcon(item.type)}
                            <span className="ml-1">{item.category}</span>
                          </span>
                          {item.featured && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                              Featured
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                          {item.title}
                        </h3>

                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{item.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(item.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span>{item.readTime}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditNews(item)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors duration-200"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(item._id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredNews.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No news found
                </h3>
                <p className="text-gray-400">
                  {searchTerm || selectedCategory !== "All"
                    ? "Try adjusting your search terms or category filter"
                    : "Create your first news article by clicking &apos;Add News&apos;"}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* News Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {editingNews ? "Edit News Article" : "Create News Article"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={3}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Image URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image URL *
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) =>
                        handleInputChange("image", e.target.value)
                      }
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        handleInputChange("type", e.target.value)
                      }
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="update">Game Update</option>
                      <option value="tournament">Tournament</option>
                      <option value="player">Player News</option>
                      <option value="winner">Winner</option>
                      <option value="feature">Feature</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Author */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) =>
                        handleInputChange("author", e.target.value)
                      }
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Read Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Read Time *
                    </label>
                    <input
                      type="text"
                      value={formData.readTime}
                      onChange={(e) =>
                        handleInputChange("readTime", e.target.value)
                      }
                      placeholder="e.g., 3 min read"
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Tags */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags.join(", ")}
                      onChange={(e) => handleTagChange(e.target.value)}
                      placeholder="e.g., mobile legends, tournament, esports"
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Featured */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) =>
                          handleInputChange("featured", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-300">
                        Mark as featured article
                      </span>
                    </label>
                  </div>

                  {/* Content */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        handleInputChange("content", e.target.value)
                      }
                      rows={8}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write the full article content here..."
                      required
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingNews ? "Update" : "Create"} News</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
