const fs = require("fs");
const path = require("path");

class HtmlFormatter {
  constructor(options = {}) {
    this.template = options.template || "professional";
    this.title = options.title || "Changelog";
    this.author = options.author || "";
    this.packageName = options.packageName || "";
    this.installCommand = options.installCommand || null;
  }

  format(releases) {
    const templatePath = path.join(
      __dirname,
      "../../templates",
      `${this.template}.html`,
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${this.template}`);
    }

    let template = fs.readFileSync(templatePath, "utf8");

    // Generate changelog content in the new format
    const changelogContent = this.generateTimelineContent(releases);

    // Replace template variables
    template = template.replace(/{{TITLE}}/g, this.title);
    template = template.replace(/{{AUTHOR}}/g, this.author);
    template = template.replace(/{{CHANGELOG_CONTENT}}/g, changelogContent);

    return template;
  }

  generateTimelineContent(releases) {
    if (!releases || releases.length === 0) {
      return '<li class="text-center text-gray-500 py-8">No releases found</li>';
    }

    return releases
      .map((release, index) => {
        const isLatest = index === 0;
        const installData = this.generateInstallCommand(release.version);

        // Generate tooltip HTML based on install command type
        let tooltipHtml = "";
        if (installData) {
          if (installData.type === "single") {
            // Single command tooltip
            tooltipHtml = `<div class="tooltip">
                  <pre style="margin:0"><code>${installData.command}</code></pre>
                  <span class="copy-btn" onclick="copyToClipboard('${installData.command}', this)">copy</span>
                </div>`;
          } else if (installData.type === "multiple-same") {
            // Render all commands in a single code block, one per line, with a single copy button
            const allCommands = installData.commands.join("\n");
            // Escape for JS string in onclick
            const allCommandsEscaped = allCommands.replace(/'/g, "\\'").replace(/\n/g, '\\n');
            tooltipHtml = `<div class="tooltip">
                  <pre style="margin:0"><code>${installData.commands.map(cmd => this.escapeHtml(cmd)).join('<br>')}</code></pre>
                  <span class="copy-btn" onclick="copyToClipboard('${allCommandsEscaped}', this)">copy</span>
                </div>`;
          } else if (installData.type === "multiple-different") {
            // Multiple commands of different types - show package manager labels
            const commandTabs = installData.commands
              .map(
                (cmd, idx) =>
                  `<div class="command-tab ${idx === 0 ? "active" : ""}" onclick="switchTab(this, '${cmd}')">${this.getCommandLabel(cmd)}</div>`,
              )
              .join("");

            tooltipHtml = `<div class="tooltip multi-command">
                  <div class="command-tabs">
                    ${commandTabs}
                  </div>
                  <div class="command-content">
                    <span class="active-command">${installData.commands[0]}</span>
                    <span class="copy-btn" onclick="copyActiveCommand(this)">copy</span>
                  </div>
                </div>`;
          } else if (installData.type === "named") {
            // Render all named commands in a single code block, one per line, with a single copy button
            const allCommands = Object.values(installData.commands).join("\n");
            // Escape for JS string in onclick
            const allCommandsEscaped = allCommands.replace(/'/g, "\\'").replace(/\n/g, '\\n');
            tooltipHtml = `<div class="tooltip">
                  <pre style="margin:0"><code>${Object.values(installData.commands).map(cmd => this.escapeHtml(cmd)).join('<br>')}</code></pre>
                  <span class="copy-btn" onclick="copyToClipboard('${allCommandsEscaped}', this)">copy</span>
                </div>`;
          }
        }

        return `
      <li class="relative pl-8 pb-8 md:pb-12 md:pl-10">
        ${this.generateTimelineMarker(isLatest)}
        
        <div class="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <div class="version-badge tag tag-version">
                v${release.version}
                ${tooltipHtml}
              </div>
              ${isLatest ? '<div class="tag tag-stable">Latest</div>' : ""}
              ${this.generateCategoryTags(release)}
            </div>
            
            <div class="space-y-3">
              ${this.generateReleaseContent(release)}
            </div>
          </div>
          
          <div class="text-sm text-gray-500 md:text-right md:ml-6">
            <time datetime="${release.date}">${this.formatDate(release.date)}</time>
          </div>
        </div>
      </li>`;
      })
      .join("\n");
  }

  generateTimelineMarker(isLatest) {
    const bgClass = isLatest ? "bg-blue-500" : "bg-gray-300";
    const ringClass = isLatest ? "ring-blue-100" : "ring-gray-100";

    return `
      <div class="absolute left-0 top-1 hidden h-6 w-6 rounded-full ${bgClass} ring-4 ${ringClass} md:block" aria-hidden="true"></div>`;
  }

  generateCategoryTags(release) {
    const tags = [];

    // Analyze content to determine appropriate tags
    const hasBreaking = this.hasBreakingChanges(release);
    const hasFeatures = this.hasFeatures(release);
    const hasFixes = this.hasFixes(release);
    const hasSecurity = this.hasSecurity(release);
    const hasDeps = this.hasDependencies(release);

    if (hasBreaking) tags.push('<div class="tag tag-breaking">Breaking</div>');
    if (hasFeatures) tags.push('<div class="tag tag-feature">Feature</div>');
    if (hasFixes) tags.push('<div class="tag tag-fix">Fix</div>');
    if (hasSecurity) tags.push('<div class="tag tag-security">Security</div>');
    if (hasDeps) tags.push('<div class="tag tag-deps">Dependencies</div>');

    return tags.join("");
  }

  generateReleaseContent(release) {
    const sections = [];

    // Process each section type with sleeker styling
    if (release.added && release.added.length > 0) {
      sections.push(this.generateSection("Added", release.added));
    }

    if (release.changed && release.changed.length > 0) {
      sections.push(this.generateSection("Changed", release.changed));
    }

    if (release.deprecated && release.deprecated.length > 0) {
      sections.push(this.generateSection("Deprecated", release.deprecated));
    }

    if (release.removed && release.removed.length > 0) {
      sections.push(this.generateSection("Removed", release.removed));
    }

    if (release.fixed && release.fixed.length > 0) {
      sections.push(this.generateSection("Fixed", release.fixed));
    }

    if (release.security && release.security.length > 0) {
      sections.push(this.generateSection("Security", release.security));
    }

    return sections.join("\n");
  }

  generateSection(title, items) {
    const itemsList = items
      .map(
        (item) =>
          `<li class="text-gray-700 leading-relaxed pl-2">${this.escapeHtml(this.cleanTextTags(item))}</li>`,
      )
      .join("\n");

    return `
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">${title}</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>
        <ul class="space-y-1.5">
          ${itemsList}
        </ul>
      </div>`;
  }

  /**
   * Clean redundant text tags from content
   * @private
   */
  cleanTextTags(text) {
    // Remove common text tags that are now redundant with visual tags
    return text.replace(
      /^\[(?:new|feature|feat|improvement|improve|bugfix|fix|bug|breaking|security|deps?|dependency|dependencies)\]\s*/i,
      "",
    );
  }

  // Helper methods for tag detection
  hasBreakingChanges(release) {
    const content = JSON.stringify(release).toLowerCase();
    return (
      content.includes("breaking") ||
      content.includes("major") ||
      (release.removed && release.removed.length > 0)
    );
  }

  hasFeatures(release) {
    return (
      (release.added && release.added.length > 0) ||
      (release.changed && release.changed.length > 0)
    );
  }

  hasFixes(release) {
    return release.fixed && release.fixed.length > 0;
  }

  hasSecurity(release) {
    return release.security && release.security.length > 0;
  }

  hasDependencies(release) {
    const content = JSON.stringify(release).toLowerCase();
    return (
      content.includes("dependency") ||
      content.includes("dependencies") ||
      content.includes("npm") ||
      content.includes("package")
    );
  }

  formatDate(dateString) {
    if (!dateString) return "Unknown date";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  }

  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Generate install command(s) for a version
   * @private
   */
  generateInstallCommand(version) {
    // If installCommand is explicitly null, return null (no tooltip)
    if (this.installCommand === null) {
      return null;
    }

    // Handle single string command
    if (typeof this.installCommand === "string") {
      return {
        type: "single",
        command: this.installCommand.replace("{version}", version),
      };
    }

    // Handle array of commands
    if (Array.isArray(this.installCommand)) {
      const commands = this.installCommand.map((cmd) =>
        cmd.replace("{version}", version),
      );

      // Check if all commands are from the same package manager
      const packageManagers = commands.map((cmd) => this.getCommandLabel(cmd));
      const uniqueManagers = [...new Set(packageManagers)];

      if (uniqueManagers.length === 1) {
        // All commands are same type - show full commands without labels
        return {
          type: "multiple-same",
          commands: commands,
        };
      } else {
        // Different package managers - show with labels
        return {
          type: "multiple-different",
          commands: commands,
        };
      }
    }

    // Handle object with named commands
    if (typeof this.installCommand === "object") {
      const commands = {};
      for (const [key, value] of Object.entries(this.installCommand)) {
        commands[key] = value.replace("{version}", version);
      }
      return {
        type: "named",
        commands: commands,
      };
    }

    // No install command if no configuration
    return null;
  }

  /**
   * Extract command label from install command
   * @private
   */
  getCommandLabel(command) {
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
  getShortLabel(command) {
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
    return this.getCommandLabel(command);
  }
}

module.exports = HtmlFormatter;
