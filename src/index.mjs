// ESM wrapper that works as entry point for SEA
// This file is copied to dist/index.mjs and loaded as the main entry point
// Use import.meta.url to get absolute path for resolving index.js
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const indexPath = join(__dirname, 'index.js');

import(indexPath).catch(err => {
  console.error("Failed to load module:", err.message);
  process.exit(1);
});
