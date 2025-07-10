import { functions } from "../appwrite";

export async function expandIdea(title, description, category, priority) {
  try {
    const response = await functions.createExecution(
      "ai-expansion",
      JSON.stringify({
        title,
        description,
        category,
        priority,
      })
    );

    const result = JSON.parse(response.response);

    if (result.success) {
      return {
        success: true,
        expansion: result.expansion,
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Expansion error:", error);
    return {
      success: false,
      error: error.message || "Expansion failed",
    };
  }
}
