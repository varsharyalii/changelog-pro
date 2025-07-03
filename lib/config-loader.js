/**
 * Configuration loader for changelog-pro
 * Handles loading and merging config from various sources
 */
const path = require('path');
const fs = require('fs').promises;

class ConfigLoader {
  /**
   * Load configuration from multiple sources
   * @param {Object} cliOptions - Command line options
   * @returns {Promise<Object>} Merged configuration
   */
  async load(cliOptions = {}) {
    const defaults = {
      input: 'CHANGELOG.md',
      output: 'changelog.html',
      template: 'default',
      installCommand: null
    };

    // Try to load config file
    const fileConfig = await this._loadConfigFile();
    
    // Merge with precedence: CLI > File > Defaults
    return {
      ...defaults,
      ...fileConfig,
      ...cliOptions
    };
  }

  /**
   * Load config from changelog-pro.config.js if exists
   * @private
   */
  async _loadConfigFile() {
    const configPath = path.join(process.cwd(), 'changelog-pro.config.js');
    
    try {
      const exists = await fs.access(configPath).then(() => true).catch(() => false);
      if (!exists) return {};
      
      return require(configPath);
    } catch (error) {
      // Config file is optional, return empty object if not found or invalid
      return {};
    }
  }
}

module.exports = new ConfigLoader(); 