import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { databases } from "../../lib/appwrite";
import { useUser } from "../../lib/context/user";
import { ID, Query } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const NotificationPreferences = ({ isOpen, onClose }) => {
  const { current: user } = useUser();
  const [preferences, setPreferences] = useState({
    ideaAdded: true,
    ideaExpanded: true,
    weeklySummary: true,
    emailNotifications: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialPreferences, setInitialPreferences] = useState({});

  // Load user preferences on component mount
  useEffect(() => {
    if (isOpen && user) {
      loadUserPreferences();
    }
  }, [isOpen, user]);

  // Track changes
  useEffect(() => {
    const changed = Object.keys(preferences).some(
      (key) => preferences[key] !== initialPreferences[key]
    );
    setHasChanges(changed);
  }, [preferences, initialPreferences]);

  const loadUserPreferences = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("userId", user.$id)]
      );

      let userPrefs = {
        ideaAdded: true,
        ideaExpanded: true,
        weeklySummary: true,
        emailNotifications: true,
      };

      if (response.documents.length > 0) {
        const dbPrefs = response.documents[0];
        userPrefs = {
          ideaAdded: dbPrefs.ideaAdded ?? true,
          ideaExpanded: dbPrefs.ideaExpanded ?? true,
          weeklySummary: dbPrefs.weeklySummary ?? true,
          emailNotifications: dbPrefs.emailNotifications ?? true,
        };
      }

      setPreferences(userPrefs);
      setInitialPreferences(userPrefs);
    } catch (error) {
      console.error("Failed to load preferences:", error);
      toast.error("Failed to load notification preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, [key]: !prev[key] };

      // If turning off email notifications, turn off all specific notifications
      if (key === "emailNotifications" && !prev[key] === false) {
        return {
          ...newPrefs,
          ideaAdded: false,
          ideaExpanded: false,
          weeklySummary: false,
        };
      }

      // If turning on any specific notification, ensure email notifications is on
      if (key !== "emailNotifications" && !prev[key] === true) {
        return {
          ...newPrefs,
          emailNotifications: true,
        };
      }

      return newPrefs;
    });
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Please log in to save preferences");
      return;
    }

    setIsSaving(true);
    try {
      // Check if user preferences already exist
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("userId", user.$id)]
      );

      const timestamp = new Date().toISOString();

      if (existing.documents.length > 0) {
        // Update existing preferences
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          existing.documents[0].$id,
          {
            ...preferences,
            updatedAt: timestamp,
          }
        );
      } else {
        // Create new preferences document
        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          {
            userId: user.$id,
            ...preferences,
            createdAt: timestamp,
            updatedAt: timestamp,
          }
        );
      }

      setInitialPreferences(preferences);
      setHasChanges(false);
      toast.success("Notification preferences updated!");
      onClose();
    } catch (error) {
      console.error("Failed to update preferences:", error);
      toast.error("Failed to update preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (
        confirm("You have unsaved changes. Are you sure you want to close?")
      ) {
        setPreferences(initialPreferences);
        setHasChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, hasChanges]);

  if (!isOpen) return null;

  const notificationOptions = [
    {
      key: "emailNotifications",
      label: "Email Notifications",
      desc: "Master toggle for all email notifications",
      primary: true,
    },
    {
      key: "ideaAdded",
      label: "New Idea Added",
      desc: "Get notified when you add a new idea",
      disabled: !preferences.emailNotifications,
    },
    {
      key: "ideaExpanded",
      label: "AI Expansion Complete",
      desc: "Get notified when AI expands your ideas",
      disabled: !preferences.emailNotifications,
    },
    {
      key: "weeklySummary",
      label: "Weekly Summary",
      desc: "Receive weekly idea statistics",
      disabled: !preferences.emailNotifications,
    },
  ];

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
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            disabled={isSaving}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#FD366E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6 text-[#FD366E]" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Notifications
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage your notification preferences
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#FD366E]/30 border-t-[#FD366E] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {notificationOptions.map(
                  ({ key, label, desc, primary, disabled }) => (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                        primary
                          ? "bg-[#FD366E]/5 border border-[#FD366E]/20"
                          : disabled
                            ? "bg-gray-50 dark:bg-gray-800/20 opacity-60"
                            : "bg-[#f4f4f7] dark:bg-gray-800/30"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {primary && (
                          <AlertCircle className="w-4 h-4 text-[#FD366E] mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium text-sm mb-1 ${
                              disabled
                                ? "text-gray-500 dark:text-gray-500"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {label}
                          </h4>
                          <p
                            className={`text-xs line-clamp-2 ${
                              disabled
                                ? "text-gray-400 dark:text-gray-600"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {desc}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => !disabled && handleToggle(key)}
                        disabled={isSaving || disabled}
                        className={`relative ml-3 inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          preferences[key] && !disabled
                            ? "bg-[#FD366E]"
                            : "bg-gray-300 dark:bg-gray-600"
                        } ${isSaving || disabled ? "opacity-50" : "cursor-pointer"}`}
                        aria-pressed={preferences[key]}
                        aria-label={`Toggle ${label}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            preferences[key] ? "translate-x-6" : "translate-x-1"
                          }`}
                        >
                          {preferences[key] && (
                            <Check className="w-3 h-3 text-[#FD366E] absolute inset-0 m-auto" />
                          )}
                        </span>
                      </button>
                    </div>
                  )
                )}
              </div>

              {hasChanges && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    You have unsaved changes
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className="flex-1 bg-[#FD366E] hover:bg-[#FD366E]/90 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                  whileHover={{ scale: isSaving || !hasChanges ? 1 : 1.02 }}
                  whileTap={{ scale: isSaving || !hasChanges ? 1 : 0.98 }}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPreferences;
