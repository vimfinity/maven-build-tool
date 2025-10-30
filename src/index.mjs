// ESM wrapper that works as entry point for SEA
import("./index.js").catch(err => {
  console.error("Failed to load module:", err.message);
  process.exit(1);
});
