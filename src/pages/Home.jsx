import { useState, useEffect } from "react";
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
  Github,
  Check,
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

  const [isPublic, setIsPublic] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [editGithubUrl, setEditGithubUrl] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (deleteConfirm) setDeleteConfirm(null);
        if (aiModalOpen) setAiModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [deleteConfirm, aiModalOpen]);

  const handleAIExpansion = (idea) => {
    setSelectedIdea(idea);
    setAiModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedGithubUrl = githubUrl.trim();

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

    // Validate description length
    if (trimmedDescription.length < 10 && trimmedDescription.length > 0) {
      toast.error("Description must be at least 10 characters if provided");
      return;
    }

    if (trimmedDescription.length > 500) {
      toast.error("Description must be less than 500 characters");
      return;
    }

    // Validate GitHub URL if provided
    if (trimmedGithubUrl && !trimmedGithubUrl.includes("github.com")) {
      toast.error("Please enter a valid GitHub URL");
      return;
    }

    // Validate GitHub URL length
    if (trimmedGithubUrl.length > 200) {
      toast.error("GitHub URL must be less than 200 characters");
      return;
    }

    // Validate individual tags
    const tagArray = tags
      ?.split(",")
      ?.map((tag) => tag.trim())
      ?.filter(Boolean);
    if (tagArray?.some((tag) => tag.length > 20)) {
      toast.error("Each tag must be 20 characters or less");
      return;
    }
    if (tagArray?.some((tag) => tag.length < 2 && tag.length > 0)) {
      toast.error("Each tag must be at least 2 characters");
      return;
    }
    if (tagArray?.length > 5) {
      toast.error("Maximum 5 tags allowed");
      return;
    }

    setIsSubmitting(true);

    try {
      const processedTags = tags
        ?.split(",")
        ?.map((tag) => tag.trim())
        ?.filter(Boolean)
        ?.filter((tag) => tag.length <= 20)
        ?.slice(0, 5)
        ?.join(",");

      await ideas.add({
        userId: user.current.$id,
        title: trimmedTitle,
        description: trimmedDescription,
        category,
        priority,
        tags: processedTags,
        isPublic: isPublic,
        githubUrl: trimmedGithubUrl || null,
        likes: 0,
        likedBy: [],
      });

      setTitle("");
      setDescription("");
      setTags("");
      setIsPublic(false);
      setGithubUrl("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add idea. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveEdit = async (ideaId) => {
    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();
    const trimmedGithubUrl = editGithubUrl.trim();

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

    // Validate description length
    if (trimmedDescription.length < 10 && trimmedDescription.length > 0) {
      toast.error("Description must be at least 10 characters if provided");
      return;
    }

    if (trimmedDescription.length > 500) {
      toast.error("Description must be less than 500 characters");
      return;
    }

    // Validate GitHub URL if provided
    if (trimmedGithubUrl && !trimmedGithubUrl.includes("github.com")) {
      toast.error("Please enter a valid GitHub URL");
      return;
    }

    // Validate GitHub URL length
    if (trimmedGithubUrl.length > 200) {
      toast.error("GitHub URL must be less than 200 characters");
      return;
    }

    // Validate individual tags
    const tagArray = editTags
      ?.split(",")
      ?.map((tag) => tag.trim())
      ?.filter(Boolean);
    if (tagArray?.some((tag) => tag.length > 20)) {
      toast.error("Each tag must be 20 characters or less");
      return;
    }
    if (tagArray?.some((tag) => tag.length < 2 && tag.length > 0)) {
      toast.error("Each tag must be at least 2 characters");
      return;
    }
    if (tagArray?.length > 5) {
      toast.error("Maximum 5 tags allowed");
      return;
    }

    setIsUpdating(true);

    try {
      const processedTags = editTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .filter((tag) => tag.length <= 20)
        .slice(0, 5)
        .join(",");

      await ideas.update(ideaId, {
        title: trimmedTitle,
        description: trimmedDescription,
        category: editCategory,
        priority: editPriority,
        tags: processedTags,
        isPublic: editIsPublic,
        githubUrl: trimmedGithubUrl || null,
      });

      cancelEdit();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update idea. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const startEdit = (idea) => {
    setEditingId(idea.$id);
    setEditTitle(idea.title);
    setEditDescription(idea.description);
    setEditCategory(idea.category);
    setEditPriority(idea.priority);
    setEditTags(idea.tags || "");
    setEditIsPublic(idea.isPublic || false);
    setEditGithubUrl(idea.githubUrl || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditCategory("");
    setEditPriority("");
    setEditTags("");
    setEditIsPublic(false);
    setEditGithubUrl("");
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
    if (!user?.current || !idea?.userId || idea.userId !== user.current.$id) {
      return false;
    }

    const matchesSearch =
      (idea?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (idea?.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "All" || idea?.category === filterCategory;

    const matchesPriority =
      filterPriority === "All" || idea?.priority === filterPriority;

    const matchesTags =
      !filterTags ||
      (idea?.tags &&
        idea.tags.toLowerCase().includes(filterTags.toLowerCase()));

    return matchesSearch && matchesCategory && matchesPriority && matchesTags;
  });

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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-medium dark:text-white text-gray-900 mb-3 tracking-wide">
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
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-medium dark:text-white text-gray-900">
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

                    <div className="space-y-3">
                      {/* Title + Category */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          placeholder="Idea title..."
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          maxLength={100}
                          minLength={3}
                          className="w-full text-sm px-3 py-2 dark:bg-gray-800/50 bg-gray-50 border-[0.5px] dark:border-gray-700 border-gray-200 rounded-lg dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent transition-all duration-200"
                          required
                        />

                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full text-sm px-3 py-2 dark:bg-gray-800/50 bg-gray-50 border-[0.5px] dark:border-gray-700 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent transition-all duration-200"
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

                      {/* Description */}
                      <textarea
                        placeholder="Describe your idea (min 10 chars)..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        maxLength={500}
                        minLength={10}
                        className="w-full text-sm px-3 py-2 dark:bg-gray-800/50 bg-gray-50 border-[0.5px] dark:border-gray-700 border-gray-200 rounded-lg dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent resize-none transition-all duration-200"
                      />

                      {/* Priority + GitHub */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full text-sm px-3 py-2 dark:bg-gray-800/50 bg-gray-50 border-[0.5px] dark:border-gray-700 border-gray-200 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent transition-all duration-200"
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

                        <div className="relative">
                          <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-gray-400 text-gray-500" />
                          <input
                            type="url"
                            placeholder="GitHub URL (max 200 chars)"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            maxLength={200}
                            className="w-full text-sm pl-10 pr-3 py-2 dark:bg-gray-800/50 bg-gray-50 border-[0.5px] dark:border-gray-700 border-gray-200 rounded-lg dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Tags + Toggle */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          placeholder="Tags (max 5, 20 chars each)"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          maxLength={200}
                          className="w-full text-sm px-3 py-2 dark:bg-gray-800/50 bg-gray-50 border-[0.5px] dark:border-gray-700 border-gray-200 rounded-lg dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent transition-all duration-200"
                        />
                        <div className="flex items-center justify-between px-3 py-2 dark:bg-gray-800/50 bg-gray-50 rounded-lg border-[0.5px] dark:border-gray-700 border-gray-200">
                          <span className="text-sm dark:text-white text-gray-900">
                            {isPublic ? "Public" : "Private"}
                          </span>
                          <button
                            onClick={() => setIsPublic(!isPublic)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                              isPublic
                                ? "bg-[#FD366E]"
                                : "bg-gray-300 dark:bg-gray-600"
                            } cursor-pointer`}
                            aria-pressed={isPublic}
                            aria-label="Toggle idea visibility"
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                                isPublic ? "translate-x-5" : "translate-x-1"
                              }`}
                            >
                              {isPublic && (
                                <Check className="w-2 h-2 text-[#FD366E] absolute inset-0 m-auto" />
                              )}
                            </span>
                          </button>
                        </div>
                      </div>
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
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-gray-400 text-gray-500 group-focus-within:text-[#FD366E] transition-colors duration-200 w-5 h-5" />

              <input
                type="text"
                placeholder="Search ideas by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full dark:bg-[#000000] bg-white dark:border-gray-800 border-gray-200 border rounded-xl pl-12 pr-12 py-2 dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-[#FD366E]/50 transition-all duration-200"
              />

              <div className="absolute right-4 top-2.5">
                <AnimatePresence>
                  {searchTerm && (
                    <motion.button
                      key="clear-button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      onClick={() => setSearchTerm("")}
                      className="text-gray-500 dark:text-gray-400 hover:text-[#FD366E] transition-colors duration-200 w-5 h-5"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 dark:bg-[#000000] bg-white dark:border-gray-800 border-gray-200 border rounded-xl px-4 py-2 dark:text-white text-gray-900 transition-all duration-200 group flex-shrink-0 relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Filter className="w-4 h-4 group-hover:text-[#FD366E] transition-colors" />
              <span className="font-medium">Filters</span>
              {!showFilters &&
                (() => {
                  const activeFiltersCount =
                    (filterCategory !== "All" ? 1 : 0) +
                    (filterPriority !== "All" ? 1 : 0) +
                    (filterTags ? 1 : 0);
                  return activeFiltersCount > 0 ? (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#FD366E] text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5 ml-1"
                    >
                      {activeFiltersCount}
                    </motion.span>
                  ) : null;
                })()}
              <motion.div
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium dark:text-white text-gray-900">
              Ideas ({filteredIdeas?.length || 0})
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
                    className="dark:bg-[#000000] bg-white rounded-2xl p-4 dark:border-gray-800 border-gray-200 border hover:border-[#FD366E]/40 transition-all duration-300 group w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                  >
                    {editingId === idea.$id ? (
                      <motion.div
                        key="editing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium dark:text-white text-gray-900 break-words min-w-0 flex-1 mr-4">
                            Edit Idea
                          </h3>
                          <div className="flex space-x-2 flex-shrink-0">
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

                        <div className="space-y-4">
                          {/* Title and Category Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              maxLength={100}
                              minLength={3}
                              placeholder="Idea title..."
                              className="w-full text-sm px-3 py-2 rounded-lg dark:bg-gray-800/50 bg-gray-50 border-[0.5px] dark:border-gray-700 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent transition-all duration-200"
                            />

                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="w-full text-sm px-3 py-2 rounded-lg dark:bg-gray-800/50 bg-gray-50 border-[0.5px] dark:border-gray-700 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent transition-all duration-200"
                            >
                              {CATEGORIES.map((cat) => (
                                <option
                                  key={cat}
                                  value={cat}
                                  className="dark:bg-black bg-white"
                                >
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Description */}
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={3}
                            maxLength={500}
                            minLength={10}
                            placeholder="Describe your idea (min 10 chars)..."
                            className="w-full text-sm px-3 py-2 rounded-lg dark:bg-gray-800/50 bg-gray-50 border-[0.5px] dark:border-gray-700 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent resize-none transition-all duration-200"
                          />

                          {/* Priority and GitHub URL Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <select
                              value={editPriority}
                              onChange={(e) => setEditPriority(e.target.value)}
                              className="w-full text-sm px-3 py-2 rounded-lg dark:bg-gray-800/50 bg-gray-50 border-[0.5px] dark:border-gray-700 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent transition-all duration-200"
                            >
                              {PRIORITIES.map((pri) => (
                                <option
                                  key={pri}
                                  value={pri}
                                  className="dark:bg-black bg-white"
                                >
                                  {pri}
                                </option>
                              ))}
                            </select>

                            <div className="relative">
                              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-gray-400 text-gray-500" />
                              <input
                                type="url"
                                placeholder="GitHub URL (max 200 chars)"
                                value={editGithubUrl}
                                onChange={(e) =>
                                  setEditGithubUrl(e.target.value)
                                }
                                maxLength={200}
                                className="w-full text-sm pl-10 pr-3 py-2 rounded-lg dark:bg-gray-800/50 bg-gray-50 border-[0.5px] dark:border-gray-700 border-gray-200 dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent transition-all duration-200"
                              />
                            </div>
                          </div>

                          {/* Tags and Public Toggle Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Tags (max 5, 20 chars each)"
                              value={editTags}
                              onChange={(e) => setEditTags(e.target.value)}
                              maxLength={200}
                              className="w-full text-sm px-3 py-2 rounded-lg dark:bg-gray-800/50 bg-gray-50 border-[0.5px] dark:border-gray-700 border-gray-200 dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E] focus:border-transparent transition-all duration-200"
                            />

                            <div className="flex items-center justify-between px-3 py-2 rounded-lg dark:bg-gray-800/50 bg-gray-50 border-[0.5px] dark:border-gray-700 border-gray-200">
                              <span className="text-sm dark:text-white text-gray-900">
                                {editIsPublic ? "Public" : "Private"}
                              </span>
                              <button
                                onClick={() => setEditIsPublic(!editIsPublic)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                                  editIsPublic
                                    ? "bg-[#FD366E]"
                                    : "bg-gray-300 dark:bg-gray-600"
                                } cursor-pointer`}
                                aria-pressed={editIsPublic}
                                aria-label="Toggle idea visibility"
                              >
                                <span
                                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                                    editIsPublic
                                      ? "translate-x-5"
                                      : "translate-x-1"
                                  }`}
                                >
                                  {editIsPublic && (
                                    <Check className="w-2 h-2 text-[#FD366E] absolute inset-0 m-auto" />
                                  )}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="min-w-0">
                        {/* Title + Actions */}
                        <div className="flex items-start gap-4 mb-2.5">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-[#FD366E] transition-colors break-words break-all min-w-0 flex-1 leading-tight">
                            {idea.title}
                          </h3>

                          {user.current?.$id === idea.userId && (
                            <div className="flex space-x-2 flex-shrink-0 relative">
                              {/* Expand with AI */}
                              <div className="relative group/expand">
                                <motion.button
                                  onClick={() => handleAIExpansion(idea)}
                                  className="text-[#FD366E] hover:text-[#FD366E]/90 p-1 rounded-md hover:bg-[#FD366E]/10 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Sparkles className="w-5 h-5" />
                                </motion.button>
                                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/expand:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-20 shadow-lg">
                                  Expand with AI
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>

                              {/* Edit */}
                              <div className="relative group/edit">
                                <motion.button
                                  onClick={() => startEdit(idea)}
                                  className="text-blue-400 hover:text-blue-300 p-1 rounded-md hover:bg-blue-400/10 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Edit3 className="w-5 h-5" />
                                </motion.button>
                                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/edit:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-20 shadow-lg">
                                  Edit
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>

                              {/* Delete */}
                              <div className="relative group/delete">
                                <motion.button
                                  onClick={() => setDeleteConfirm(idea.$id)}
                                  className="text-red-500 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </motion.button>
                                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/delete:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-20 shadow-lg">
                                  Delete
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2.5 leading-relaxed break-words break-all">
                          {idea.description}
                        </p>

                        {/* Labels */}
                        <div className="flex flex-wrap gap-2 mb-2.5">
                          <span className="bg-[#FD366E]/10 text-[#FD366E] dark:text-white px-3 py-1 rounded-full text-xs border border-[#FD366E]/30 break-words break-all">
                            {idea.category}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-xs border break-words break-all ${getPriorityColor(
                              idea.priority
                            )}`}
                          >
                            {idea.priority}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-xs border break-words break-all ${
                              idea.isPublic
                                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"
                                : "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30"
                            }`}
                          >
                            {idea.isPublic ? "Public" : "Private"}
                          </span>
                        </div>

                        {/* Tags */}
                        {idea?.tags && (
                          <div className="flex flex-wrap gap-2 mb-2.5">
                            {idea.tags.split(",").map((tag, i) => {
                              const trimmedTag = tag?.trim();
                              if (!trimmedTag) return null;
                              return (
                                <span
                                  key={i}
                                  className="flex items-center text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 max-w-full"
                                >
                                  <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="break-words break-all truncate max-w-32">
                                    {trimmedTag}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1.5 border-t border-gray-100 dark:border-gray-800">
                          {/* GitHub */}
                          {idea.githubUrl && (
                            <a
                              href={idea.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[#FD366E] hover:text-[#FD366E]/80 text-sm min-w-0"
                            >
                              <Github className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate break-all">
                                View on GitHub
                              </span>
                            </a>
                          )}

                          {/* Created Date */}
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2 sm:justify-end">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                              {moment(idea.$createdAt).format("MMM D, YYYY")}
                            </span>
                          </div>
                        </div>
                      </div>
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
              <div className="w-10 h-10 bg-red-300/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
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
                <span className="font-medium dark:text-white text-gray-900 break-words">
                  "
                  {filteredIdeas?.find((idea) => idea?.$id === deleteConfirm)
                    ?.title || "Unknown"}
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
