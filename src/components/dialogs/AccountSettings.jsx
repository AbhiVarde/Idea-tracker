import { useState, useRef } from "react";
import { useUser } from "../../lib/context/user";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, X, Camera, Upload, UserX } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

const AccountSettings = ({ isOpen, onClose }) => {
  const user = useUser();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showProfileActions, setShowProfileActions] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a JPG, JPEG, or PNG image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    setShowProfileActions(false);
    try {
      await user.uploadProfilePicture(file);
      // Clear the file input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    setIsUploadingImage(true);
    setShowProfileActions(false);
    try {
      await user.removeProfilePicture();
    } catch (error) {
      console.error("Remove error:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;

    setIsDeleting(true);
    setError("");

    try {
      await user.deleteAccount();
      toast.success("Account deleted successfully!");
      onClose();
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error) {
      console.error("Delete account error:", error);
      setError(error.message || "Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
    setError("");
    setShowProfileActions(false);
    onClose();
  };

  const getInitials = () => {
    const currentUser = user.current;
    let initials = "";
    if (currentUser?.name) {
      initials = currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    } else if (currentUser?.email) {
      const emailParts = currentUser.email.split("@")[0].split(".");
      initials = emailParts
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return initials || "U";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-[#000000] dark:border-gray-800 border-gray-200 border rounded-2xl p-6 w-full max-w-sm relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Account Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage your account preferences
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-[#f4f4f7] dark:bg-gray-800/30 rounded-xl p-4 text-center">
              <div className="relative inline-block mb-3">
                <div className="w-16 h-16 bg-[#FD366E] rounded-full flex items-center justify-center text-white font-medium text-xl mx-auto relative">
                  {user.current?.prefs?.profilePictureId ? (
                    <div className="relative w-16 h-16">
                      <img
                        src={user.getProfilePictureUrl(
                          user.current.prefs.profilePictureId
                        )}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                        onLoad={(e) => {
                          // Hide fallback when image loads successfully
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = "none";
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      <div className="w-16 h-16 bg-[#FD366E] rounded-full flex items-center justify-center text-white font-medium text-xl absolute inset-0">
                        {getInitials()}
                      </div>
                    </div>
                  ) : (
                    getInitials()
                  )}
                </div>

                {/* Profile Actions Button */}
                <motion.button
                  onClick={() => setShowProfileActions(!showProfileActions)}
                  disabled={isUploadingImage}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#FD366E] hover:bg-[#FD366E]/80 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 border-2 border-white dark:border-black"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isUploadingImage ? (
                    <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </motion.button>

                {/* Profile Actions Dropdown */}
                <AnimatePresence>
                  {showProfileActions && !isUploadingImage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{
                        duration: 0.25,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                      className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#000000] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-10 w-36"
                    >
                      <motion.button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowProfileActions(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60 rounded-lg transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">
                          {user.current?.prefs?.profilePictureId
                            ? "Change Photo"
                            : "Upload Photo"}
                        </span>
                      </motion.button>

                      {user.current?.prefs?.profilePictureId && (
                        <motion.button
                          onClick={handleRemoveImage}
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors duration-200 ease-in-out"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <UserX className="w-4 h-4" />
                          <span className="text-sm">Remove Photo</span>
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="text-gray-900 dark:text-white font-medium mb-1">
                {user.current?.email}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Member since{" "}
                {moment(user.current?.$createdAt).format("DD MMM YYYY")}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </p>
              </div>
            )}

            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-red-600 dark:text-red-400 font-semibold">
                  Delete Account
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                This will permanently delete your account and all your ideas.
                This action cannot be undone.
              </p>

              {!showDeleteConfirm ? (
                <motion.button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3"
                >
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                    Type "DELETE" to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm px-3 py-[7px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Type DELETE here"
                    autoFocus
                    disabled={isDeleting}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                        setError("");
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 rounded-lg transition-all"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <motion.button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "DELETE" || isDeleting}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white py-2 rounded-lg transition-all flex items-center justify-center"
                      whileHover={{
                        scale:
                          deleteConfirmText === "DELETE" && !isDeleting
                            ? 1.02
                            : 1,
                      }}
                      whileTap={{
                        scale:
                          deleteConfirmText === "DELETE" && !isDeleting
                            ? 0.98
                            : 1,
                      }}
                    >
                      {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Delete Forever"
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AccountSettings;
