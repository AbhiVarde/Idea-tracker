import { functions } from "../appwrite";

const EMAIL_FUNCTION_ID = import.meta.env.VITE_APPWRITE_EMAIL_FUNCTION_ID;

class EmailService {
  constructor() {
    if (!EMAIL_FUNCTION_ID) {
      console.warn("VITE_APPWRITE_EMAIL_FUNCTION_ID is not configured");
    }
  }

  async sendNotification(type, userEmail, userName, additionalData = {}) {
    try {
      if (!EMAIL_FUNCTION_ID) {
        console.warn("Email function ID not configured, skipping notification");
        return { success: false, error: "Email function not configured" };
      }

      const payload = {
        type,
        userEmail,
        userName,
        userId: additionalData.userId || "",
        ...additionalData,
      };

      const response = await functions.createExecution(
        EMAIL_FUNCTION_ID,
        JSON.stringify(payload)
      );

      // console.log("Email function execution response:", response);

      // Check if execution was successful
      if (response.status !== "completed") {
        console.error("Email function execution failed:", response);
        throw new Error(
          `Email function execution failed with status: ${response.status}`
        );
      }

      // Check for function errors
      if (response.errors && response.errors.trim()) {
        console.error("Email function errors:", response.errors);
        throw new Error(`Email function error: ${response.errors}`);
      }

      // Check if response.responseBody exists and is not empty
      if (!response.responseBody || response.responseBody.trim() === "") {
        throw new Error("Email function returned empty response");
      }

      let result;
      try {
        result = JSON.parse(response.responseBody);
      } catch (parseError) {
        console.error("Failed to parse email response:", response.responseBody);
        throw new Error("Invalid response format from email function");
      }

      if (result.success) {
        return { success: true, messageId: result.messageId };
      } else {
        throw new Error(result.error || "Email function execution failed");
      }
    } catch (error) {
      console.error(`Failed to send ${type} notification:`, error);
      return { success: false, error: error.message };
    }
  }

  async sendIdeaAddedNotification(userEmail, userName, ideaTitle, userId) {
    return this.sendNotification("ideaAdded", userEmail, userName, {
      ideaTitle,
      userId,
    });
  }
  async sendIdeaExpandedNotification(userEmail, userName, ideaTitle, userId) {
    return this.sendNotification("ideaExpanded", userEmail, userName, {
      ideaTitle,
      userId,
    });
  }

  async sendWeeklySummary(userEmail, userName, ideaCount, expandedCount) {
    return await this.sendNotification("weeklySummary", userEmail, userName, {
      ideaCount,
      expandedCount,
    });
  }
}

export const emailService = new EmailService();
