const { ReleaseParser } = require("./release-parser");
const { DescriptionFormatter } = require("./description-formatter");
const { TagGenerator } = require("./tag-generator");
const { HtmlRenderer } = require("./html-renderer");
const { FileHandler } = require("./file-handler");
const HtmlFormatter = require("./formatters/html-formatter");
const fs = require("fs");
const MarkdownParser = require("./parsers/markdown-parser");
const ConfigLoader = require("./config-loader");

/**
 * Changelog Service
 * Single Responsibility: Orchestrate the complete changelog generation process
 */
class ChangelogService {
  constructor() {
    this.parser = new MarkdownParser();
    this.fileHandler = new FileHandler();
    this.renderer = new HtmlRenderer(this.fileHandler);
    this.configLoader = new ConfigLoader();
  }

  /**
   * Generate HTML changelog from markdown
   * @param {Object} options - Generation options
   * @param {string} options.input - Input markdown file path
   * @param {string} options.output - Output HTML file path
   * @param {string} options.template - Template name
   * @param {boolean} options.verbose - Enable verbose logging
   * @returns {Promise<Object>} Generation results
   */
  async generate(options = {}) {
    const startTime = Date.now();
    const config = this.configLoader.load(options);

    if (config.verbose) {
      this._log("Starting changelog generation...");
    }

    try {
      // Read and parse markdown
      const markdownContent = await this.fileHandler.readChangelog(config.input);
      const releases = await this.parser.parse(markdownContent);

      if (config.verbose) {
        this._log(`Parsed ${releases.length} releases from ${config.input}`);
      }

      // Generate HTML
      const htmlContent = await this.renderer.render(releases, config.template, {
        installCommand: config.installCommand,
        title: config.title,
        description: config.description,
        author: config.author,
      });

      // Write HTML file
      await this.fileHandler.writeHtml(config.output, htmlContent);

      const duration = Date.now() - startTime;
      const stats = {
        totalReleases: releases.length,
        sourceFile: config.input,
        outputFile: config.output,
        duration,
      };

      if (config.verbose) {
        this._log(`Generated ${config.output} successfully (${duration}ms)`);
      }

      return {
        success: true,
        stats,
        releases,
      };
    } catch (error) {
      if (config.verbose) {
        this._error(`Generation failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Start development server with watch mode
   * @param {Object} options - Server options
   * @param {number} options.port - Server port
   * @param {boolean} options.watch - Enable file watching
   * @param {boolean} options.verbose - Enable verbose logging
   * @returns {Promise<Object>} Server instance
   */
  async serve(options = {}) {
    const PreviewServer = require("./preview-server");
    const server = new PreviewServer(this);

    const config = this.configLoader.load(options);

    if (config.verbose) {
      this._log(`Starting preview server on port ${config.port}...`);
    }

    return await server.start(config);
  }

  /**
   * Initialize project with configuration
   * @param {Object} options - Initialization options
   * @returns {Promise<boolean>} Success status
   */
  async init(options = {}) {
    const config = this.configLoader.load(options);

    if (config.verbose) {
      this._log("Initializing changelog project...");
    }

    // Implementation for project initialization
    // This would create default config files, templates, etc.
    
    return true;
  }

  /**
   * Log message (can be replaced with proper logger)
   * @private
   */
  _log(message) {
    console.log(`[ChangelogService] ${message}`);
  }

  /**
   * Log error (can be replaced with proper logger)
   * @private
   */
  _error(message) {
    console.error(`[ChangelogService] ERROR: ${message}`);
  }
}

module.exports = ChangelogService;
