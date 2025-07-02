/**
 * Generate Command
 * Professional command module for changelog generation
 */

const { ChangelogService } = require('../../../lib/changelog-service');
const { createSpinner } = require('../utils/spinner');
const { ChangelogError } = require('../utils/errors');

/**
 * Generate HTML from markdown changelog
 * @param {Object} options - Command options
 * @param {string} options.input - Input markdown file
 * @param {string} options.output - Output HTML file
 * @param {boolean} options.init - Create default files if missing
 * @param {boolean} options.verbose - Show detailed output
 */
async function generateCommand(options) {
  const spinner = createSpinner('Generating changelog...');
  
  try {
    spinner.start();

    const service = new ChangelogService({
      config: {
        changelogFile: options.input,
        htmlFile: options.output
      }
    });
    
    // Validate configuration
    const validationErrors = service.validateConfiguration();
    if (validationErrors.length > 0) {
      spinner.fail('Configuration validation failed');
      
      console.error('❌ Issues found:');
      validationErrors.forEach(error => console.error(`  - ${error}`));
      
      if (options.init) {
        const { initializeFiles } = require('../utils/file-init');
        await initializeFiles({
          changelogFile: options.input,
          htmlFile: options.output
        });
        console.log('📁 Created default files. Please run the command again.');
        return;
      }
      
      console.error('\n💡 Tip: Use --init to create default files');
      throw new ChangelogError('Configuration validation failed', 'VALIDATION_ERROR');
    }

    const result = await service.processChangelog();
    
    if (result.success) {
      spinner.succeed('Changelog generated successfully!');
      
      console.log('📊 Statistics:');
      console.log(`   Total releases: ${result.stats.totalReleases}`);
      console.log(`   Source: ${result.stats.changelogFile}`);
      console.log(`   Output: ${result.stats.htmlFile}`);
    } else {
      spinner.fail('Generation failed');
      throw new ChangelogError(result.message, 'GENERATION_ERROR');
    }
    
  } catch (error) {
    if (spinner.isSpinning) {
      spinner.fail('Generation failed');
    }
    
    if (error instanceof ChangelogError) {
      throw error; // Re-throw for CLI to handle
    }
    
    // Wrap unexpected errors
    throw new ChangelogError(
      `Unexpected error: ${error.message}`,
      'UNEXPECTED_ERROR',
      error
    );
  }
}

module.exports = generateCommand; 