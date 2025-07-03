const ChangelogService = require("./lib/changelog-service");
const ChangelogGenerator = require("./lib/changelog-generator");
const { ReleaseParser } = require("./lib/release-parser");
const { DescriptionFormatter } = require("./lib/description-formatter");
const { TagGenerator } = require("./lib/tag-generator");
const { HtmlRenderer } = require("./lib/html-renderer");
const { FileHandler } = require("./lib/file-handler");
const { Tokenizer } = require("./lib/tokenizer");

/**
 * Changelog Pro - Professional changelog generator and processor
 *
 * Main entry point for programmatic usage
 */

// Main service class - primary API
const ChangelogPro = ChangelogService;

// Export everything for maximum flexibility
module.exports = {
  // Main API
  ChangelogPro,
  ChangelogService,
  ChangelogGenerator,

  // Core components
  ReleaseParser,
  DescriptionFormatter,
  TagGenerator,
  HtmlRenderer,
  FileHandler,
  Tokenizer,

  // Convenience function for quick usage
  async generate(options = {}) {
    const service = new ChangelogService(options);
    return await service.generate(options);
  },

  // Get statistics
  async getStats(options = {}) {
    const service = new ChangelogService(options);
    return await service.generate(options);
  },
};

// Also export as default for ES6 import compatibility
module.exports.default = module.exports;
