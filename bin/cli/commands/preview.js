/**
 * Preview Command
 * Handles the 'preview' command for live preview server
 */
const ChangelogGenerator = require("../../..");

/**
 * Execute preview command
 * @param {Object} options - Command options from Commander
 */
async function previewCommand(options) {
  const generator = new ChangelogGenerator({ verbose: true });

  try {
    console.log(`🚀 Starting preview server on port ${options.port}...`);
    
    const server = await generator.serve({
      input: options.input,
      port: parseInt(options.port, 10),
      installCommand: options.installCommand,
    });

    console.log(`✨ Preview server running at http://localhost:${options.port}`);
    console.log("📝 Watching for changes...");
    console.log("💡 Press Ctrl+C to stop");

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${options.port} is already in use`);
        console.log(`💡 Try a different port with --port option`);
      } else {
        console.error("❌ Server error:", error.message);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Failed to start preview server:", error.message);
    process.exit(1);
  }
}

module.exports = previewCommand;
