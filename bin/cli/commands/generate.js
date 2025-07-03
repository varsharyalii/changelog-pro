/**
 * Generate Command
 * Handles the 'generate' command for creating HTML changelogs
 */
const { ChangelogGenerator } = require("../../..");

/**
 * Execute generate command
 * @param {Object} options - Command options from Commander
 */
async function generateCommand(options) {
  const generator = new ChangelogGenerator({ verbose: options.verbose });

  try {
    const result = await generator.generate({
      input: options.input,
      output: options.output,
      installCommand: options.installCommand,
    });

    if (result.success) {
      const { stats } = result;
      console.log(`✨ Generated changelog with ${stats.totalReleases} releases`);
      console.log(`📝 Source: ${stats.sourceFile}`);
      console.log(`📄 Output: ${stats.outputFile}`);
      console.log(`⚡️ Time: ${stats.duration}ms`);
    }
  } catch (error) {
    console.error("❌ Failed to generate changelog:", error.message);
    process.exit(1);
  }
}

module.exports = generateCommand;
