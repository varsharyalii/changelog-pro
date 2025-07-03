/**
 * Stats Command
 * Handles the 'stats' command for showing changelog statistics
 */
const ChangelogGenerator = require("../../..");

/**
 * Execute stats command
 * @param {Object} options - Command options from Commander
 */
async function statsCommand(options) {
  const generator = new ChangelogGenerator({ verbose: true });

  try {
    console.log("📊 Analyzing changelog...");
    
    const result = await generator.generate({
      input: options.input,
      dryRun: true, // Don't generate HTML, just parse and analyze
    });

    if (result.success) {
      const { stats, releases } = result;
      
      // Count sections across all releases
      const sectionCounts = {};
      for (const release of releases) {
        for (const [section, items] of Object.entries(release.sections)) {
          sectionCounts[section] = (sectionCounts[section] || 0) + items.length;
        }
      }

      console.log("\n📈 Changelog Statistics");
      console.log("-------------------");
      console.log(`Total Releases: ${stats.totalReleases}`);
      console.log(`Latest Version: ${releases[0]?.version || "none"}`);
      console.log(`First Version: ${releases[releases.length - 1]?.version || "none"}`);
      
      console.log("\n📝 Section Counts");
      console.log("-------------------");
      for (const [section, count] of Object.entries(sectionCounts)) {
        console.log(`${section}: ${count} entries`);
      }
    }
  } catch (error) {
    console.error("❌ Failed to analyze changelog:", error.message);
    process.exit(1);
  }
}

module.exports = statsCommand;
