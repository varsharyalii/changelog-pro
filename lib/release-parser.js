const { MarkdownTokenizer } = require("./tokenizer");

/**
 * Release Parser
 * Single Responsibility: Parse tokens into structured release objects
 */
class ReleaseParser {
  static SECTION_MAPPINGS = {
    features: "features",
    feature: "features",
    "new features": "features",
    "new feature": "features",
    feat: "features",

    fixes: "fixes",
    fix: "fixes",
    "bug fixes": "fixes",
    "bug fix": "fixes",
    bugfixes: "fixes",
    bugfix: "fixes",

    "breaking changes": "breaking",
    "breaking change": "breaking",
    breaking: "breaking",

    security: "security",
    "security fix": "security",
    "security fixes": "security",

    improvements: "improvements",
    improvement: "improvements",
    performance: "improvements",
    perf: "improvements",
  };

  constructor(tokenizer = new MarkdownTokenizer()) {
    this.tokenizer = tokenizer;
  }

  /**
   * Parse markdown into release objects
   * @param {string} markdown - Raw markdown content
   * @returns {Array<Release>} Parsed releases
   * @throws {Error} When parsing fails
   */
  parse(markdown) {
    try {
      const tokens = this.tokenizer.tokenize(markdown);
      return this._parseTokensIntoReleases(tokens);
    } catch (error) {
      throw new Error(`Failed to parse changelog: ${error.message}`);
    }
  }

  /**
   * Parse tokens into release objects
   * @private
   */
  _parseTokensIntoReleases(tokens) {
    const releases = [];
    let currentRelease = null;
    let currentSection = null;

    for (const token of tokens) {
      if (token.type === MarkdownTokenizer.TOKEN_TYPES.HEADING) {
        if (token.level === 2) {
          // New release
          if (currentRelease) {
            releases.push(currentRelease);
          }
          currentRelease = this._createReleaseFromHeading(token);
          currentSection = null;
        } else if (token.level === 3 && currentRelease) {
          // New section within release
          currentSection = this._normalizeSectionName(token.text);
          this._ensureSectionExists(currentRelease, currentSection);
        }
      } else if (
        token.type === MarkdownTokenizer.TOKEN_TYPES.LIST_ITEM &&
        currentRelease &&
        currentSection
      ) {
        // Add item to current section
        currentRelease.sections[currentSection].push({
          text: token.text,
          raw: token.raw,
        });
      }
    }

    // Don't forget the last release
    if (currentRelease) {
      releases.push(currentRelease);
    }

    return releases;
  }

  /**
   * Create release object from heading token
   * @private
   */
  _createReleaseFromHeading(token) {
    const parsed = this._parseReleaseTitle(token.text);

    return {
      version: parsed.version,
      date: parsed.date,
      title: parsed.title,
      raw: token.text,
      sections: {},
    };
  }

  /**
   * Parse release title into components
   * @private
   */
  _parseReleaseTitle(title) {
    // Handle various formats: "1.0.0 (2025-01-01)", "[1.0.0] - 2025-01-01", etc.
    const patterns = [
      /^(\d+\.\d+\.\d+(?:[-+][\w\d.-]*)?)\s*\(([^)]+)\)$/, // 1.0.0 (2025-01-01) - semantic version pattern (moved first)
      /^(?:\[)?([^\]]+?)(?:\])?\s*[-–]\s*(.+)$/, // [1.0.0] - 2025-01-01
      /^(\d+\.\d+\.\d+(?:\S*))\s+(.+)$/, // 1.0.0 2025-01-01
      /^(.+)$/, // Fallback
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        const [, version, dateOrTitle] = match;

        // Try to parse date
        const dateMatch = dateOrTitle?.match(/\d{4}-\d{2}-\d{2}/);

        return {
          version: version?.trim() || "unknown",
          date: dateMatch
            ? dateMatch[0]
            : new Date().toISOString().split("T")[0],
          title: title,
        };
      }
    }

    // Fallback
    return {
      version: "unknown",
      date: new Date().toISOString().split("T")[0],
      title: title,
    };
  }

  /**
   * Normalize section name to standard format
   * @private
   */
  _normalizeSectionName(name) {
    const cleaned = name
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove special characters
      .trim();

    return ReleaseParser.SECTION_MAPPINGS[cleaned] || cleaned;
  }

  /**
   * Ensure section exists in release object
   * @private
   */
  _ensureSectionExists(release, sectionName) {
    if (!release.sections[sectionName]) {
      release.sections[sectionName] = [];
    }
  }
}

module.exports = { ReleaseParser };
