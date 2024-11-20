import fetch from "node-fetch";

const RENDER_URL = "https://quiz-app-backend-c1up.onrender.com/keepalive";

async function keepAlive() {
  try {
    const response = await fetch(RENDER_URL);
    const data = await response.json();
    console.log("Keep-alive ping successful:", data);
  } catch (error) {
    console.error("Keep-alive ping failed:", error);
  }
}

// Ping every 14 minutes (840000 ms)
setInterval(keepAlive, 840000);

// Initial ping
keepAlive();
