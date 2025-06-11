import { useState, useEffect } from "react";
import { useUser } from "../lib/context/user";
import { useIdeas } from "../lib/context/ideas";
import { motion } from "framer-motion";
import {
  User,
  Calendar,
  Lightbulb,
  Tag,
  Trophy,
  Zap,
  Clock,
  PieChart,
} from "lucide-react";
import { LuArrowRight } from "react-icons/lu";
import moment from "moment";

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
    if (!user.isInitialized) return;

    if (!user.current) {
      navigate("login");
      return;
    }

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
      recentActivity: userIdeas.slice(0, 3),
    });
  }, [ideas.current, user.current, user.isInitialized, navigate]);

  if (!user.current) return null;

  if (!user.isInitialized) {
    return (
      <div className="max-w-2xl mx-auto p-4 flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#FD366E] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const topCategory = Object.entries(stats.categories).sort(
    (a, b) => b[1] - a[1]
  )[0];
  const productivityScore = Math.min(
    100,
    Math.round(
      (stats.totalIdeas /
        Math.max(
          1,
          Math.ceil(
            (Date.now() - new Date(user.current.$createdAt)) /
              (1000 * 60 * 60 * 24 * 30)
          )
        )) *
        10
    )
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          <p className="text-gray-400 text-sm">
            Overview of your creative contributions
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-12 h-12 rounded-lg bg-[#FD366E] flex items-center justify-center"
        >
          <User className="w-5 h-5 text-white" />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        <motion.div
          className="bg-gradient-to-br from-[#1D1D1D] to-[#2A2A2A] rounded-2xl p-6 border border-gray-800 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-xl bg-[#FD366E] flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-white text-md ">{user.current.email}</p>

                <div className="flex items-center space-x-2 bg-[#fd366e0a] border border-[#FD366E]/30 rounded-full px-3 py-1">
                  <Zap className="w-4 h-4 text-[#FD366E]" />
                  <span className="text-xs font-medium text-white">
                    {productivityScore}% Productive
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-[#252525] rounded-lg p-4 border border-[#FD366E]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FD366E]" />
                    <span className="text-xs text-gray-300">Member since</span>
                  </div>
                  <p className="text-white text-sm font-medium mt-1">
                    {moment(user.current.$createdAt).format("MMM D, YYYY")}
                  </p>
                </div>

              
                <div className="flex-1 bg-[#252525] rounded-lg p-4 border border-[#FD366E]">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-[#FD366E]" />
                    <span className="text-xs text-gray-300">Total ideas</span>
                  </div>
                  <p className="text-white text-sm font-medium mt-1">
                    {stats.totalIdeas}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-[#1D1D1D] border border-gray-800 rounded-xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#fd366e0a] border border-[#FD366E]/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-[#FD366E]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Total Ideas</p>
              <p className="text-white font-bold">{stats.totalIdeas}</p>
            </div>
          </div>
          <div className="bg-[#1D1D1D] border border-gray-800 rounded-xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#fd366e0a] border border-[#FD366E]/20 flex items-center justify-center">
              <Tag className="w-5 h-5 text-[#FD366E]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Categories</p>
              <p className="text-white font-bold">
                {Object.keys(stats.categories).length}
              </p>
            </div>
          </div>
          <div className="bg-[#1D1D1D] border border-gray-800 rounded-xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#fd366e0a] border border-[#FD366E]/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#FD366E]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Ideas/Month</p>
              <p className="text-white font-bold">
                {stats.totalIdeas > 0
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
              </p>
            </div>
          </div>
        </motion.div>

      
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
     
          <div className="bg-[#1D1D1D] border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-[#FD366E]" />
                Categories
              </h3>
              {topCategory && (
                <div className="flex items-center space-x-1 bg-[#252525] rounded-full px-2 py-1">
                  <Trophy className="w-3 h-3 text-[#FD366E]" />
                  <span className="text-xs text-white">{topCategory[0]}</span>
                </div>
              )}
            </div>

            {Object.keys(stats.categories).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.categories)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => {
                    const percentage = Math.round(
                      (count / stats.totalIdeas) * 100
                    );
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{category}</span>
                          <span className="text-gray-400">
                            {percentage}% • {count}
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <motion.div
                            className="bg-gradient-to-r from-[#FD366E] to-[#FE6B49] h-1.5 rounded-full"
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
              <div className="text-center py-6">
                <PieChart className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No categories yet</p>
              </div>
            )}
          </div>

      
          <div className="bg-[#1D1D1D] border border-gray-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white flex items-center mb-4">
              <Clock className="w-5 h-5 mr-2 text-[#FD366E]" />
              Recent Ideas
            </h3>

            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((idea) => (
                  <motion.div
                    key={idea.$id}
                    className="p-3 bg-[#252525] border border-gray-800 rounded-lg"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-white text-sm">
                        {idea.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          idea.priority === "High"
                            ? "bg-red-500/20 text-red-300"
                            : idea.priority === "Medium"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-green-500/20 text-green-300"
                        }`}
                      >
                        {idea.priority || "Medium"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(idea.$createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs bg-[#fd366e0a] border border-[#FD366E]/20 text-[#FD366E] px-2 py-0.5 rounded">
                        {idea.category || "Web App"}
                      </span>
                    </div>
                  </motion.div>
                ))}
                <motion.button
                  onClick={() => navigate("home")}
                  className="w-full mt-2 text-sm text-[#FD366E] hover:text-[#FD366E]/80 transition-colors flex items-center justify-center space-x-1"
                  whileHover={{ scale: 1.02 }}
                >
                  <span>View all ideas</span>
                  <LuArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Lightbulb className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm mb-3">No recent ideas</p>
                <motion.button
                  onClick={() => navigate("home")}
                  className="text-sm bg-[#FD366E] hover:bg-[#FD366E]/90 text-white px-4 py-2 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  Create your first idea
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
