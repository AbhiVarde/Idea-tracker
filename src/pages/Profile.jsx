import { useState, useEffect } from "react";
import { useUser } from "../lib/context/user";
import { useIdeas } from "../lib/context/ideas";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  BarChart3,
  Lightbulb,
  Tag,
  Trophy,
} from "lucide-react";

export function Profile({ navigate }) {
  const user = useUser();
  const ideas = useIdeas();
  const [stats, setStats] = useState({
    totalIdeas: 0,
    categories: {},
    priorities: {},
    recentActivity: [],
  });

  useEffect(() => {
    if (!user.current) {
      navigate("login");
      return;
    }

    // Calculate stats
    const userIdeas = ideas.current.filter(
      (idea) => idea.userId === user.current.$id
    );
    const categories = {};
    const priorities = {};

    userIdeas.forEach((idea) => {
      const cat = idea.category || "Web App";
      const pri = idea.priority || "Medium";

      categories[cat] = (categories[cat] || 0) + 1;
      priorities[pri] = (priorities[pri] || 0) + 1;
    });

    setStats({
      totalIdeas: userIdeas.length,
      categories,
      priorities,
      recentActivity: userIdeas.slice(0, 5),
    });
  }, [ideas.current, user.current, navigate]);

  if (!user.current) return null;

  const memberSince = new Date(user.current.$createdAt).toLocaleDateString();
  const topCategory = Object.entries(stats.categories).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          Developer Profile
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Track your creative journey and achievements
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <motion.div
          className="md:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-[#1D1D1D] border border-gray-800 rounded-2xl p-5 space-y-5">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#FD366E] rounded-full flex items-center justify-center mx-auto shadow-lg ring-2 ring-[#FD366E]/40">
                <User className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-medium text-white mt-3 mb-0.5 truncate">
                {user.current.name || "Developer"}
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">Idea Innovator</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-4 h-4 text-[#FD366E] flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">
                  {user.current.email}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Calendar className="w-4 h-4 text-[#FD366E] flex-shrink-0" />
                <span className="text-xs sm:text-sm">
                  Member since {memberSince}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Lightbulb className="w-4 h-4 text-[#FD366E] flex-shrink-0" />
                <span className="text-xs sm:text-sm">
                  {stats.totalIdeas} Ideas Created
                </span>
              </div>
            </div>

            {topCategory && (
              <div className="bg-[#fd366e0a] border border-[#FD366E] rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Trophy className="w-4 h-4 text-[#FD366E]" />
                  <span className="font-semibold text-white text-sm">
                    Top Category
                  </span>
                </div>
                <p className="text-white text-sm truncate">
                  {topCategory[0]} ({topCategory[1]} ideas)
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats and Activity */}
        <motion.div
          className="md:col-span-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="space-y-5">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1D1D1D] border border-gray-800 rounded-xl p-4 text-center">
                <Lightbulb className="w-6 h-6 text-[#FD366E] mx-auto mb-1" />
                <div className="text-xl font-bold text-white">
                  {stats.totalIdeas}
                </div>
                <div className="text-gray-400 text-xs">Total Ideas</div>
              </div>
              <div className="bg-[#1D1D1D] border border-gray-800 rounded-xl p-4 text-center">
                <Tag className="w-6 h-6 text-[#FD366E] mx-auto mb-1" />
                <div className="text-xl font-bold text-white">
                  {Object.keys(stats.categories).length}
                </div>
                <div className="text-gray-400 text-xs">Categories</div>
              </div>
              <div className="bg-[#1D1D1D] border border-gray-800 rounded-xl p-4 text-center">
                <BarChart3 className="w-6 h-6 text-[#FD366E] mx-auto mb-1" />
                <div className="text-xl font-bold text-white">
                  {stats.recentActivity.length > 0
                    ? Math.round(
                        stats.totalIdeas /
                          Math.max(
                            1,
                            Math.ceil(
                              (Date.now() - new Date(user.current.$createdAt)) /
                                (1000 * 60 * 60 * 24 * 30)
                            )
                          )
                      )
                    : 0}
                </div>
                <div className="text-gray-400 text-xs">Ideas/Month</div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-[#1D1D1D] border border-gray-800 rounded-2xl p-4">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-[#FD366E]" />
                Category Breakdown
              </h3>

              {Object.keys(stats.categories).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.categories)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => {
                      const percentage = (count / stats.totalIdeas) * 100;
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-300 truncate">
                              {category}
                            </span>
                            <span className="text-gray-400">{count} ideas</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-1.5">
                            <motion.div
                              className="bg-[#FD366E] h-1.5 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-6 text-sm">
                  No ideas yet. Start creating!
                </p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-[#1D1D1D] border border-gray-800 rounded-2xl p-4">
              <h3 className="text-lg font-bold text-white mb-3">
                Recent Ideas
              </h3>

              {stats.recentActivity.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                    hidden: {},
                  }}
                >
                  {stats.recentActivity.map((idea, index) => (
                    <motion.div
                      key={idea.$id}
                      className="flex flex-col justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0 },
                      }}
                    >
                      <div>
                        <h4 className="font-medium text-white mb-2 truncate">
                          {idea.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-400 mb-3">
                          <span className="bg-[#fd366e0a] border border-[#FD366E] text-white px-2 py-0.5 rounded-full text-[10px] sm:text-xs mr-2">
                            {idea.category || "Web App"}
                          </span>
                          {new Date(idea.$createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`mt-auto px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start ${
                          idea.priority === "High"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : idea.priority === "Medium"
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            : "bg-green-500/20 text-green-300 border border-green-500/30"
                        }`}
                      >
                        {idea.priority || "Medium"}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-6">
                  <Lightbulb className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 mb-3 text-sm">No ideas yet.</p>
                  <motion.button
                    onClick={() => navigate("home")}
                    className="text-[#FD366E] hover:text-[#FD366E]/80 transition-colors text-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    Create your first idea →
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
