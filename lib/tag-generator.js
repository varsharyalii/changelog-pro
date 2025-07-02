/**
 * Tag Generator
 * Single Responsibility: Generate HTML tags based on release sections
 */
class TagGenerator {
  static TAG_MAPPINGS = {
    features: { class: 'tag-feature', label: 'New' },
    fixes: { class: 'tag-fix', label: 'Fix' },
    breaking: { class: 'tag-breaking', label: 'Breaking' },
    security: { class: 'tag-security', label: 'Security' },
    improvements: { class: 'tag-feature', label: 'Update' }
  };

  /**
   * Generate HTML tags for a release
   * @param {Object} sections - Release sections object
   * @returns {Array<string>} Array of HTML tag strings
   */
  generateTags(sections) {
    if (!sections || typeof sections !== 'object') {
      return [this._createTag('tag-feature', 'Update')];
    }

    const tags = [];

    for (const [sectionType, items] of Object.entries(sections)) {
      if (items && items.length > 0) {
        const tagConfig = TagGenerator.TAG_MAPPINGS[sectionType];
        if (tagConfig) {
          tags.push(this._createTag(tagConfig.class, tagConfig.label));
        }
      }
    }

    // Default tag if none found
    if (tags.length === 0) {
      tags.push(this._createTag('tag-feature', 'Update'));
    }

    return tags;
  }

  /**
   * Create a single HTML tag
   * @private
   */
  _createTag(className, label) {
    return `<span class="tag ${className}">${label}</span>`;
  }

  /**
   * Generate version tag
   * @param {string} version - Version string
   * @returns {string} HTML version tag
   */
  generateVersionTag(version) {
    return `<span class="version-badge tag tag-version">
      v${version}
      <div class="tooltip">
        npm install @agentchat/core@${version}<br>
        npm install @agentchat/angular@${version}
        <span class="copy-btn" onclick="copyToClipboard('npm install @agentchat/core@${version} @agentchat/angular@${version}', this)">copy</span>
      </div>
    </span>`;
  }
}

module.exports = { TagGenerator }; 