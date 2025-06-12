import { useState } from "react";
import { useUser } from "../lib/context/user";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

const AccountSettings = ({ isOpen, onClose }) => {
  const user = useUser();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

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
    onClose();
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
          className="bg-[#1D1D1D] border border-gray-800 rounded-2xl p-6 w-full max-w-sm relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">
              Account Settings
            </h2>
            <p className="text-gray-400 text-sm">
              Manage your account preferences
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-800/30 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-[#FD366E] rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                {user.current?.email
                  ?.split("@")[0]
                  ?.split(".")
                  ?.map((n) => n[0])
                  ?.join("")
                  ?.toUpperCase()}
              </div>
              <p className="text-white font-medium mb-1">
                {user.current?.email}
              </p>
              <p className="text-gray-400 text-sm">
                Member since{" "}
                {new Date(user.current?.$createdAt).toLocaleDateString()}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-red-400 font-semibold">Delete Account</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
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
                  <p className="text-red-400 text-sm font-medium">
                    Type "DELETE" to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm px-3 py-[7px] text-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-all"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <motion.button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "DELETE" || isDeleting}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 rounded-lg transition-all flex items-center justify-center"
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
