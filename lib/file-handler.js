const fs = require("fs").promises;
const { existsSync, mkdirSync } = require("fs");
const path = require("path");

/**
 * File Handler
 * Single Responsibility: Handle file I/O operations with proper error handling
 */
class FileHandler {
  constructor(basePath = process.cwd()) {
    this.basePath = basePath;
  }

  /**
   * Read changelog file
   * @param {string} filename - Changelog filename (default: CHANGELOG.md)
   * @returns {Promise<string>} File contents
   * @throws {Error} When file cannot be read
   */
  async readChangelog(filename = "CHANGELOG.md") {
    const filePath = path.join(this.basePath, filename);

    try {
      return await fs.readFile(filePath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(`Changelog file not found: ${filePath}`);
      }
      if (error.code === "EACCES") {
        throw new Error(`Permission denied reading: ${filePath}`);
      }
      throw new Error(`Failed to read changelog: ${error.message}`);
    }
  }

  /**
   * Read HTML template file
   * @param {string} filename - Template filename
   * @returns {Promise<string>} File contents
   * @throws {Error} When file cannot be read
   */
  async readHtmlTemplate(filename = "public/changelog.html") {
    const filePath = path.join(this.basePath, filename);

    try {
      return await fs.readFile(filePath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(`HTML template not found: ${filePath}`);
      }
      throw new Error(`Failed to read HTML template: ${error.message}`);
    }
  }

  /**
   * Write HTML file
   * @param {string} content - HTML content to write
   * @param {string} filename - Output filename
   * @throws {Error} When file cannot be written
   */
  async writeHtml(content, filename = "public/changelog.html") {
    const filePath = path.join(this.basePath, filename);

    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      await fs.writeFile(filePath, content, "utf8");
    } catch (error) {
      if (error.code === "EACCES") {
        throw new Error(`Permission denied writing: ${filePath}`);
      }
      throw new Error(`Failed to write HTML file: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   * @param {string} filename - File to check
   * @returns {boolean} True if file exists
   */
  fileExists(filename) {
    const filePath = path.join(this.basePath, filename);
    return existsSync(filePath);
  }

  /**
   * Read package.json file safely
   * @returns {Promise<Object>} Package.json contents or empty object
   */
  async readPackageJson() {
    try {
      const content = await fs.readFile("./package.json", "utf8");
      return JSON.parse(content);
    } catch (error) {
      return {};
    }
  }
}

module.exports = { FileHandler };
