import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import lingoCompiler from "lingo.dev/compiler";

export default defineConfig(() =>
  lingoCompiler.vite({
    sourceRoot: "src",
    sourceLocale: "en",
    targetLocales: ["es", "fr", "de", "ru"],
    models: {
      "en:es": "google:gemini-1.5-flash",
      "en:fr": "google:gemini-1.5-flash",
      "en:de": "google:gemini-1.5-flash",
      "en:ru": "google:gemini-1.5-flash",
    },
    includePattern: "**/*.{js,jsx}",
    excludePattern: "**/node_modules/**",
    skipEmptyTranslations: true,
    fallbackToSource: true,
    ignoreParseErrors: true,
  })({
    plugins: [react()],
    define: {
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
      "process.env.VITE_APPWRITE_FUNCTION_ID": JSON.stringify(
        process.env.VITE_APPWRITE_FUNCTION_ID
      ),
      "process.env.VITE_APPWRITE_EMAIL_FUNCTION_ID": JSON.stringify(
        process.env.VITE_APPWRITE_EMAIL_FUNCTION_ID
      ),
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
      "process.env.GROQ_API_KEY": JSON.stringify(process.env.GROQ_API_KEY),
      "process.env.GOOGLE_API_KEY": JSON.stringify(process.env.GOOGLE_API_KEY),
      "process.env.OPENROUTER_API_KEY": JSON.stringify(
        process.env.OPENROUTER_API_KEY
      ),
      "process.env.LINGODOTDEV_API_KEY": JSON.stringify(
        process.env.LINGODOTDEV_API_KEY
      ),
      "process.env.VITE_GOOGLE_API_KEY": JSON.stringify(
        process.env.VITE_GOOGLE_API_KEY
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
