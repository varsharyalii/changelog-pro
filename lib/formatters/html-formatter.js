const fs = require('fs');
const path = require('path');

class HtmlFormatter {
  constructor(options = {}) {
    this.template = options.template || 'professional';
    this.title = options.title || 'Changelog';
    this.author = options.author || '';
    this.packageName = options.packageName || '';
  }

  format(releases) {
    const templatePath = path.join(__dirname, '../../templates', `${this.template}.html`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${this.template}`);
    }

    let template = fs.readFileSync(templatePath, 'utf8');
    
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

    return releases.map((release, index) => {
      const isLatest = index === 0;
      const installCommand = this.packageName ? `npm install ${this.packageName}@${release.version}` : `npm install package@${release.version}`;
      
      return `
      <li class="relative pl-8 pb-8 md:pb-12 md:pl-10">
        ${this.generateTimelineMarker(isLatest)}
        
        <div class="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <div class="version-badge tag tag-version">
                v${release.version}
                <div class="tooltip">
                  ${installCommand}
                  <span class="copy-btn" onclick="copyToClipboard('${installCommand}', this)">copy</span>
                </div>
              </div>
              ${isLatest ? '<div class="tag tag-stable">Latest</div>' : ''}
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
    }).join('\n');
  }

  generateTimelineMarker(isLatest) {
    const bgClass = isLatest ? 'bg-blue-500' : 'bg-gray-300';
    const ringClass = isLatest ? 'ring-blue-100' : 'ring-gray-100';
    
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
    
    return tags.join('');
  }

  generateReleaseContent(release) {
    const sections = [];
    
    // Process each section type with sleeker styling
    if (release.added && release.added.length > 0) {
      sections.push(this.generateSection('Added', release.added));
    }
    
    if (release.changed && release.changed.length > 0) {
      sections.push(this.generateSection('Changed', release.changed));
    }
    
    if (release.deprecated && release.deprecated.length > 0) {
      sections.push(this.generateSection('Deprecated', release.deprecated));
    }
    
    if (release.removed && release.removed.length > 0) {
      sections.push(this.generateSection('Removed', release.removed));
    }
    
    if (release.fixed && release.fixed.length > 0) {
      sections.push(this.generateSection('Fixed', release.fixed));
    }
    
    if (release.security && release.security.length > 0) {
      sections.push(this.generateSection('Security', release.security));
    }
    
    return sections.join('\n');
  }

  generateSection(title, items) {
    const itemsList = items.map(item => 
      `<li class="text-gray-700 leading-relaxed pl-2">${this.escapeHtml(this.cleanTextTags(item))}</li>`
    ).join('\n');
    
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
    return text.replace(/^\[(?:new|feature|feat|improvement|improve|bugfix|fix|bug|breaking|security|deps?|dependency|dependencies)\]\s*/i, '');
  }

  // Helper methods for tag detection
  hasBreakingChanges(release) {
    const content = JSON.stringify(release).toLowerCase();
    return content.includes('breaking') || content.includes('major') || 
           (release.removed && release.removed.length > 0);
  }

  hasFeatures(release) {
    return (release.added && release.added.length > 0) || 
           (release.changed && release.changed.length > 0);
  }

  hasFixes(release) {
    return release.fixed && release.fixed.length > 0;
  }

  hasSecurity(release) {
    return release.security && release.security.length > 0;
  }

  hasDependencies(release) {
    const content = JSON.stringify(release).toLowerCase();
    return content.includes('dependency') || content.includes('dependencies') || 
           content.includes('npm') || content.includes('package');
  }

  formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

module.exports = HtmlFormatter; 