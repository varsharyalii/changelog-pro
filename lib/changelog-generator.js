/**
 * Changelog Generator
 * Single Responsibility: High-level API for generating changelogs
 */
const MarkdownParser = require('./parsers/markdown-parser');
const { HtmlRenderer } = require('./html-renderer');
const { FileHandler } = require('./file-handler');

class ChangelogGenerator {
  constructor(options = {}) {
    this.options = {
      verbose: false,
      ...options,
    };
    this.parser = new MarkdownParser();
    this.renderer = new HtmlRenderer();
    this.fileHandler = new FileHandler();
  }

  /**
   * Generate changelog from options
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generation result
   */
  async generate(options = {}) {
    const mergedOptions = { ...this.options, ...options };
    
    if (mergedOptions.verbose) {
      this._log("Initializing changelog generation...");
    }

    try {
      // Read markdown content
      const content = await this.fileHandler.readChangelog(mergedOptions.input);
      
      // Parse releases
      const releases = await this.parser.parse(content);
      
      if (mergedOptions.verbose) {
        this._log(`Parsed ${releases.length} releases`);
      }

      // Generate HTML
      const html = await this.renderer.render(releases, mergedOptions.template, {
        installCommand: mergedOptions.installCommand,
        title: mergedOptions.title,
        description: mergedOptions.description,
        author: mergedOptions.author,
      });

      // Write HTML file
      await this.fileHandler.writeHtml(html, mergedOptions.output);

      return {
        success: true,
        releases,
        html,
        stats: {
          totalReleases: releases.length,
          sourceFile: mergedOptions.input,
          outputFile: mergedOptions.output,
        }
      };
    } catch (error) {
      if (mergedOptions.verbose) {
        this._error(`Generation failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Start preview server
   * @param {Object} options - Server options
   * @returns {Promise<Object>} Server instance
   */
  async serve(options = {}) {
    const mergedOptions = { ...this.options, ...options };
    return await this.service.serve(mergedOptions);
  }

  /**
   * Initialize project
   * @param {Object} options - Initialization options
   * @returns {Promise<boolean>} Success status
   */
  async init(options = {}) {
    const mergedOptions = { ...this.options, ...options };
    return await this.service.init(mergedOptions);
  }

  /**
   * Log message (can be replaced with proper logger)
   * @private
   */
  _log(message) {
    console.log(`[ChangelogGenerator] ${message}`);
  }

  /**
   * Log error (can be replaced with proper logger)
   * @private
   */
  _error(message) {
    console.error(`[ChangelogGenerator] ERROR: ${message}`);
  }
}

module.exports = ChangelogGenerator;
