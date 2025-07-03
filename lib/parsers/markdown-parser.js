/**
 * Markdown Parser
 * Single Responsibility: Parse markdown changelog into structured data
 */
const cache = require('../utils/runtime-cache');

class MarkdownParser {
  /**
   * Parse markdown content into releases
   * @param {string} content - Markdown content
   * @returns {Promise<Array>} Array of release objects
   */
  async parse(content) {
    // Check cache first
    const cached = cache.getParsedContent(content);
    if (cached) {
      return cached;
    }

    // Parse content into sections
    const sections = this._splitIntoSections(content);
    const releases = [];

    for (const section of sections) {
      const release = this._parseReleaseSection(section);
      if (release) {
        releases.push(release);
      }
    }

    // Sort releases by version (newest first)
    releases.sort((a, b) => this._compareVersions(b.version, a.version));

    // Cache result
    cache.setParsedContent(content, releases);
    
    return releases;
  }

  /**
   * Split content into release sections
   * @private
   */
  _splitIntoSections(content) {
    const lines = content.split("\n");
    const sections = [];
    let currentSection = [];

    for (const line of lines) {
      if (line.startsWith("## ")) {
        if (currentSection.length > 0) {
          sections.push(currentSection.join("\n"));
          currentSection = [];
        }
      }
      currentSection.push(line);
    }

    if (currentSection.length > 0) {
      sections.push(currentSection.join("\n"));
    }

    return sections;
  }

  /**
   * Parse single release section
   * @private
   */
  _parseReleaseSection(section) {
    const lines = section.split("\n");
    const headerLine = lines[0];

    // Parse version and date
    const versionMatch = headerLine.match(/## \[(.*?)\]( - (\d{4}-\d{2}-\d{2}))?/);
    if (!versionMatch) return null;

    const version = versionMatch[1];
    const date = versionMatch[3] || new Date().toISOString().split("T")[0];

    // Parse sections
    const sections = {};
    let currentType = null;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("### ")) {
        currentType = line.substring(4).toLowerCase();
        sections[currentType] = [];
      } else if (line.startsWith("- ") && currentType) {
        const item = {
          text: line.substring(2),
          type: this._getChangeType(line),
        };
        sections[currentType].push(item);
      }
    }

    return {
      version,
      date,
      sections,
    };
  }

  /**
   * Get change type from line
   * @private
   */
  _getChangeType(line) {
    const typeMatch = line.match(/\[(\w+)\]/);
    return typeMatch ? typeMatch[1].toLowerCase() : "other";
  }

  /**
   * Compare semantic versions
   * @private
   */
  _compareVersions(a, b) {
    const normalize = (v) => v.replace(/^v/, "");
    const partsA = normalize(a).split(".").map(Number);
    const partsB = normalize(b).split(".").map(Number);

    for (let i = 0; i < 3; i++) {
      const numA = partsA[i] || 0;
      const numB = partsB[i] || 0;
      if (numA !== numB) {
        return numA - numB;
      }
    }

    return 0;
  }
}

module.exports = MarkdownParser; 