import { useState, useEffect } from "react";
import { useUser } from "../lib/context/user";
import { useIdeas } from "../lib/context/ideas";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { Heart, Github, Compass, Globe } from "lucide-react";

const CATEGORIES = [
  "Web App",
  "Mobile App",
  "AI/ML",
  "API",
  "Tool",
  "Game",
  "Other",
];

const getCategoryCount = (category, ideas) => {
  if (category === "All") return ideas.length;
  if (category === "Other") {
    const defaultCategories = [
      "Web App",
      "Mobile App",
      "AI/ML",
      "API",
      "Tool",
      "Game",
    ];
    return ideas.filter((idea) => !defaultCategories.includes(idea.category))
      .length;
  }
  return ideas.filter((idea) => idea.category === category).length;
};

export function Discover({ navigate }) {
  const { current: currentUser } = useUser();
  const { fetchPublicIdeas, toggleLike } = useIdeas();

  const [publicIdeas, setPublicIdeas] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch public ideas
  useEffect(() => {
    const loadPublicIdeas = async () => {
      setIsLoading(true);
      try {
        const fetchedIdeas = await fetchPublicIdeas();
        setPublicIdeas(fetchedIdeas);
      } catch (error) {
        console.error("Failed to load public ideas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicIdeas();
  }, [fetchPublicIdeas]);

  // Filter ideas by category
  const filteredIdeas = publicIdeas.filter((idea) => {
    if (filterCategory === "All") {
      return true;
    } else if (filterCategory === "Other") {
      // Show ideas with categories not in the default list
      const defaultCategories = [
        "Web App",
        "Mobile App",
        "AI/ML",
        "API",
        "Tool",
        "Game",
      ];
      return !defaultCategories.includes(idea.category);
    } else {
      // Show ideas matching the selected default category
      return idea.category === filterCategory;
    }
  });

  const handleLike = async (ideaId) => {
    if (!currentUser) {
      navigate("login");
      return;
    }

    try {
      await toggleLike(ideaId, publicIdeas, setPublicIdeas);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const getAvatarContent = (userName) => {
    if (userName) {
      return userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-1 sm:p-4 space-y-4">
        {/* Header + Filter Row */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-left">
            <h1 className="text-lg sm:text-xl font-medium dark:text-white text-gray-900 flex items-center gap-2 mb-1">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-[#FD366E]" />
              Discover Ideas
            </h1>
            <p className="text-sm sm:text-base dark:text-gray-400 text-gray-600 leading-relaxed max-w-md">
              Explore amazing public ideas from the community
            </p>
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="dark:bg-[#000000] bg-white border dark:border-gray-800 border-gray-200 rounded-lg px-3 py-2 text-sm dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FD366E] transition-all"
            >
              <option value="All">
                All Categories ({getCategoryCount("All", publicIdeas)})
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({getCategoryCount(cat, publicIdeas)})
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Ideas List */}
        <section>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium dark:text-white text-gray-900">
              Public Ideas ({filteredIdeas.length})
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-6 h-6 border-2 border-[#FD366E]/30 border-t-[#FD366E] rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm sm:text-base dark:text-gray-400 text-gray-600">
                  Loading ideas...
                </p>
              </motion.div>
            ) : filteredIdeas.length === 0 ? (
              <motion.div
                key="empty-state"
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Compass className="w-6 h-6 dark:text-gray-600 text-gray-400 mx-auto mb-2" />
                <p className="text-sm sm:text-base dark:text-gray-400 text-gray-600">
                  {filterCategory === "Other"
                    ? "No custom category ideas found"
                    : filterCategory !== "All"
                      ? `No ideas found in ${filterCategory} category`
                      : "No public ideas yet"}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="ideas-grid"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filteredIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.$id}
                    className="bg-white dark:bg-black border dark:border-gray-800 border-gray-200 rounded-2xl p-4 hover:shadow-sm transition flex flex-col"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                  >
                    {/* Avatar, Name, Like */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        {idea.userProfilePicture ? (
                          <img
                            src={idea.userProfilePicture}
                            alt={idea.userName || "User"}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#FD366E] text-white text-xs font-medium flex items-center justify-center">
                            {getAvatarContent(idea.userName)}
                          </div>
                        )}
                        <div className="leading-tight">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {idea.userName || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {moment(idea.$createdAt).format("MMM D")}
                          </p>
                        </div>
                      </div>

                      {/* Like button */}
                      {currentUser?.$id !== idea.userId && (
                        <motion.button
                          onClick={() => handleLike(idea.$id)}
                          disabled={!currentUser}
                          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-[#FD366E] transition"
                          whileTap={{ scale: 0.95 }}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              idea.likedBy?.includes(currentUser?.$id)
                                ? "fill-[#FD366E] text-[#FD366E]"
                                : ""
                            }`}
                          />
                          {idea.likes || 0}
                        </motion.button>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1 break-words break-all min-w-0 leading-snug line-clamp-2">
                      {idea.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 break-words break-all min-w-0 leading-snug line-clamp-3">
                      {idea.description}
                    </p>

                    {/* Footer */}
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-auto pt-2 border-t border-gray-100 dark:border-gray-800 gap-2 min-w-0">
                      <span className="bg-[#FD366E]/10 text-[#FD366E] px-2 py-0.5 rounded-full truncate break-words break-all min-w-0 max-w-[50%]">
                        {idea.category}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        {idea.previewUrl && (
                          <a
                            href={idea.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#FD366E] hover:text-[#FD366E]/80 transition-colors"
                          >
                            <Globe className="w-4 h-4 shrink-0" />
                          </a>
                        )}

                        {idea.githubUrl && (
                          <a
                            href={idea.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#FD366E] hover:text-[#FD366E]/80 transition-colors"
                          >
                            <Github className="w-4 h-4 shrink-0" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </>
  );
}
