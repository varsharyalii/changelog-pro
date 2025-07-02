/**
 * Stats Command
 * Professional changelog statistics display
 */

const { ChangelogService } = require('../../../lib/changelog-service');
const { ChangelogError } = require('../utils/errors');

/**
 * Show changelog statistics
 * @param {Object} options - Command options
 * @param {string} options.input - Input markdown file
 */
async function statsCommand(options) {
  try {
    const service = new ChangelogService({
      config: {
        changelogFile: options.input || 'CHANGELOG.md'
      }
    });

    const stats = await service.getStatistics();

    console.log('📊 Changelog Statistics:');
    console.log(`   Total releases: ${stats.totalReleases}`);
    console.log(`   Latest version: ${stats.latestVersion || 'N/A'}`);
    console.log(`   Oldest version: ${stats.oldestVersion || 'N/A'}`);
    
    if (stats.sectionCounts && Object.keys(stats.sectionCounts).length > 0) {
      console.log('   Section counts:');
      for (const [section, count] of Object.entries(stats.sectionCounts)) {
        console.log(`     ${section}: ${count}`);
      }
    } else {
      console.log('   No section data available');
    }
    
  } catch (error) {
    throw new ChangelogError(`Failed to get statistics: ${error.message}`, 'STATS_ERROR', error);
  }
}

module.exports = statsCommand; 