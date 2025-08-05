import { functions } from "../appwrite";

const AI_EXPANSION_FUNCTION_ID = import.meta.env.VITE_APPWRITE_FUNCTION_ID;

export async function expandIdea(title, description, category, priority) {
  try {
    const { account } = await import("../appwrite");
    try {
      const user = await account.get();
    } catch (authError) {
      console.error("User not authenticated:", authError);
      throw new Error("Please log in to use AI expansion");
    }

    const response = await functions.createExecution(
      AI_EXPANSION_FUNCTION_ID,
      JSON.stringify({
        title,
        description,
        category,
        priority,
      })
    );

    // Check if execution was successful
    if (response.status !== "completed") {
      console.error("Function execution failed:", response);
      throw new Error(
        `Function execution failed with status: ${response.status}`
      );
    }

    // Check for function errors
    if (response.errors && response.errors.trim()) {
      console.error("Function errors:", response.errors);
      throw new Error(`Function error: ${response.errors}`);
    }

    // Check if response.responseBody exists and is not empty
    if (!response.responseBody || response.responseBody.trim() === "") {
      throw new Error("Function returned empty response");
    }

    // Check if the response is the default Appwrite response
    if (response.responseBody.includes("Build like a team of hundreds")) {
      throw new Error("Function returned default response - check deployment");
    }

    let result;
    try {
      result = JSON.parse(response.responseBody);
    } catch (parseError) {
      console.error("Failed to parse response:", response.responseBody);
      throw new Error("Invalid response format from function");
    }

    if (result.success) {
      return {
        success: true,
        expansion: result.expansion,
      };
    } else {
      throw new Error(result.error || "Function execution failed");
    }
  } catch (error) {
    console.error("Expansion error:", error);
    return {
      success: false,
      error: error.message || "Expansion failed",
    };
  }
}
