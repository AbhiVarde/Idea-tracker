import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import lingoCompiler from "lingo.dev/compiler";

export default defineConfig(() =>
  lingoCompiler.vite({
    sourceRoot: "src",
    sourceLocale: "en",
    targetLocales: ["es", "fr", "ru", "de", "ja", "zh"],
    models: {
      "en:es": "groq:llama3-8b-8192",
      "en:fr": "groq:llama3-8b-8192",
      "en:de": "groq:llama3-8b-8192",
      "en:ru": "groq:llama3-70b-8192", // Better for Cyrillic
      "en:ja": "groq:llama3-70b-8192", // Better for Japanese
      "en:zh": "groq:llama3-70b-8192", // Better for Chinese
    },
  })({
    plugins: [react()],
    define: {
      // Appwrite variables
      "process.env.VITE_APPWRITE_ENDPOINT": JSON.stringify(
        process.env.VITE_APPWRITE_ENDPOINT
      ),
      "process.env.VITE_APPWRITE_PROJECT_ID": JSON.stringify(
        process.env.VITE_APPWRITE_PROJECT_ID
      ),
      "process.env.VITE_APPWRITE_DATABASE_ID": JSON.stringify(
        process.env.VITE_APPWRITE_DATABASE_ID
      ),
      "process.env.VITE_APPWRITE_COLLECTION_ID": JSON.stringify(
        process.env.VITE_APPWRITE_COLLECTION_ID
      ),
      "process.env.VITE_APPWRITE_STORAGE_BUCKET_ID": JSON.stringify(
        process.env.VITE_APPWRITE_STORAGE_BUCKET_ID
      ),

      // OAuth variables
      "process.env.VITE_GOOGLE_CLIENT_ID": JSON.stringify(
        process.env.VITE_GOOGLE_CLIENT_ID
      ),
      "process.env.VITE_GOOGLE_CLIENT_SECRET": JSON.stringify(
        process.env.VITE_GOOGLE_CLIENT_SECRET
      ),
      "process.env.VITE_GITHUB_CLIENT_ID": JSON.stringify(
        process.env.VITE_GITHUB_CLIENT_ID
      ),
      "process.env.VITE_GITHUB_CLIENT_SECRET": JSON.stringify(
        process.env.VITE_GITHUB_CLIENT_SECRET
      ),
      "process.env.VITE_DISCORD_CLIENT_ID": JSON.stringify(
        process.env.VITE_DISCORD_CLIENT_ID
      ),
      "process.env.VITE_DISCORD_CLIENT_SECRET": JSON.stringify(
        process.env.VITE_DISCORD_CLIENT_SECRET
      ),

      // Translation API keys
      "process.env.GROQ_API_KEY": JSON.stringify(process.env.GROQ_API_KEY),
      "process.env.LINGODOTDEV_API_KEY": JSON.stringify(
        process.env.LINGODOTDEV_API_KEY
      ),
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: "build",
    },
  })
);
