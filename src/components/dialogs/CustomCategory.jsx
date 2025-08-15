import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

export function CustomCategory({
  isOpen,
  onClose,
  newCategory,
  setNewCategory,
  onSubmit,
}) {
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium dark:text-white text-gray-900">
                Add Custom Category
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="dark:text-gray-400 text-gray-600 hover:dark:text-white hover:text-gray-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name..."
              maxLength={50}
              className="w-full text-sm px-3 py-2 dark:bg-gray-800/50 bg-gray-50 border-[0.5px] dark:border-gray-700 border-gray-200 rounded-lg dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD366E] mb-4"
              autoFocus
              required
            />

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 dark:bg-gray-800 bg-gray-200 hover:dark:bg-gray-900 hover:bg-gray-300 dark:text-white text-gray-900 py-2 px-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#FD366E] hover:bg-[#FD366E]/90 text-white py-2 px-4 rounded-xl transition-colors"
              >
                Add & Select
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
