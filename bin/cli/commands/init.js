/**
 * Init Command
 * Handles the 'init' command for project initialization
 */
const ChangelogGenerator = require("../../..");

/**
 * Execute init command
 * @param {Object} options - Command options from Commander
 */
async function initCommand(options) {
  const generator = new ChangelogGenerator({ verbose: true });

  try {
    console.log("🚀 Initializing changelog project...");
    
    const success = await generator.init({
      input: options.input,
      output: options.output,
      force: options.force,
    });

    if (success) {
      console.log("✨ Project initialized successfully!");
      console.log(`📝 Created ${options.input}`);
      console.log(`📄 Created ${options.output}`);
      console.log("\n💡 Next steps:");
      console.log("  1. Edit your changelog in", options.input);
      console.log("  2. Run 'changelog-pro generate' to create HTML");
      console.log("  3. Run 'changelog-pro preview' to see live updates");
    }
  } catch (error) {
    console.error("❌ Failed to initialize project:", error.message);
    process.exit(1);
  }
}

module.exports = initCommand;
