/**
 * Init Command
 * Professional project initialization with smart defaults
 */

const fs = require('fs/promises');
const { existsSync } = require('fs');
const path = require('path');
const { ChangelogError } = require('../utils/errors');
const generateCommand = require('./generate');

/**
 * Initialize project with changelog files
 * @param {Object} options - Command options
 * @param {string} options.input - Input markdown file
 * @param {string} options.output - Output HTML file  
 * @param {boolean} options.force - Overwrite existing files
 */
async function initCommand(options) {
  console.log('🎯 Initializing changelog-pro for your project...');

  const changelogFile = options.input || 'CHANGELOG.md';
  const outputFile = options.output || 'changelog.html';

  try {
    // Get project info from package.json if it exists
    const projectInfo = await getProjectInfo();
    
    // Check if CHANGELOG.md already exists
    if (existsSync(changelogFile) && !options.force) {
      console.log(`⚠️  ${changelogFile} already exists.`);
      console.log('💡 Use --force to overwrite, or try:');
      console.log(`   changelog-pro generate`);
      return;
    }

    // Create sample CHANGELOG.md with smart defaults
    const sampleChangelog = generateSampleChangelog(projectInfo);
    await fs.writeFile(changelogFile, sampleChangelog, 'utf8');
    console.log(`✅ Created ${changelogFile}`);

    // Create output directory if needed
    const outputDir = path.dirname(outputFile);
    if (outputDir !== '.' && !existsSync(outputDir)) {
      await fs.mkdir(outputDir, { recursive: true });
      console.log(`📁 Created directory ${outputDir}`);
    }

    // Generate initial HTML
    console.log('🔄 Generating initial changelog...');
    await generateCommand({ input: changelogFile, output: outputFile });

    console.log('');
    console.log('🎉 Changelog Pro initialized successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log(`   1. Edit ${changelogFile} with your changes`);
    console.log(`   2. Run: changelog-pro`);
    console.log(`   3. Open: ${outputFile}`);
    console.log('');
    console.log('💡 Pro tip: Try "changelog-pro preview" for live development!');

  } catch (error) {
    throw new ChangelogError(`Initialization failed: ${error.message}`, 'INIT_ERROR', error);
  }
}

/**
 * Generate sample changelog content with smart defaults
 */
function generateSampleChangelog(projectInfo) {
  const projectName = projectInfo.name || 'My Project';
  const version = projectInfo.version || '1.0.0';
  const today = new Date().toISOString().split('T')[0];

  return `# Changelog

All notable changes to ${projectName} will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [${version}] - ${today}

### Added
- Initial release with core functionality
- Professional changelog generation
- Beautiful HTML output with interactive features

### Changed
- Improved documentation and setup process

### Fixed
- Resolved initial configuration issues

## [Unreleased]

### Added
- Feature ideas and planned improvements

<!-- 
## Template for new releases:

## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed  
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security improvements
-->
`;
}

/**
 * Get project information from package.json
 */
async function getProjectInfo() {
  try {
    const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf8'));
    return {
      name: packageJson.name || '',
      version: packageJson.version || '1.0.0',
      description: packageJson.description || '',
      author: packageJson.author || ''
    };
  } catch (error) {
    return {
      name: path.basename(process.cwd()),
      version: '1.0.0',
      description: '',
      author: ''
    };
  }
}

module.exports = initCommand; 