// ESM wrapper that works as entry point for SEA
// This file is copied to dist/index.mjs and loaded as the main entry point
// It imports the compiled index.js which is in the same directory
import("./index.js").catch(err => {
  console.error("Failed to load module:", err.message);
  process.exit(1);
});
