import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!isVisible) return null;

  const handleClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setImageLoaded(false);
  };

  const dismissBanner = (e) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <>
      <motion.div
        className="bg-gradient-to-r from-[#FD366E] to-[#ff4d7a] text-white cursor-pointer"
        onClick={handleClick}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-1">
          <div className="flex items-center justify-between w-full space-x-2">
            <div className="flex items-center space-x-2 text-sm font-medium truncate">
              <span>🎉</span>
              <span className="truncate">
                Featured by Appwrite – Monthly Community Recognition
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-90 flex-shrink-0" />
            </div>

            <motion.button
              onClick={dismissBanner}
              className="flex-shrink-0 p-1.5 hover:bg-white/15 rounded-full transition-colors duration-100"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-white dark:bg-black rounded-2xl shadow-2xl max-w-md w-full border-[0.5px] dark:border-gray-700 border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <motion.button
                  onClick={closeModal}
                  className="absolute top-3 right-3 z-10 p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors duration-100"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  <X className="w-4 h-4 text-black dark:text-white" />
                </motion.button>

                <div className="p-6">
                  <div className="text-center mb-5">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FD366E] to-[#ff4d7a] text-white px-3 py-1.5 rounded-full text-sm font-medium mb-3">
                      <span>🎉</span>
                      <span>Featured by Appwrite</span>
                    </div>
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      Community Recognition
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                      Our Idea Tracker has been selected as part of Appwrite's
                      Monthly Community Recognition program.
                    </p>
                    <a
                      href="https://appwrite.io/blog/post/product-update-july-2025"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#FD366E] hover:underline font-medium"
                    >
                      Read the official blog post →
                    </a>
                  </div>

                  <div className="rounded-xl overflow-hidden shadow-lg relative">
                    {!imageLoaded && (
                      <div className="w-full h-[380px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      </div>
                    )}

                    <motion.img
                      src="/images/appwrite-feature.png"
                      alt="Appwrite Community Recognition"
                      className="w-full h-full object-cover"
                      style={{ display: imageLoaded ? "block" : "none" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: imageLoaded ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                      loading="eager"
                      onLoad={handleImageLoad}
                      onError={() => setImageLoaded(true)}
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
