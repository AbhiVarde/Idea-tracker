import { useState } from "react";
import { useUser } from "../lib/context/user";
import { useIdeas } from "../lib/context/ideas";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { toast } from "sonner";

import FlipWords from "../components/FlipWords";
import { AIExpansion } from "../components/dialogs/AIExpansion";

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
  Edit3,
  ChevronDown,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

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
const WORDS = [
  "Ideas Hub",
  "Vision Board",
  "Dream Factory",
  "Project Vault",
  "Idea Bank",
  "Next Big Thing",
];

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
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterTags, setFilterTags] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editTags, setEditTags] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);

  const handleAIExpansion = (idea) => {
    setSelectedIdea(idea);
    setAiModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      toast.error("Please enter a title for your idea");
      return;
    }

    if (trimmedTitle.length < 3) {
      toast.error("Title must be at least 3 characters long");
      return;
    }

    if (trimmedTitle.length > 100) {
      toast.error("Title must be less than 100 characters");
      return;
    }

    if (trimmedDescription.length > 500) {
      toast.error("Description must be less than 500 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const processedTags = tags
        ?.split(",")
        ?.map((tag) => tag.trim())
        ?.filter(Boolean)
        ?.filter((tag) => tag.length <= 20)
        ?.slice(0, 10)
        ?.join(",");

      await ideas.add({
        userId: user.current.$id,
        title: trimmedTitle,
        description: trimmedDescription,
        category,
        priority,
        tags: processedTags,
      });

      setTitle("");
      setDescription("");
      setTags("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add idea. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (idea) => {
    setEditingId(idea.$id);
    setEditTitle(idea.title);
    setEditDescription(idea.description);
    setEditCategory(idea.category);
    setEditPriority(idea.priority);
    setEditTags(idea.tags || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditCategory("");
    setEditPriority("");
    setEditTags("");
  };

  const saveEdit = async (ideaId) => {
    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();

    if (!trimmedTitle) {
      toast.error("Please enter a title for your idea");
      return;
    }

    if (trimmedTitle.length < 3) {
      toast.error("Title must be at least 3 characters long");
      return;
    }

    if (trimmedTitle.length > 100) {
      toast.error("Title must be less than 100 characters");
      return;
    }

    if (trimmedDescription.length > 500) {
      toast.error("Description must be less than 500 characters");
      return;
    }

    setIsUpdating(true);

    try {
      const processedTags = editTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .filter((tag) => tag.length <= 20)
        .slice(0, 10)
        .join(",");

      await ideas.update(ideaId, {
        title: trimmedTitle,
        description: trimmedDescription,
        category: editCategory,
        priority: editPriority,
        tags: processedTags,
      });

      cancelEdit();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update idea. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (ideaId) => {
    try {
      await ideas.remove(ideaId);
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete idea. Please try again.");
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

    const matchesPriority =
      filterPriority === "All" || idea.priority === filterPriority;

    const matchesTags =
      !filterTags ||
      (idea.tags && idea.tags.toLowerCase().includes(filterTags.toLowerCase()));

    return matchesSearch && matchesCategory && matchesPriority && matchesTags;
  });

  const clearFilters = () => {
    setFilterCategory("All");
    setFilterPriority("All");
    setFilterTags("");
    setSearchTerm("");
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500/10 dark:text-red-400 text-red-600 border-red-500/30";
      case "Medium":
        return "bg-yellow-500/10 dark:text-yellow-400 text-yellow-600 border-yellow-500/30";
      default:
        return "bg-green-500/10 dark:text-green-400 text-green-600 border-green-500/30";
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-1 sm:p-4 space-y-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold dark:text-white text-gray-900 mb-3 tracking-wide">
            Your Creative{" "}
            <FlipWords
              words={WORDS}
              duration={3000}
              className="text-[#FD366E]"
            />
          </h1>
          <p className="dark:text-gray-400 text-gray-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed sm:leading-loose">
            Track ideas with clarity and bring them to life naturally.
          </p>
        </motion.div>
        {user.current ? (
          <motion.section
            className="dark:bg-[#000000] bg-white rounded-2xl p-4 dark:border-gray-800 border-gray-200 border"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {!showForm ? (
                <motion.button
                  key="add-button"
                  onClick={() => setShowForm(true)}
                  className="w-full flex items-center justify-center space-x-3 p-2 bg-[#FD366E]/10 hover:bg-[#FD366E]/20 dark:border-[#FD366E]/30 border-[#FD366E]/20 hover:border-[#FD366E]/50 rounded-xl transition-all duration-300 text-[#FD366E]"
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
                <motion.div
                  key="add-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold dark:text-white text-gray-900">
                        New Idea
                      </h2>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="dark:text-gray-400 text-gray-600 hover:dark:text-white hover:text-gray-900 p-2 dark:hover:bg-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
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
                        maxLength={100}
                        className="dark:bg-gray-800/50 bg-gray-100 dark:border-gray-700 border-gray-300 rounded-xl px-4 py-2 dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E]"
                        required
                      />
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="dark:bg-gray-800/50 bg-gray-100 dark:border-gray-700 border-gray-300 rounded-xl px-4 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E]"
                      >
                        {CATEGORIES.map((cat) => (
                          <option
                            key={cat}
                            value={cat}
                            className="dark:bg-[#000000] bg-white"
                          >
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
                      maxLength={500}
                      className="w-full dark:bg-gray-800/50 bg-gray-100 dark:border-gray-700 border-gray-300 rounded-xl px-4 py-2 dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E] resize-none"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="dark:bg-gray-800/50 bg-gray-100 dark:border-gray-700 border-gray-300 rounded-xl px-4 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E]"
                      >
                        {PRIORITIES.map((pri) => (
                          <option
                            key={pri}
                            value={pri}
                            className="dark:bg-[#000000] bg-white"
                          >
                            {pri}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Tags (comma separated, max 10)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        maxLength={200}
                        className="dark:bg-gray-800/50 bg-gray-100 dark:border-gray-700 border-gray-300 rounded-xl px-4 py-2 dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E]"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#FD366E] hover:bg-[#FD366E]/90 disabled:bg-[#FD366E]/50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-xl transition-all duration-300 shadow-lg shadow-[#FD366E]/20 flex items-center justify-center space-x-2"
                      whileHover={!isSubmitting ? { scale: 1.02, y: -1 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Idea</span>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        ) : (
          <motion.section
            className="dark:bg-[#000000] bg-white rounded-2xl p-4 dark:border-gray-800 border-gray-200 border dark:text-white text-gray-900"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
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

            <p className="dark:text-gray-400 text-gray-600 text-start">
              Login to start tracking your amazing ideas
            </p>
          </motion.section>
        )}

        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-gray-400 text-gray-500 group-focus-within:text-[#FD366E] transition-colors duration-200 w-5 h-5" />
              <input
                type="text"
                placeholder="Search ideas by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full dark:bg-[#000000] bg-white dark:border-gray-800 border-gray-200 border rounded-xl pl-12 pr-4 py-2 dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-[#FD366E]/50 transition-all duration-200"
              />
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-gray-400 text-gray-500 hover:dark:text-white hover:text-gray-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 dark:bg-[#000000] bg-white dark:border-gray-800 border-gray-200 border rounded-xl px-4 py-2 dark:text-white text-gray-900 transition-all duration-200 group flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Filter className="w-4 h-4 group-hover:text-[#FD366E] transition-colors" />
              <span className="font-medium">Filters</span>
              <motion.div
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {(filterCategory !== "All" ||
                filterPriority !== "All" ||
                filterTags ||
                searchTerm) && (
                <motion.button
                  key="clear-all"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  onClick={clearFilters}
                  className="text-[#FD366E] hover:text-[#FD366E]/80 text-sm font-medium px-3 py-2 rounded-lg hover:bg-[#FD366E]/10 transition-all duration-200 flex-shrink-0"
                >
                  Clear All
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="dark:bg-[#000000] bg-white dark:border-gray-800 border-gray-200 border rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-sm font-medium dark:text-gray-400 text-gray-600 mb-2">
                        Category
                      </label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full dark:bg-gray-800/50 bg-gray-100 dark:border-gray-700 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-[#FD366E]/50 transition-all duration-200"
                      >
                        <option
                          value="All"
                          className="dark:bg-[#000000] bg-white"
                        >
                          All Categories
                        </option>
                        {CATEGORIES.map((cat) => (
                          <option
                            key={cat}
                            value={cat}
                            className="dark:bg-[#000000] bg-white"
                          >
                            {cat}
                          </option>
                        ))}
                      </select>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <label className="block text-sm font-medium dark:text-gray-400 text-gray-600 mb-2">
                        Priority
                      </label>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="w-full dark:bg-gray-800/50 bg-gray-100 dark:border-gray-700 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-[#FD366E]/50 transition-all duration-200"
                      >
                        <option
                          value="All"
                          className="dark:bg-[#000000] bg-white"
                        >
                          All Priorities
                        </option>
                        {PRIORITIES.map((pri) => (
                          <option
                            key={pri}
                            value={pri}
                            className="dark:bg-[#000000] bg-white"
                          >
                            {pri}
                          </option>
                        ))}
                      </select>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block text-sm font-medium dark:text-gray-400 text-gray-600 mb-2">
                        Tags
                      </label>
                      <input
                        type="text"
                        placeholder="Filter by tags..."
                        value={filterTags}
                        onChange={(e) => setFilterTags(e.target.value)}
                        className="w-full dark:bg-gray-800/50 bg-gray-100 dark:border-gray-700 border-gray-300 rounded-lg px-3 py-[7px] dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-[#FD366E]/50 transition-all duration-200"
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Ideas List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold dark:text-white text-gray-900">
              Ideas ({filteredIdeas.length})
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {filteredIdeas.length === 0 ? (
              <motion.div
                key="empty-state"
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PieChart className="w-8 h-8 dark:text-gray-600 text-gray-400 mx-auto mb-2" />
                <p className="dark:text-gray-400 text-gray-600 text-lg">
                  {searchTerm ||
                  filterCategory !== "All" ||
                  filterPriority !== "All" ||
                  filterTags
                    ? "No ideas match your filters"
                    : "No ideas yet. Create your first one!"}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="ideas-grid"
                className="grid grid-cols-1 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filteredIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.$id}
                    className="dark:bg-[#000000] bg-white rounded-2xl p-5 dark:border-gray-800 border-gray-200 border hover:border-[#FD366E]/40 transition-all duration-300 group w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                  >
                    {editingId === idea.$id ? (
                      <motion.div
                        layout
                        key="editing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold dark:text-white text-gray-900">
                            Edit Idea
                          </h3>
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={() => saveEdit(idea.$id)}
                              disabled={isUpdating}
                              className="bg-[#FD366E] hover:bg-[#FD366E]/90 disabled:bg-[#FD366E]/50 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1"
                              whileHover={!isUpdating ? { scale: 1.05 } : {}}
                              whileTap={!isUpdating ? { scale: 0.95 } : {}}
                            >
                              {isUpdating ? (
                                <>
                                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <span>Save</span>
                              )}
                            </motion.button>
                            <button
                              onClick={cancelEdit}
                              className="dark:text-white text-gray-900 p-1 dark:hover:bg-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full dark:bg-gray-800/50 bg-gray-100 dark:border-gray-700 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E]"
                        />

                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={3}
                          className="w-full dark:bg-gray-800/50 bg-gray-100 dark:border-gray-700 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E] resize-none"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="dark:bg-gray-800/50 bg-gray-100 dark:border-gray-700 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E]"
                          >
                            {CATEGORIES.map((cat) => (
                              <option
                                key={cat}
                                value={cat}
                                className="dark:bg-[#000000] bg-white"
                              >
                                {cat}
                              </option>
                            ))}
                          </select>
                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value)}
                            className="dark:bg-gray-800/50 bg-gray-100 dark:border-gray-700 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E]"
                          >
                            {PRIORITIES.map((pri) => (
                              <option
                                key={pri}
                                value={pri}
                                className="dark:bg-[#000000] bg-white"
                              >
                                {pri}
                              </option>
                            ))}
                          </select>
                        </div>

                        <input
                          type="text"
                          placeholder="Tags (comma separated)"
                          value={editTags}
                          onChange={(e) => setEditTags(e.target.value)}
                          className="w-full dark:bg-gray-800/50 bg-gray-100 dark:border-gray-700 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E]"
                        />
                      </motion.div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg md:text-xl font-semibold dark:text-white text-gray-900 group-hover:text-[#FD366E] transition-colors line-clamp-2">
                            {idea.title}
                          </h3>
                          {user.current?.$id === idea.userId && (
                            <div className="flex space-x-2 duration-300">
                              {/* Expand with AI */}
                              <div className="relative group/expand">
                                <motion.button
                                  onClick={() => handleAIExpansion(idea)}
                                  className="text-[#FD366E] hover:text-[#FD366E]/90"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Sparkles className="w-5 h-5" />
                                </motion.button>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover/expand:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10">
                                  Expand with AI
                                </div>
                              </div>

                              {/* Edit */}
                              <div className="relative group/edit">
                                <motion.button
                                  onClick={() => startEdit(idea)}
                                  className="text-blue-400 hover:text-blue-300"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Edit3 className="w-5 h-5" />
                                </motion.button>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover/edit:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10">
                                  Edit
                                </div>
                              </div>

                              {/* Delete */}
                              <div className="relative group/delete">
                                <motion.button
                                  onClick={() => setDeleteConfirm(idea.$id)}
                                  className="text-red-400 hover:text-red-300"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </motion.button>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-900 text-white text-xs rounded opacity-0 group-hover/delete:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10">
                                  Delete
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="dark:text-gray-400 text-gray-600 mb-3 text-sm leading-relaxed line-clamp-4">
                          {idea.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="bg-[#FD366E]/10 dark:text-white text-gray-900 px-3 py-1 rounded-full text-xs border border-[#FD366E]/30">
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

                        {idea.tags && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {idea.tags?.split(",")?.map((tag, i) => (
                              <span
                                key={i}
                                className="dark:bg-gray-800/50 bg-gray-100 dark:text-gray-300 text-gray-700 px-2 py-1 rounded-md text-xs flex items-center"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        <span className="flex text-sm items-center dark:text-gray-400 text-gray-600 gap-2">
                          <Calendar className="w-4 h-4" />
                          {moment(idea.$createdAt).format("MMM D, YYYY")}
                        </span>
                      </>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {deleteConfirm && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setDeleteConfirm(null)}
        >
          <motion.div
            className="dark:bg-[#000000] bg-white dark:border-gray-800 border-gray-200 border rounded-2xl p-6 max-w-md w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-500/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold dark:text-white text-gray-900">
                  Delete Idea
                </h3>
                <p className="dark:text-gray-400 text-gray-600 text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="dark:text-gray-300 text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-medium dark:text-white text-gray-900">
                  "
                  {
                    filteredIdeas.find((idea) => idea.$id === deleteConfirm)
                      ?.title
                  }
                  "
                </span>
                ?
              </p>
            </div>

            <div className="flex space-x-3">
              <motion.button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 dark:bg-gray-800 bg-gray-200 hover:dark:bg-gray-900 hover:bg-gray-300 dark:text-white text-gray-900 py-2 px-4 rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <AIExpansion
        idea={selectedIdea}
        isOpen={aiModalOpen}
        onClose={() => {
          setAiModalOpen(false);
          setSelectedIdea(null);
        }}
        onExpand={ideas.expandWithAI}
      />
    </>
  );
}
