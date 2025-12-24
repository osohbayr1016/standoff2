"use client";

import { Search, Filter, FileText, AlertTriangle } from "lucide-react";

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: "all" | "pending" | "reviewed" | "disputed";
  setFilter: (filter: "all" | "pending" | "reviewed" | "disputed") => void;
}

export default function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
}: SearchAndFiltersProps) {
  return (
    <div className="w-full mb-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by Match ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
            filter === "pending"
              ? "bg-orange-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Pending
        </button>
        <button
          onClick={() => setFilter("reviewed")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
            filter === "reviewed"
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <FileText className="w-4 h-4" />
          Reviewed
        </button>
        <button
          onClick={() => setFilter("disputed")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
            filter === "disputed"
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Disputed
        </button>
      </div>
    </div>
  );
}

