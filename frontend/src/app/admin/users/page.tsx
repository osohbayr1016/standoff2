"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../contexts/AuthContext";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "PLAYER" | "ORGANIZATION" | "COACH" | "ADMIN";
  isVerified: boolean;
  isOnline: boolean;
  createdAt: string;
  lastSeen: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Check admin access
  useEffect(() => {
    const isAdmin =
      user?.role === "ADMIN" || user?.email === "admin@esport-connection.com";
    if (!user || !isAdmin) {
      router.push("/");
      return;
    }
  }, [user, router]);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL ||
            (typeof window !== "undefined" &&
            window.location.hostname !== "localhost"
              ? "https://e-sport-connection-0596.onrender.com"
              : "http://localhost:8000")
          }/api/users`
        );
        const data = await response.json();

        if (data.success) {
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const isAdmin =
      user?.role === "ADMIN" || user?.email === "admin@esport-connection.com";
    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user]);

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          (typeof window !== "undefined" &&
          window.location.hostname !== "localhost"
            ? "https://e-sport-connection-0596.onrender.com"
            : "http://localhost:8000")
        }/api/users/update-role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            role: newRole,
          }),
        }
      );

      if (response.ok) {
        // Refresh users list
        window.location.reload();
      } else {
        alert("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Error updating user role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          (typeof window !== "undefined" &&
          window.location.hostname !== "localhost"
            ? "https://e-sport-connection-0596.onrender.com"
            : "http://localhost:8000")
        }/api/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setUsers(users.filter((user) => user._id !== userId));
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Online" && user.isOnline) ||
      (selectedStatus === "Offline" && !user.isOnline);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "ORGANIZATION":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "COACH":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "PLAYER":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading...</p>
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
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
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
              <p className="mt-4 text-gray-300">Loading users...</p>
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  User Management
                </h1>
                <p className="text-gray-300">
                  Manage user accounts, roles, and permissions
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Refresh</span>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="All">All Roles</option>
                <option value="PLAYER">Player</option>
                <option value="ORGANIZATION">Organization</option>
                <option value="COACH">Coach</option>
                <option value="ADMIN">Admin</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="All">All Status</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>

              <div className="text-right">
                <span className="text-gray-400 text-sm">
                  {filteredUsers.length} users
                </span>
              </div>
            </div>
          </motion.div>

          {/* Users List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {filteredUsers.map((userItem) => (
              <motion.div
                key={userItem._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {userItem.name}
                      </h3>
                      <p className="text-gray-400 text-sm">{userItem.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                            userItem.role
                          )}`}
                        >
                          {userItem.role}
                        </span>
                        {userItem.isVerified && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-medium">
                            Verified
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            userItem.isOnline
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }`}
                        >
                          {userItem.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={userItem.role}
                      onChange={(e) =>
                        handleUpdateUserRole(userItem._id, e.target.value)
                      }
                      className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="PLAYER">Player</option>
                      <option value="ORGANIZATION">Organization</option>
                      <option value="COACH">Coach</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button
                      onClick={() => handleDeleteUser(userItem._id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Users className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No users found
                </h3>
                <p className="text-gray-400">
                  {searchTerm ||
                  selectedRole !== "All" ||
                  selectedStatus !== "All"
                    ? "Try adjusting your search terms or filters"
                    : "No users registered yet"}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
