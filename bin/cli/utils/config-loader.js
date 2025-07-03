/**
 * Configuration Loader
 * Single Responsibility: Load and merge configuration from multiple sources
 */

const fs = require("fs");
const path = require("path");

/**
 * Configuration loader with priority order:
 * 1. CLI options (highest priority)
 * 2. Configuration file
 * 3. Default values (lowest priority)
 */
class ConfigLoader {
  static CONFIG_FILES = [
    "changelog-pro.config.js",
    "changelog-pro.config.json",
    ".changelog-pro.js",
    ".changelog-pro.json",
  ];

  static DEFAULTS = {
    changelogFile: "CHANGELOG.md",
    htmlFile: "changelog.html",
    template: "default",
    installCommand: null, // No install command by default
  };

  /**
   * Load configuration from all sources
   * @param {Object} cliOptions - Options from CLI
   * @param {string} cwd - Current working directory
   * @returns {Object} Merged configuration
   */
  static load(cliOptions = {}, cwd = process.cwd()) {
    const fileConfig = this.loadFromFile(cwd);
    const mergedConfig = this.mergeConfigurations(
      this.DEFAULTS,
      fileConfig,
      cliOptions,
    );

    return this.validateConfiguration(mergedConfig);
  }

  /**
   * Load configuration from file
   * @private
   */
  static loadFromFile(cwd) {
    for (const configFile of this.CONFIG_FILES) {
      const configPath = path.join(cwd, configFile);

      if (fs.existsSync(configPath)) {
        try {
          if (configFile.endsWith(".js")) {
            // Clear require cache to allow hot reloading
            delete require.cache[require.resolve(configPath)];
            return require(configPath);
          } else {
            const content = fs.readFileSync(configPath, "utf8");
            return JSON.parse(content);
          }
        } catch (error) {
          console.warn(
            `⚠️  Failed to load config from ${configFile}: ${error.message}`,
          );
        }
      }
    }

    return {};
  }

  /**
   * Merge configurations with priority order
   * @private
   */
  static mergeConfigurations(...configs) {
    return configs.reduce((merged, config) => {
      if (!config || typeof config !== "object") return merged;

      return {
        ...merged,
        ...this.filterValidOptions(config),
      };
    }, {});
  }

  /**
   * Filter valid configuration options
   * @private
   */
  static filterValidOptions(config) {
    const validKeys = Object.keys(this.DEFAULTS);
    const filtered = {};

    for (const key of validKeys) {
      if (config[key] !== undefined) {
        filtered[key] = config[key];
      }
    }

    return filtered;
  }

  /**
   * Validate configuration values
   * @private
   */
  static validateConfiguration(config) {
    const validated = { ...config };

    // Validate installCommand format if provided
    if (
      validated.installCommand !== null &&
      validated.installCommand !== undefined
    ) {
      if (typeof validated.installCommand === "string") {
        // Single command - valid
      } else if (Array.isArray(validated.installCommand)) {
        // Array of commands - validate each one
        const validCommands = validated.installCommand.filter(
          (cmd) => typeof cmd === "string" && cmd.trim().length > 0,
        );
        if (validCommands.length === 0) {
          console.warn(
            "⚠️  installCommand array contains no valid strings, ignoring",
          );
          validated.installCommand = null;
        } else {
          validated.installCommand = validCommands;
        }
      } else if (typeof validated.installCommand === "object") {
        // Object with named commands - validate each value
        const validCommands = {};
        let hasValidCommands = false;

        for (const [key, value] of Object.entries(validated.installCommand)) {
          if (typeof value === "string" && value.trim().length > 0) {
            validCommands[key] = value;
            hasValidCommands = true;
          }
        }

        if (!hasValidCommands) {
          console.warn(
            "⚠️  installCommand object contains no valid string values, ignoring",
          );
          validated.installCommand = null;
        } else {
          validated.installCommand = validCommands;
        }
      } else {
        console.warn(
          "⚠️  installCommand must be a string, array, or object, ignoring invalid value",
        );
        validated.installCommand = null;
      }
    }

    // Validate template
    if (validated.template && typeof validated.template !== "string") {
      console.warn("⚠️  template must be a string, using default");
      validated.template = this.DEFAULTS.template;
    }

    return validated;
  }

  /**
   * Get example configuration content
   * @returns {string} Example configuration as string
   */
  static getExampleConfig() {
    return `module.exports = {
  // Input/Output files
  changelogFile: 'CHANGELOG.md',
  htmlFile: 'changelog.html',
  
  // Template to use
  template: 'default',
  
  // Install command for tooltips (use {version} placeholder)
  installCommand: 'npm install my-package@{version}'
  
  // Examples:
  // installCommand: 'pip install my-tool=={version}'
  // installCommand: 'cargo install my-crate --version {version}'
  // installCommand: 'gem install my-gem -v {version}'
};`;
  }
}

module.exports = { ConfigLoader };
