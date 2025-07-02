const { ReleaseParser } = require('./release-parser');
const { DescriptionFormatter } = require('./description-formatter');
const { TagGenerator } = require('./tag-generator');
const { HtmlRenderer } = require('./html-renderer');
const { FileHandler } = require('./file-handler');
const HtmlFormatter = require('./formatters/html-formatter');
const fs = require('fs');
const path = require('path');

/**
 * Changelog Service
 * Single Responsibility: Orchestrate changelog processing pipeline
 */
class ChangelogService {
  constructor(options = {}) {
    // Dependency injection for testability
    this.parser = options.parser || new ReleaseParser();
    this.descriptionFormatter = options.descriptionFormatter || new DescriptionFormatter();
    this.tagGenerator = options.tagGenerator || new TagGenerator();
    this.htmlRenderer = options.htmlRenderer || new HtmlRenderer();
    this.fileHandler = options.fileHandler || new FileHandler();
    
    // Configuration
    this.config = {
      changelogFile: 'CHANGELOG.md',
      htmlFile: 'public/changelog.html',
      template: 'professional', // Default to new template
      ...options.config
    };
  }

  /**
   * Process changelog and update HTML
   * @returns {Promise<{success: boolean, message: string, stats: Object}>}
   */
  async processChangelog() {
    try {
      console.log('🔄 Processing changelog...');

      // Check if we should use the new template system
      if (this.shouldUseNewTemplate()) {
        return await this.processWithNewTemplate();
      }

      // Step 1: Read files
      const [markdown, htmlTemplate] = await Promise.all([
        this.fileHandler.readChangelog(this.config.changelogFile),
        this.fileHandler.readHtmlTemplate(this.config.htmlFile)
      ]);

      // Step 2: Parse changelog
      const releases = this.parser.parse(markdown);
      console.log(`📋 Found ${releases.length} releases`);

      // Step 3: Render HTML
      const newHtml = this.htmlRenderer.render(releases, htmlTemplate, {
        tag: this.tagGenerator,
        description: this.descriptionFormatter
      });

      // Step 4: Write output
      await this.fileHandler.writeHtml(newHtml, this.config.htmlFile);

      console.log('✅ Changelog processed successfully!');
      console.log(`📝 Generated ${releases.length} release entries`);

      return {
        success: true,
        message: 'Changelog processed successfully',
        stats: {
          totalReleases: releases.length,
          changelogFile: this.config.changelogFile,
          htmlFile: this.config.htmlFile
        }
      };

    } catch (error) {
      console.error('❌ Failed to process changelog:', error.message);
      
      return {
        success: false,
        message: error.message,
        stats: null
      };
    }
  }

  /**
   * Process with new template system
   * @private
   */
  async processWithNewTemplate() {
    // Read and parse the changelog
    const markdown = fs.readFileSync(this.config.changelogFile, 'utf8');
    const releases = this.parser.parse(markdown);
    console.log(`📋 Found ${releases.length} releases`);

    // Convert to format expected by HtmlFormatter
    const convertedReleases = this.convertReleasesFormat(releases);

    // Get package info for better output
    const packageInfo = this.getPackageInfo();

    // Format as HTML using new template
    const formatter = new HtmlFormatter({
      template: this.config.template || 'professional',
      title: packageInfo.name || 'Changelog',
      author: packageInfo.author || '',
      packageName: packageInfo.name || ''
    });
    
    const html = formatter.format(convertedReleases);

    // Write output file
    fs.writeFileSync(this.config.htmlFile, html);

    console.log('✅ Changelog processed successfully!');
    console.log(`📝 Generated ${releases.length} release entries`);

    return {
      success: true,
      message: 'Changelog processed successfully',
      stats: {
        totalReleases: releases.length,
        changelogFile: this.config.changelogFile,
        htmlFile: this.config.htmlFile
      }
    };
  }

  /**
   * Convert release format for new template
   * @private
   */
  convertReleasesFormat(releases) {
    return releases.map(release => {
      const converted = {
        version: release.version,
        date: release.date,
        title: release.title
      };

      // Convert sections to the expected format
      Object.keys(release.sections).forEach(sectionName => {
        const items = release.sections[sectionName].map(item => item.text);
        
        // Map section names to standard format
        switch (sectionName) {
          case 'features':
            converted.added = items;
            break;
          case 'fixes':
            converted.fixed = items;
            break;
          case 'breaking':
            converted.removed = items;
            break;
          case 'security':
            converted.security = items;
            break;
          case 'improvements':
            converted.changed = items;
            break;
          default:
            // Handle custom sections or map to closest match
            if (sectionName.includes('add')) {
              converted.added = (converted.added || []).concat(items);
            } else if (sectionName.includes('fix')) {
              converted.fixed = (converted.fixed || []).concat(items);
            } else if (sectionName.includes('change') || sectionName.includes('update')) {
              converted.changed = (converted.changed || []).concat(items);
            } else {
              // Default to changed for unknown sections
              converted.changed = (converted.changed || []).concat(items);
            }
        }
      });

      return converted;
    });
  }

  /**
   * Get package information
   * @private
   */
  getPackageInfo() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      return {
        name: packageJson.name || '',
        author: packageJson.author || '',
        version: packageJson.version || ''
      };
    } catch (error) {
      return { name: '', author: '', version: '' };
    }
  }

  /**
   * Check if we should use the new template system
   * @private
   */
  shouldUseNewTemplate() {
    // Use new template if:
    // 1. Template is explicitly set to 'professional'
    // 2. Output file ends with .html (not updating existing file)
    // 3. No existing HTML file to update
    return this.config.template === 'professional' || 
           this.config.htmlFile.endsWith('.html') ||
           !fs.existsSync(this.config.htmlFile);
  }

  /**
   * Validate configuration and dependencies
   * @returns {Array<string>} Array of validation errors (empty if valid)
   */
  validateConfiguration() {
    const errors = [];

    // Check required files exist
    if (!this.fileHandler.fileExists(this.config.changelogFile)) {
      errors.push(`Changelog file not found: ${this.config.changelogFile}`);
    }

    // For new template system, we don't need existing HTML file
    if (!this.shouldUseNewTemplate() && !this.fileHandler.fileExists(this.config.htmlFile)) {
      errors.push(`HTML template not found: ${this.config.htmlFile}`);
    }

    // Validate dependencies
    const requiredDependencies = [
      'parser', 'descriptionFormatter', 'tagGenerator', 'htmlRenderer', 'fileHandler'
    ];

    for (const dep of requiredDependencies) {
      if (!this[dep]) {
        errors.push(`Missing dependency: ${dep}`);
      }
    }

    return errors;
  }

  /**
   * Get release statistics
   * @returns {Promise<Object>} Release statistics
   */
  async getStatistics() {
    try {
      const markdown = await this.fileHandler.readChangelog(this.config.changelogFile);
      const releases = this.parser.parse(markdown);

      const stats = {
        totalReleases: releases.length,
        sectionCounts: {},
        latestVersion: releases[0]?.version || 'unknown',
        oldestVersion: releases[releases.length - 1]?.version || 'unknown'
      };

      // Count sections across all releases
      for (const release of releases) {
        for (const [sectionType, items] of Object.entries(release.sections)) {
          stats.sectionCounts[sectionType] = (stats.sectionCounts[sectionType] || 0) + items.length;
        }
      }

      return stats;
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }
}

module.exports = { ChangelogService };