import React from "react";
import { render } from "ink";
import { parseArgs } from "node:util";
import { StartView } from "./ui/StartView.js";

const { values } = parseArgs({
  options: {
    version: { type: "boolean", short: "v" },
    help: { type: "boolean", short: "h" },
    headless: { type: "boolean" },
  },
  allowPositionals: true,
});

// --version flag
if (values.version) {
  console.log("Maven CLI v0.1.0");
  process.exit(0);
}

// --help flag
if (values.help) {
  console.log(`Maven CLI v0.1.0

Usage:
  maven-cli [options]

Options:
  -v, --version    Show version
  -h, --help       Show this help
  --headless       Run in headless mode (for CI/testing)`);
  process.exit(0);
}

// --headless flag (for CI) - headless mode ONLY shows text, no interactive UI
if (values.headless) {
  console.log("Maven CLI ready (headless mode - no UI available in SEA)");
  process.exit(0);
}

// Interactive UI (only in development with pnpm run dev, not in SEA)
if (process.env.NODE_ENV === "development" || process.argv[1]?.includes("tsx")) {
  render(<StartView />);
} else {
  // In SEA, show help instead of trying to render UI
  console.log(`Maven CLI v0.1.0
Use --help for usage information`);
  process.exit(0);
}
