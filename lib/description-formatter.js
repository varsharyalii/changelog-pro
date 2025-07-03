/**
 * Description Formatter
 * Single Responsibility: Format release descriptions from structured data
 */
class DescriptionFormatter {
  static SECTION_PRIORITIES = [
    "breaking",
    "features",
    "fixes",
    "improvements",
    "security",
  ];
  static SECTION_LABELS = {
    breaking: "Breaking",
    features: "New",
    fixes: "Fix",
    improvements: "Improved",
    security: "Security",
  };

  /**
   * Format release into bullet point descriptions
   * @param {Object} release - Release object with sections
   * @returns {Array<string>} Array of formatted description lines
   */
  formatReleaseDescriptions(release) {
    if (!release?.sections) {
      return ["Various improvements and bug fixes"];
    }

    const descriptions = [];

    for (const sectionType of DescriptionFormatter.SECTION_PRIORITIES) {
      const section = release.sections[sectionType];
      if (section && section.length > 0) {
        descriptions.push(this._formatSectionDescription(sectionType, section));
      }
    }

    return descriptions.length > 0
      ? descriptions
      : ["Various improvements and bug fixes"];
  }

  /**
   * Format a single section into description
   * @private
   */
  _formatSectionDescription(sectionType, items) {
    const label = DescriptionFormatter.SECTION_LABELS[sectionType] || "Update";
    const count = items.length;
    const firstItem = items[0]?.text || "improvements";

    if (count === 1) {
      return `${label}: ${firstItem}`;
    }

    const countLabel =
      sectionType === "breaking"
        ? "Breaking changes"
        : `${count} ${sectionType}`;
    return `${countLabel} including ${firstItem}`;
  }

  /**
   * Format descriptions for HTML display
   * @param {Array<string>} descriptions - Array of description strings
   * @returns {string} HTML formatted string
   */
  formatAsHtml(descriptions) {
    if (!Array.isArray(descriptions)) {
      return String(descriptions || "");
    }

    return descriptions.map((desc) => `• ${desc}`).join("<br>");
  }

  /**
   * Format descriptions for plain text display
   * @param {Array<string>} descriptions - Array of description strings
   * @returns {string} Plain text formatted string
   */
  formatAsPlainText(descriptions) {
    if (!Array.isArray(descriptions)) {
      return String(descriptions || "");
    }

    return descriptions.map((desc) => `• ${desc}`).join("\n");
  }
}

module.exports = { DescriptionFormatter };
