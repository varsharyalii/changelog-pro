/**
 * RuntimeCache
 * Simple in-memory cache for changelog processing
 * Optimized for CI/CD pipeline usage
 */

class RuntimeCache {
  constructor() {
    this.clear();
  }

  clear() {
    this._store = {
      parsed: null,    // Last parsed changelog content
      content: null,   // Last raw content
      templates: new Map(), // Template cache
      preview: null    // Preview content
    };
  }

  // Parsed changelog cache
  setParsedContent(content, parsed) {
    this._store.content = content;
    this._store.parsed = parsed;
  }

  getParsedContent(content) {
    if (content === this._store.content) {
      return this._store.parsed;
    }
    return null;
  }

  // Template cache
  setTemplate(name, content) {
    this._store.templates.set(name, content);
  }

  getTemplate(name) {
    return this._store.templates.get(name);
  }

  // Preview cache
  setPreviewContent(content) {
    this._store.preview = content;
  }

  getPreviewContent() {
    return this._store.preview;
  }

  clearPreviewContent() {
    this._store.preview = null;
  }
}

// Single instance for the entire process
module.exports = new RuntimeCache(); 