/**
 * Generate Command
 * Handles the 'generate' command for creating HTML changelogs
 */
const { ChangelogGenerator } = require("../../..");
const path = require('path');
const fs = require('fs').promises;

/**
 * Load config from changelog-pro.config.js if exists
 */
async function loadConfig() {
  const configPath = path.join(process.cwd(), 'changelog-pro.config.js');
  
  try {
    const exists = await fs.access(configPath).then(() => true).catch(() => false);
    if (!exists) return {};
    
    return require(configPath);
  } catch (error) {
    // Config file is optional, return empty object if not found or invalid
    return {};
  }
}

/**
 * Execute generate command
 * @param {Object} options - Command options from Commander
 */
async function generateCommand(options) {
  // Load config file
  const config = await loadConfig();
  
  // Merge config with CLI options (CLI options take precedence)
  const mergedOptions = {
    ...config,
    ...options
  };

  const generator = new ChangelogGenerator({ verbose: mergedOptions.verbose });

  try {
    const result = await generator.generate(mergedOptions);

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
