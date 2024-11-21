// Get the API URL from environment variables, fallback to development URL if not set
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5003";

// Log the API URL being used (helpful for debugging)
console.log("API URL:", API_URL);
