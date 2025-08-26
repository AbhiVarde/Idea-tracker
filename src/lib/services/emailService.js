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

      if (response.status !== "completed") {
        console.error("Email function execution failed:", response);
        throw new Error(
          `Email function execution failed with status: ${response.status}`
        );
      }

      if (response.errors && response.errors.trim()) {
        console.error("Email function errors:", response.errors);
        throw new Error(`Email function error: ${response.errors}`);
      }

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

  async sendBatchIdeaNotification(
    userEmail,
    userName,
    ideaTitles,
    remainingCount,
    userId
  ) {
    return this.sendNotification("batchIdeaAdded", userEmail, userName, {
      ideaTitles,
      remainingCount,
      userId,
    });
  }

  // Helper to get week start date (Monday)
  getWeekStartDate() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  // Filter ideas from this week only
  getThisWeekIdeas(ideas) {
    const weekStart = this.getWeekStartDate();
    return ideas.filter((idea) => new Date(idea.$createdAt) >= weekStart);
  }

  async sendWeeklySummary(userEmail, userName, userId, allIdeas = []) {
    // Filter to only this week's ideas
    const thisWeekIdeas = this.getThisWeekIdeas(allIdeas);

    const ideaCount = thisWeekIdeas.length;
    const expandedCount = thisWeekIdeas.filter(
      (idea) =>
        idea.expandedAt && new Date(idea.expandedAt) >= this.getWeekStartDate()
    ).length;

    return await this.sendNotification("weeklySummary", userEmail, userName, {
      ideaCount,
      expandedCount,
      userId,
    });
  }
}

export const emailService = new EmailService();
