import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [showModal, setShowModal] = useState(false);

  if (!isVisible) return null;

  const handleClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const dismissBanner = (e) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  return (
    <>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gradient-to-r from-[#FD366E] to-[#ff4d7a] text-white cursor-pointer"
        onClick={handleClick}
      >
        <div className="max-w-4xl mx-auto px-4 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-full">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <span>🎉</span>
                <span>
                  Featured by Appwrite - Monthly Community Recognition
                </span>
                <ExternalLink className="w-3.5 h-3.5 opacity-90" />
              </div>
            </div>

            <motion.button
              onClick={dismissBanner}
              className="flex-shrink-0 p-1.5 hover:bg-white/15 rounded-full transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <motion.button
                  onClick={closeModal}
                  className="absolute top-3 right-3 z-10 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>

                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FD366E] to-[#ff4d7a] text-white px-3 py-1.5 rounded-full text-sm font-medium mb-3">
                      <span>🎉</span>
                      <span>Featured by Appwrite</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Community Recognition
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Our Idea Tracker has been selected as part of Appwrite's
                      Monthly Community Recognition program.
                    </p>
                  </div>

                  <div className="rounded-lg overflow-hidden shadow-md mb-4">
                    <img
                      src="/images/appwrite-feature.png"
                      alt="Appwrite Community Recognition"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AnnouncementBar;
