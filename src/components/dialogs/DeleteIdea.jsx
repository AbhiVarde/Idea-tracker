import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export function DeleteIdea({ isOpen, onClose, ideaTitle, onDelete }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="dark:bg-[#000000] bg-white dark:border-gray-800 border-gray-200 border rounded-2xl p-6 max-w-md w-full mx-4"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-300/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium dark:text-white text-gray-900">
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
                "{ideaTitle || "Unknown"}"
              </span>
              ?
            </p>
          </div>

          <div className="flex space-x-3">
            <motion.button
              onClick={onClose}
              className="flex-1 dark:bg-gray-800 bg-gray-200 hover:dark:bg-gray-900 hover:bg-gray-300 dark:text-white text-gray-900 py-2 px-4 rounded-xl transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={onDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Delete
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
