#!/usr/bin/env node

/**
 * Advanced Usage Example for Changelog Pro
 * 
 * This example demonstrates advanced features including:
 * - Custom configuration
 * - Dependency injection
 * - Error handling
 * - Validation
 */

const { 
  ChangelogService, 
  ReleaseParser,
  HtmlRenderer,
  TagGenerator,
  DescriptionFormatter,
  FileHandler 
} = require('../index');

async function advancedExample() {
  console.log('🔄 Running Changelog Pro - Advanced Example\n');

  try {
    // Example 1: Custom configuration
    console.log('⚙️  Setting up custom configuration...');
    
    const customConfig = {
      changelogFile: 'CHANGES.md',
      htmlFile: 'docs/releases.html',
      templateFile: 'templates/custom.html'
    };

    // Example 2: Dependency injection for testing/customization
    console.log('🔧 Setting up custom components...');
    
    const customComponents = {
      parser: new ReleaseParser(),
      htmlRenderer: new HtmlRenderer(),
      tagGenerator: new TagGenerator(),
      descriptionFormatter: new DescriptionFormatter(),
      fileHandler: new FileHandler()
    };

    // Example 3: Create service with custom configuration
    const service = new ChangelogService({
      config: customConfig,
      ...customComponents
    });

    // Example 4: Validate configuration before processing
    console.log('✅ Validating configuration...');
    
    const validationErrors = service.validateConfiguration();
    
    if (validationErrors.length > 0) {
      console.log('⚠️  Configuration issues found:');
      validationErrors.forEach(error => console.log(`   - ${error}`));
      
      // Create missing files for demo
      console.log('\n📁 Creating demo files...');
      await createDemoFiles(customConfig);
    }

    // Example 5: Process changelog with error handling
    console.log('🔄 Processing changelog...');
    
    const result = await service.processChangelog();
    
    if (result.success) {
      console.log('✅ Advanced processing completed!');
      console.log(`📊 Results:`);
      console.log(`   Total releases: ${result.stats.totalReleases}`);
      console.log(`   Source file: ${result.stats.changelogFile}`);
      console.log(`   Output file: ${result.stats.htmlFile}`);
    } else {
      console.log('❌ Processing failed:', result.message);
    }

    // Example 6: Get detailed statistics
    console.log('\n📈 Getting detailed statistics...');
    
    const stats = await service.getStatistics();
    
    console.log('📊 Detailed Statistics:');
    console.log(`   Total releases: ${stats.totalReleases}`);
    console.log(`   Version range: ${stats.oldestVersion} → ${stats.latestVersion}`);
    console.log('   Content breakdown:');
    
    Object.entries(stats.sectionCounts).forEach(([section, count]) => {
      console.log(`     ${section.padEnd(12)} ${count.toString().padStart(3)} items`);
    });

  } catch (error) {
    console.error('💥 Advanced example failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Create demo files for the advanced example
 */
async function createDemoFiles(config) {
  const fs = require('fs');
  const path = require('path');

  // Create sample CHANGES.md with advanced features
  const advancedChangelog = `# Project Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [2.1.0] - 2024-01-15

### Added
- [new] Advanced template system with theme support
- [new] Real-time preview functionality
- [new] Plugin architecture for extensibility
- [beta] Experimental AI-powered changelog generation

### Changed
- [improvement] Enhanced performance by 40% through caching
- [improvement] Better error messages with actionable suggestions
- [improvement] Streamlined API with backward compatibility

### Fixed
- [bugfix] Fixed memory leak in large changelog processing
- [bugfix] Resolved template parsing edge cases
- [bugfix] Fixed CLI argument parsing for special characters

### Breaking Changes
- [breaking] API restructure for v2.0 - see migration guide
- [breaking] Removed deprecated legacy-mode option

### Security
- [bugfix] Fixed XSS vulnerability in HTML output
- [improvement] Enhanced input validation and sanitization

## [2.0.0] - 2024-01-01

### Added
- [new] Complete TypeScript rewrite
- [new] Professional HTML templates
- [new] Badge system for change categorization
- [lts] Long-term support version

### Changed
- [breaking] Complete API redesign
- [improvement] Modern ES6+ syntax throughout

### Deprecated
- [deprecated] Legacy v1.x API will be removed in v3.0

## [1.5.0] - 2023-12-15

### Added
- [new] CLI tool for command-line usage
- [new] Custom template support

### Fixed
- [bugfix] Various stability improvements
`;

  // Ensure directory exists
  const outputDir = path.dirname(config.htmlFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`   ✅ Created directory: ${outputDir}`);
  }

  // Write demo changelog
  fs.writeFileSync(config.changelogFile, advancedChangelog);
  console.log(`   ✅ Created demo changelog: ${config.changelogFile}`);
}

// Run example if this file is executed directly
if (require.main === module) {
  advancedExample();
}

module.exports = advancedExample; 