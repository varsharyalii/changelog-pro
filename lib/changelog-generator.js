/**
 * Changelog Generator
 * Single Responsibility: High-level API for generating changelogs
 */
const ChangelogService = require("./changelog-service");

class ChangelogGenerator {
  constructor(options = {}) {
    this.service = new ChangelogService();
    this.options = {
      verbose: false,
      ...options,
    };
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
      return await this.service.generate(mergedOptions);
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
