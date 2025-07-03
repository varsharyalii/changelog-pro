/**
 * HTML Renderer
 * Single Responsibility: Render release data into HTML templates
 */
const fs = require("fs").promises;
const { existsSync } = require("fs");
const path = require("path");
const cache = require('./utils/runtime-cache');

class HtmlRenderer {
  static MARKERS = {
    START: "<!-- START_RELEASES -->",
    END: "<!-- END_RELEASES -->",
  };

  constructor(fileHandler = null) {
    this.fileHandler = fileHandler;
  }

  /**
   * Render releases into HTML template
   * @param {Array} releases - Array of release objects
   * @param {string} templateName - Template name or full template content
   * @param {Object} options - Rendering options
   * @param {string} options.installCommand - Install command template with {version} placeholder
   * @returns {Promise<string>} Complete HTML content
   */
  async render(releases, templateName = "default", options = {}) {
    if (!releases || !Array.isArray(releases)) {
      throw new Error("Invalid releases data");
    }

    // Get template content
    let template;
    if (templateName.includes("<!DOCTYPE") || templateName.includes("<html")) {
      // Full template content provided (legacy support)
      template = templateName;
    } else {
      // Template name provided, load from cache or file
      template = await this._getTemplate(templateName);
    }

    const releaseHtml = releases
      .map((release, index) => this._renderSingleRelease(release, index, options))
      .join("\n\n");

    // Replace template variables
    template = await this._replaceTemplateVariables(template, options);

    return this._insertIntoTemplate(template, releaseHtml);
  }

  /**
   * Get template from cache or load from file
   * @private
   */
  async _getTemplate(templateName) {
    let template = cache.getTemplate(templateName);
    
    if (!template) {
      const templatePath = path.join(
        __dirname,
        "../templates",
        `${templateName}.html`,
      );

      if (!existsSync(templatePath)) {
        throw new Error(`Template not found: ${templateName}`);
      }

      template = await fs.readFile(templatePath, "utf8");
      cache.setTemplate(templateName, template);
    }
    
    return template;
  }

  /**
   * Replace template variables
   * @private
   */
  async _replaceTemplateVariables(template, options = {}) {
    const packageInfo = await this._getPackageInfo();

    return template
      .replace(
        /{{TITLE}}/g,
        options.title || packageInfo.name || "Changelog",
      )
      .replace(
        /{{DESCRIPTION}}/g,
        options.description ||
          `Changelog for ${packageInfo.name || "this project"}`,
      )
      .replace(
        /{{AUTHOR}}/g,
        options.author || packageInfo.author || "Development Team",
      );
  }

  /**
   * Get package.json information safely
   * @private
   */
  async _getPackageInfo() {
    if (this.fileHandler) {
      return await this.fileHandler.readPackageJson();
    }

    // Fallback for direct usage
    try {
      const content = await fs.readFile("./package.json", "utf8");
      return JSON.parse(content);
    } catch (error) {
      return {};
    }
  }

  /**
   * Generate install command(s) for a version
   * @private
   */
  _generateInstallCommand(version, options = {}) {
    // If installCommand is explicitly null or undefined, return null (no tooltip)
    if (
      options.installCommand === null ||
      options.installCommand === undefined
    ) {
      return null;
    }

    // Handle single string command
    if (typeof options.installCommand === "string") {
      return {
        type: "single",
        command: options.installCommand.replace("{version}", version),
      };
    }

    // Handle array of commands
    if (Array.isArray(options.installCommand)) {
      const commands = options.installCommand.map((cmd) =>
        cmd.replace("{version}", version),
      );

      // Check if all commands are literally identical
      const uniqueCommands = [...new Set(commands)];
      if (uniqueCommands.length === 1) {
        // All commands are identical - treat as single command
        return {
          type: "single",
          command: uniqueCommands[0],
        };
      }

      // Check if all commands are from the same package manager
      const packageManagers = commands.map((cmd) => this._getCommandLabel(cmd));
      const uniqueManagers = [...new Set(packageManagers)];

      if (uniqueManagers.length === 1) {
        // Same package manager but different commands - show descriptive labels
        return {
          type: "multiple-same",
          commands: commands,
        };
      } else {
        // Different package managers - show with package manager labels
        return {
          type: "multiple-different",
          commands: commands,
        };
      }
    }

    // Handle object with named commands
    if (typeof options.installCommand === "object") {
      const commands = {};
      for (const [key, value] of Object.entries(options.installCommand)) {
        commands[key] = value.replace("{version}", version);
      }
      return {
        type: "named",
        commands: commands,
      };
    }

    // This fallback should never be reached with proper configuration
    return null;
  }

  /**
   * Render a single release into HTML
   * @private
   */
  _renderSingleRelease(release, index, options = {}) {
    const formattedDate = this._formatDate(release.date);
    const installData = this._generateInstallCommand(release.version, options);

    // Add mt-20 spacing for all releases except the first one
    const marginClass = index > 0 ? " mt-20" : "";

    // Generate tooltip HTML based on install command type
    let tooltipHtml = "";
    if (installData) {
      if (installData.type === "single") {
        // Single command tooltip
        tooltipHtml = `
                  <div class="version-tooltip">
                    <span>${installData.command}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${installData.command}', this)">copy</button>
                  </div>`;
      } else if (installData.type === "multiple-same") {
        // Same package manager, different commands - show descriptive tabs ("install", "global", "dev")
        const commandTabs = installData.commands
          .map(
            (cmd, idx) =>
              `<div class="command-tab ${idx === 0 ? "active" : ""}" onclick="switchTab(this, '${cmd}')">${this._getShortLabel(cmd)}</div>`,
          )
          .join("");

        tooltipHtml = `
                  <div class="version-tooltip multi-command">
                    <div class="command-tabs">
                      ${commandTabs}
                    </div>
                    <div class="command-content">
                      <span class="active-command">${installData.commands[0]}</span>
                      <button class="copy-btn" onclick="copyActiveCommand(this)">copy</button>
                    </div>
                  </div>`;
      } else if (installData.type === "multiple-different") {
        // Different package managers - show package manager tabs ("npm", "pip", "yarn")
        const commandTabs = installData.commands
          .map(
            (cmd, idx) =>
              `<div class="command-tab ${idx === 0 ? "active" : ""}" onclick="switchTab(this, '${cmd}')">${this._getCommandLabel(cmd)}</div>`,
          )
          .join("");

        tooltipHtml = `
                  <div class="version-tooltip multi-command">
                    <div class="command-tabs">
                      ${commandTabs}
                    </div>
                    <div class="command-content">
                      <span class="active-command">${installData.commands[0]}</span>
                      <button class="copy-btn" onclick="copyActiveCommand(this)">copy</button>
                    </div>
                  </div>`;
      } else if (installData.type === "named") {
        // Named commands as labeled tabs
        const commandTabs = Object.entries(installData.commands)
          .map(
            ([name, cmd], idx) =>
              `<div class="command-tab ${idx === 0 ? "active" : ""}" onclick="switchTab(this, '${cmd}')">${name}</div>`,
          )
          .join("");

        const firstCommand = Object.values(installData.commands)[0];
        tooltipHtml = `
                  <div class="version-tooltip multi-command">
                    <div class="command-tabs">
                      ${commandTabs}
                    </div>
                    <div class="command-content">
                      <span class="active-command">${firstCommand}</span>
                      <button class="copy-btn" onclick="copyActiveCommand(this)">copy</button>
                    </div>
                  </div>`;
      }
    }

    return `      <li class="flex flex-col items-start${marginClass} md:flex-row">
        <h3 class="flex items-center w-full mb-3 space-x-3 md:w-1/3">
          <span class="z-10 hidden block w-5 h-5 bg-white border-4 border-gray-300 rounded-full md:block"></span>

          <div class="flex flex-col space-y-2">
            <div class="flex items-center space-x-2">
              <div class="version-tag">
                <span class="px-3 py-1 text-sm font-mono font-semibold text-white bg-gray-900 rounded-full ${installData ? "cursor-pointer hover:bg-gray-800 transition-colors" : ""}">
                  v${release.version}
                </span>${tooltipHtml}
              </div>
              ${index === 0 ? '<span class="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Stable</span>' : ""}
            </div>
            <time datetime="${release.date}" class="text-xl font-semibold tracking-tight text-gray-800">${formattedDate}</time>
          </div>
        </h3>

        <div class="w-full space-y-6 md:w-2/3">
          ${this._generateGroupedReleaseItems(release)}
        </div>
      </li>`;
  }

  /**
   * Extract command label from install command
   * @private
   */
  _getCommandLabel(command) {
    if (command.startsWith("npm ")) return "npm";
    if (command.startsWith("yarn ")) return "yarn";
    if (command.startsWith("pnpm ")) return "pnpm";
    if (command.startsWith("pip ")) return "pip";
    if (command.startsWith("cargo ")) return "cargo";
    if (command.startsWith("gem ")) return "gem";
    if (command.startsWith("go ")) return "go";
    if (command.startsWith("composer ")) return "composer";
    return "cmd";
  }

  /**
   * Get short label for same-type commands (removes redundant parts)
   * @private
   */
  _getShortLabel(command) {
    // For npm commands, show the distinctive part
    if (command.includes("--global")) return "global";
    if (command.includes("--save-dev") || command.includes("-D")) return "dev";
    if (command.includes("--save-prod") || command.includes("-P"))
      return "prod";
    if (command.includes("--save-optional") || command.includes("-O"))
      return "optional";

    // For pip commands
    if (command.includes("--user")) return "user";
    if (command.includes("--upgrade")) return "upgrade";

    // For basic install commands (no special flags), show "install"
    if (command.startsWith("npm install ") && !command.includes("--"))
      return "install";
    if (command.startsWith("yarn add ") && !command.includes("--"))
      return "install";
    if (command.startsWith("pnpm add ") && !command.includes("--"))
      return "install";
    if (command.startsWith("pip install ") && !command.includes("--"))
      return "install";

    // If we can't determine a good short label, show the package manager name
    return this._getCommandLabel(command);
  }

  /**
   * Generate release items grouped by section type
   * @private
   */
  _generateGroupedReleaseItems(release) {
    const sections = [];

    // Process each section type and group items
    if (release.sections?.added?.length > 0) {
      sections.push(
        this._createSection("New Features", release.sections.added, "green"),
      );
    }

    if (release.sections?.changed?.length > 0) {
      sections.push(
        this._createSection("Improvements", release.sections.changed, "indigo"),
      );
    }

    if (release.sections?.fixed?.length > 0) {
      sections.push(
        this._createSection("Bug Fixes", release.sections.fixed, "yellow"),
      );
    }

    if (release.sections?.breaking?.length > 0) {
      sections.push(
        this._createSection(
          "Breaking Changes",
          release.sections.breaking,
          "red",
        ),
      );
    }

    if (release.sections?.security?.length > 0) {
      sections.push(
        this._createSection(
          "Security Updates",
          release.sections.security,
          "orange",
        ),
      );
    }

    if (release.sections?.removed?.length > 0) {
      sections.push(
        this._createSection("Removed", release.sections.removed, "gray"),
      );
    }

    return sections.join("\n\n          ");
  }

  /**
   * Create a section with grouped items
   * @private
   */
  _createSection(sectionTitle, items, color) {
    const colorClasses = {
      green:
        "text-green-700 rounded-full bg-gradient-to-br from-green-200 to-green-100",
      red: "text-red-700 rounded-full bg-gradient-to-br from-red-200 to-red-100",
      indigo:
        "text-indigo-700 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-100",
      orange:
        "text-orange-700 rounded-full bg-gradient-to-br from-orange-200 to-orange-100",
      yellow:
        "text-yellow-700 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-100",
      gray: "text-gray-700 rounded-full bg-gradient-to-br from-gray-200 to-gray-100",
    };

    const sectionItems = items
      .map((item) => {
        // Clean up the item text by removing prefixes
        const cleanedText = (item.text || item).replace(
          /^\[(?:new|improvement|bugfix|breaking|security|removed)\]\s*/i,
          "",
        );
        return `            <li class="text-gray-700 leading-relaxed">${cleanedText}</li>`;
      })
      .join("\n");

    return `<div class="space-y-3">
            <div class="flex items-center space-x-3">
              <span class="inline-block px-3 py-1 text-sm font-medium leading-none ${colorClasses[color]}">
                ${sectionTitle}
              </span>
            </div>
            <ul class="space-y-2 ml-6">
${sectionItems}
            </ul>
          </div>`;
  }

  /**
   * Format date for display
   * @private
   */
  _formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Insert content into template between markers
   * @private
   */
  _insertIntoTemplate(template, releaseHtml) {
    const startMarker = HtmlRenderer.MARKERS.START;
    const endMarker = HtmlRenderer.MARKERS.END;

    const startIndex = template.indexOf(startMarker);
    const endIndex = template.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Template markers not found");
    }

    return (
      template.substring(0, startIndex + startMarker.length) +
      "\n" +
      releaseHtml +
      "\n" +
      template.substring(endIndex)
    );
  }
}

module.exports = { HtmlRenderer };
