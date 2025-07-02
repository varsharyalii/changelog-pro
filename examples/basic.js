#!/usr/bin/env node

/**
 * Basic Usage Example for Changelog Pro
 * 
 * This example demonstrates the simplest way to use changelog-pro
 * programmatically to generate HTML from a markdown changelog.
 */

const { generate, getStats } = require('../index');

async function basicExample() {
  console.log('🔄 Running Changelog Pro - Basic Example\n');

  try {
    // Example 1: Generate HTML with default settings
    console.log('📝 Generating changelog with default settings...');
    
    const result = await generate({
      config: {
        changelogFile: 'CHANGELOG.md',
        htmlFile: 'changelog.html'
      }
    });

    if (result.success) {
      console.log('✅ Success!');
      console.log(`   Generated ${result.stats.totalReleases} releases`);
      console.log(`   Source: ${result.stats.changelogFile}`);
      console.log(`   Output: ${result.stats.htmlFile}\n`);
    } else {
      console.log('❌ Generation failed:', result.message);
      return;
    }

    // Example 2: Get statistics
    console.log('📊 Getting changelog statistics...');
    
    const stats = await getStats({
      config: { changelogFile: 'CHANGELOG.md' }
    });

    console.log('✅ Statistics:');
    console.log(`   Total releases: ${stats.totalReleases}`);
    console.log(`   Latest version: ${stats.latestVersion}`);
    console.log(`   Oldest version: ${stats.oldestVersion}`);
    console.log('   Section counts:');
    
    for (const [section, count] of Object.entries(stats.sectionCounts)) {
      console.log(`     ${section}: ${count}`);
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
    console.error('\n💡 Tips:');
    console.error('  - Make sure CHANGELOG.md exists');
    console.error('  - Check file permissions');
    console.error('  - Verify markdown format is correct');
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  basicExample();
}

module.exports = basicExample; 