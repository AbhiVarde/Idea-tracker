export async function expandIdea(title, description, category, priority) {
  try {
    const prompt = `You're a product strategist and technical architect.

Analyze this idea and respond strictly in the following format:

## Summary
[Short 2–3 sentence overview]

## Tech Stack
- Tool 1
- Tool 2

## MVP Features
- Feature 1
- Feature 2

## Roadmap
1. Phase 1
2. Phase 2

## Monetization
- Strategy 1
- Strategy 2

Details:
Title: "${title}"
Description: ${description || "No description"}
Category: ${category}
Priority: ${priority}

Be clear, concise, and developer-focused.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();

    console.log("Gemini API Response:", JSON.stringify(data, null, 2));

    let generatedText = null;

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      generatedText = data.candidates[0].content.parts[0].text;
    } else if (data.candidates?.[0]?.output) {
      generatedText = data.candidates[0].output;
    } else if (data.text) {
      generatedText = data.text;
    } else if (data.candidates?.[0]) {
      const candidate = data.candidates[0];
      if (typeof candidate === "string") {
        generatedText = candidate;
      } else if (candidate.text) {
        generatedText = candidate.text;
      }
    }

    if (generatedText && generatedText.trim()) {
      return {
        success: true,
        expansion: generatedText.trim(),
      };
    } else {
      const finishReason = data.candidates?.[0]?.finishReason;
      if (finishReason) {
        throw new Error(`Content generation stopped due to: ${finishReason}`);
      }

      throw new Error(
        "No content generated - the API returned an empty response"
      );
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      success: false,
      error: error.message || "Expansion failed",
    };
  }
}
