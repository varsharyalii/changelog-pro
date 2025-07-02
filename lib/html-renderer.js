/**
 * HTML Renderer
 * Single Responsibility: Render release data into HTML templates
 */
class HtmlRenderer {
  static MARKERS = {
    START: '<!-- START_RELEASES -->',
    END: '<!-- END_RELEASES -->'
  };

  /**
   * Render releases into HTML template
   * @param {Array} releases - Array of release objects
   * @param {string} template - HTML template string
   * @param {Object} formatters - Formatter objects { tag, description }
   * @returns {string} Complete HTML content
   */
  render(releases, template, formatters) {
    if (!releases || !Array.isArray(releases)) {
      throw new Error('Invalid releases data');
    }

    if (!template || typeof template !== 'string') {
      throw new Error('Invalid HTML template');
    }

    const releaseHtml = releases
      .map(release => this._renderSingleRelease(release))
      .join('\n\n');

    return this._insertIntoTemplate(template, releaseHtml);
  }

  /**
   * Render a single release into HTML
   * @private
   */
  _renderSingleRelease(release) {
    const formattedDate = this._formatDate(release.date);
    
    return `      <div class="flex items-start justify-between mb-8">
        <div class="flex items-center space-x-3">
          <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span class="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">V${release.version}</span>
          <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">LATEST</span>
          ${this._generateBadges(release)}
        </div>
        <span class="text-gray-500 text-sm">${formattedDate}</span>
      </div>

      ${this._generateSections(release)}`;
  }

  /**
   * Generate badges based on release content
   * @private
   */
  _generateBadges(release) {
    const badges = [];
    
    if (release.sections?.breaking?.length > 0 || release.sections?.changed?.length > 0) {
      badges.push('<span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">BREAKING</span>');
    }
    
    if (release.sections?.added?.length > 0) {
      badges.push('<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">FEATURE</span>');
    }
    
    if (release.sections?.fixed?.length > 0) {
      badges.push('<span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">FIX</span>');
    }

    if (release.sections?.security?.length > 0) {
      badges.push('<span class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">SECURITY</span>');
    }

    return badges.join('\n          ');
  }

  /**
   * Generate sections (CHANGED, REMOVED, FIXED, etc.)
   * @private
   */
  _generateSections(release) {
    const sections = [];

    if (release.sections?.breaking?.length > 0) {
      sections.push(this._createSection('CHANGED', release.sections.breaking));
    }

    if (release.sections?.changed?.length > 0) {
      sections.push(this._createSection('CHANGED', release.sections.changed));
    }

    if (release.sections?.removed?.length > 0) {
      sections.push(this._createSection('REMOVED', release.sections.removed));
    }

    if (release.sections?.fixed?.length > 0) {
      sections.push(this._createSection('FIXED', release.sections.fixed));
    }

    if (release.sections?.security?.length > 0) {
      sections.push(this._createSection('SECURITY', release.sections.security));
    }

    return sections.join('\n\n      ');
  }

  /**
   * Create a section with items
   * @private
   */
  _createSection(title, items) {
    const itemsHtml = items.map(item => {
      // Clean up the item text by removing [new], [improvement], [bugfix] prefixes
      const cleanedItem = item.replace(/^\[(?:new|improvement|bugfix|breaking)\]\s*/i, '');
      return `        <li class="text-gray-700 mb-1">${cleanedItem}</li>`;
    }).join('\n');

    return `      <div class="mb-6">
        <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">${title}</h3>
        <ul class="list-none space-y-1">
${itemsHtml}
        </ul>
      </div>`;
  }

  /**
   * Format date for display
   * @private
   */
  _formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Insert content into template between markers
   * @private
   */
  _insertIntoTemplate(template, content) {
    const pattern = new RegExp(
      `${HtmlRenderer.MARKERS.START}[\\s\\S]*${HtmlRenderer.MARKERS.END}`,
      'g'
    );

    return template.replace(
      pattern,
      `${HtmlRenderer.MARKERS.START}\n${content}\n      ${HtmlRenderer.MARKERS.END}`
    );
  }
}

module.exports = { HtmlRenderer }; 