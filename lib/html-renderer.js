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

    if (!formatters?.tag || !formatters?.description) {
      throw new Error('Missing required formatters');
    }

    const releaseHtml = releases
      .map(release => this._renderSingleRelease(release, formatters))
      .join('\n\n');

    return this._insertIntoTemplate(template, releaseHtml);
  }

  /**
   * Render a single release into HTML
   * @private
   */
  _renderSingleRelease(release, formatters) {
    const formattedDate = this._formatDate(release.date);
    const tags = formatters.tag.generateTags(release.sections);
    const versionTag = formatters.tag.generateVersionTag(release.version);
    const descriptions = formatters.description.formatReleaseDescriptions(release);
    const formattedDescription = formatters.description.formatAsHtml(descriptions);

    return `      <li class="flex flex-col items-start mt-20 md:flex-row">
        <h3 class="flex items-center w-full mb-3 space-x-3 md:w-1/3">
          <span class="z-10 hidden block w-5 h-5 bg-white border-4 border-gray-300 rounded-full md:block"></span>
          <time datetime="${release.date}" class="text-xl font-semibold tracking-tight text-gray-800">${formattedDate}</time>
        </h3>
        <div class="w-full space-y-3 md:w-2/3">
          <div class="flex items-center flex-wrap gap-2">
            ${tags.join('\n            ')}
            ${versionTag}
          </div>
          <p class="text-gray-700">
            ${formattedDescription}
          </p>
        </div>
      </li>`;
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
      return dateString; // Fallback to original string
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