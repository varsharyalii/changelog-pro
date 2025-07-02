/**
 * HTML Renderer
 * Single Responsibility: Render release data into HTML templates
 */
const fs = require('fs');
const path = require('path');

class HtmlRenderer {
  static MARKERS = {
    START: '<!-- START_RELEASES -->',
    END: '<!-- END_RELEASES -->'
  };

  /**
   * Render releases into HTML template
   * @param {Array} releases - Array of release objects
   * @param {string} templateName - Template name or full template content
   * @param {Object} options - Rendering options
   * @returns {string} Complete HTML content
   */
  render(releases, templateName = 'default', options = {}) {
    if (!releases || !Array.isArray(releases)) {
      throw new Error('Invalid releases data');
    }

    // Get template content
    let template;
    if (templateName.includes('<!DOCTYPE') || templateName.includes('<html')) {
      // Full template content provided (legacy support)
      template = templateName;
    } else {
      // Template name provided, load from file
      const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templateName}`);
      }
      template = fs.readFileSync(templatePath, 'utf8');
    }

    const releaseHtml = releases
      .map((release, index) => this._renderSingleRelease(release, index))
      .join('\n\n');

    // Replace template variables
    template = this._replaceTemplateVariables(template, options);
    
    return this._insertIntoTemplate(template, releaseHtml);
  }

  /**
   * Replace template variables
   * @private
   */
  _replaceTemplateVariables(template, options = {}) {
    const packageInfo = this._getPackageInfo();
    
    return template
      .replace(/{{TITLE}}/g, options.title || packageInfo.name || 'Changelog')
      .replace(/{{DESCRIPTION}}/g, options.description || `Changelog for ${packageInfo.name || 'this project'}`)
      .replace(/{{AUTHOR}}/g, options.author || packageInfo.author || 'Development Team');
  }

  /**
   * Get package information
   * @private
   */
  _getPackageInfo() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      return {
        name: packageJson.name || '',
        author: packageJson.author || '',
        version: packageJson.version || ''
      };
    } catch (error) {
      return { name: '', author: '', version: '' };
    }
  }

  /**
   * Render a single release into HTML
   * @private
   */
  _renderSingleRelease(release, index) {
    const formattedDate = this._formatDate(release.date);
    const packageInfo = this._getPackageInfo();
    const installCommand = `npm install ${packageInfo.name || 'package'}@${release.version}`;
    
    // Add mt-20 spacing for all releases except the first one
    const marginClass = index > 0 ? ' mt-20' : '';
    
    return `      <li class="flex flex-col items-start${marginClass} md:flex-row">
        <h3 class="flex items-center w-full mb-3 space-x-3 md:w-1/3">
          <span class="z-10 hidden block w-5 h-5 bg-white border-4 border-gray-300 rounded-full md:block"></span>

          <div class="flex flex-col space-y-2">
            <div class="flex items-center space-x-2">
              <div class="version-tag">
                <span class="px-3 py-1 text-sm font-mono font-semibold text-white bg-gray-900 rounded-full cursor-pointer hover:bg-gray-800 transition-colors">
                  v${release.version}
                  <div class="version-tooltip">
                    <span>${installCommand}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${installCommand}', this)">copy</button>
                  </div>
                </span>
              </div>
              ${index === 0 ? '<span class="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Stable</span>' : ''}
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
   * Generate release items grouped by section type
   * @private
   */
  _generateGroupedReleaseItems(release) {
    const sections = [];
    
    // Process each section type and group items
    if (release.sections?.added?.length > 0) {
      sections.push(this._createSection('New Features', release.sections.added, 'green'));
    }
    
    if (release.sections?.changed?.length > 0) {
      sections.push(this._createSection('Improvements', release.sections.changed, 'indigo'));
    }
    
    if (release.sections?.fixed?.length > 0) {
      sections.push(this._createSection('Bug Fixes', release.sections.fixed, 'yellow'));
    }

    if (release.sections?.breaking?.length > 0) {
      sections.push(this._createSection('Breaking Changes', release.sections.breaking, 'red'));
    }

    if (release.sections?.security?.length > 0) {
      sections.push(this._createSection('Security Updates', release.sections.security, 'orange'));
    }

    if (release.sections?.removed?.length > 0) {
      sections.push(this._createSection('Removed', release.sections.removed, 'gray'));
    }

    return sections.join('\n\n          ');
  }

  /**
   * Create a section with grouped items
   * @private
   */
  _createSection(sectionTitle, items, color) {
    const colorClasses = {
      green: 'text-green-700 rounded-full bg-gradient-to-br from-green-200 to-green-100',
      red: 'text-red-700 rounded-full bg-gradient-to-br from-red-200 to-red-100',
      indigo: 'text-indigo-700 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-100',
      orange: 'text-orange-700 rounded-full bg-gradient-to-br from-orange-200 to-orange-100',
      yellow: 'text-yellow-700 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-100',
      gray: 'text-gray-700 rounded-full bg-gradient-to-br from-gray-200 to-gray-100'
    };

    const sectionItems = items.map(item => {
      // Clean up the item text by removing prefixes
      const cleanedText = (item.text || item).replace(/^\[(?:new|improvement|bugfix|breaking|security|removed)\]\s*/i, '');
      return `            <li class="text-gray-700 leading-relaxed">${cleanedText}</li>`;
    }).join('\n');

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
      return new Date(dateString).toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'long',
        year: 'numeric'
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