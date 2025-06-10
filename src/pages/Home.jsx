import { useState } from "react";
import { useUser } from "../lib/context/user";
import { useIdeas } from "../lib/context/ideas";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Tag,
  Calendar,
  User as UserIcon,
  X,
  PieChart,
} from "lucide-react";
import moment from "moment";

const CATEGORIES = [
  "Web App",
  "Mobile App",
  "AI/ML",
  "API",
  "Tool",
  "Game",
  "Other",
];
const PRIORITIES = ["Low", "Medium", "High"];

export function Home({ navigate }) {
  const user = useUser();
  const ideas = useIdeas();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web App");
  const [priority, setPriority] = useState("Medium");
  const [tags, setTags] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await ideas.add({
        userId: user.current.$id,
        title,
        description,
        category,
        priority,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .join(","),
      });
      setTitle("");
      setDescription("");
      setTags("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredIdeas = ideas.current.filter((idea) => {
    if (!user.current || idea.userId !== user.current.$id) {
      return false;
    }
    
    const matchesSearch =
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || idea.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-green-500/10 text-green-400 border-green-500/30";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-bold text-white mb-3 tracking-wide">
          Your Creative <span className="text-[#FD366E]">Ideas Hub</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed sm:leading-loose">
          Capture, organize, and bring your brilliant ideas to life
        </p>
      </motion.div>

      {/* Add Idea */}
      {user.current ? (
        <motion.section
          className="bg-[#1D1D1D] rounded-2xl p-4 border border-gray-800"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {!showForm ? (
              <motion.button
                key="add-button"
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center space-x-3 p-2 bg-[#FD366E]/10 hover:bg-[#FD366E]/20 border border-[#FD366E]/30 hover:border-[#FD366E]/50 rounded-xl transition-all duration-300 text-[#FD366E]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-6 h-6" />
                <span className="text-md font-medium">Add New Idea</span>
              </motion.button>
            ) : (
              <motion.form
                key="add-form"
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">New Idea</h2>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Idea title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E]"
                    required
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FD366E]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#1D1D1D]">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  placeholder="Describe your idea..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E] resize-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FD366E]"
                  >
                    {PRIORITIES.map((pri) => (
                      <option key={pri} value={pri} className="bg-[#1D1D1D]">
                        {pri}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E]"
                  />
                </div>

                <motion.button
                  type="submit"
                  className="w-full bg-[#FD366E] hover:bg-[#FD366E]/90 text-white font-medium py-2 rounded-xl transition-all duration-300 shadow-lg shadow-[#FD366E]/20"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Idea
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.section>
      ) : (
        <motion.section
          className="bg-[#1D1D1D] rounded-2xl p-4 border border-gray-800 text-white"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* First Row: Icon + Title + Button */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-7 h-7 text-[#FD366E]" />
              <h2 className="sm:hidden text-lg font-medium">Join now</h2>

              <h2 className="hidden sm:flex text-lg font-medium">
                Join Idea Tracker
              </h2>
            </div>

            <motion.button
              onClick={() => navigate("login")}
              className="bg-[#FD366E] hover:bg-[#FD366E]/90 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 shadow-lg shadow-[#FD366E]/20 text-sm"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>

          {/* Second Row: Description */}
          <p className="text-gray-400 text-start">
            Login to start tracking your amazing ideas
          </p>
        </motion.section>
      )}

      {/* Search & Filter */}
      <motion.section
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1D1D1D] border border-gray-800 rounded-xl pl-12 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#1D1D1D] border border-gray-800 rounded-xl pl-12 pr-8 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FD366E] appearance-none min-w-[180px]"
          >
            <option value="All" className="bg-[#1D1D1D]">
              All Categories
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#1D1D1D]">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </motion.section>

      {/* Ideas List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Ideas ({filteredIdeas.length})
          </h2>
        </div>

        <AnimatePresence>
          {filteredIdeas.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PieChart className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-lg">
                {searchTerm || filterCategory !== "All"
                  ? "No ideas match your filters"
                  : "No ideas yet. Create your first one!"}
              </p>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 gap-6" layout>
              <AnimatePresence>
                {filteredIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.$id}
                    className="bg-[#1D1D1D] rounded-2xl p-5 border border-gray-800 hover:border-[#FD366E]/40 transition-all duration-300 group w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    layout
                  >
                    {/* Title and Delete */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-[#FD366E] transition-colors line-clamp-2">
                        {idea.title}
                      </h3>
                      {user.current?.$id === idea.userId && (
                        <motion.button
                          onClick={() => ideas.remove(idea.$id)}
                          className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 mb-3 text-sm leading-relaxed line-clamp-4">
                      {idea.description}
                    </p>

                    {/* Category + Priority */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-[#FD366E]/10 text-white px-3 py-1 rounded-full text-xs border border-[#FD366E]/30">
                        {idea.category}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${getPriorityColor(
                          idea.priority
                        )}`}
                      >
                        {idea.priority}
                      </span>
                    </div>

                    {/* Tags */}
                    {idea.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {idea.tags.split(",").map((tag, i) => (
                          <span
                            key={i}
                            className="bg-gray-800/50 text-gray-300 px-2 py-1 rounded-md text-xs flex items-center"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Meta Info */}
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {moment(idea.$createdAt).format("MMM D, YYYY")}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
