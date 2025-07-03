# Changelog Pro

[![npm version](https://badge.fury.io/js/changelog-pro.svg)](https://www.npmjs.com/package/changelog-pro)
[![npm downloads](https://img.shields.io/npm/dm/changelog-pro.svg)](https://www.npmjs.com/package/changelog-pro)
[![GitHub Stars](https://img.shields.io/github/stars/varsharyalii/changelog-pro.svg)](https://github.com/varsharyalii/changelog-pro/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Generate beautiful HTML changelogs from markdown with zero config. Supports live preview and smart install command labels.

## 🌟 Live Demo

**Check it out:** [https://varsharyalii.github.io/changelog-pro/changelog](https://varsharyalii.github.io/changelog-pro/changelog)

This is what your changelog will look like - timeline design, copy buttons that actually work, and hover tooltips.

![Changelog Pro Preview](https://github.com/varsharyalii/changelog-pro/raw/main/changelog-preview.jpg)

## 📦 Installation

```bash
npm install -g changelog-pro  # Install globally for CLI usage
```

**NPM Package:** https://www.npmjs.com/package/changelog-pro

## 🚀 Quick Start

```bash
changelog-pro init              # Create sample CHANGELOG.md
changelog-pro generate          # Generate changelog.html
changelog-pro preview           # Start live preview server
```

## Commands

```bash
# Generate HTML from markdown
changelog-pro generate

# Custom input/output files
changelog-pro generate -i CHANGES.md -o docs/changelog.html

# Initialize new project with sample changelog
changelog-pro init

# Force overwrite existing changelog
changelog-pro init --force

# Start development server with live reload
changelog-pro preview

# Use custom port for preview
changelog-pro preview --port 8080

# Show changelog statistics
changelog-pro stats

# Analyze specific file
changelog-pro stats -i CHANGES.md
```

## Changelog Format

Use [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

## [1.2.0] - 2025-01-02

### Added

- New feature for user authentication
- Support for multiple output formats

### Changed

- Improved error handling throughout the application

### Fixed

- Resolved issue with file parsing on Windows
```

## Configuration

```js
// changelog-pro.config.js
module.exports = {
  input: "CHANGELOG.md",
  output: "changelog.html",
  installCommand: [
    "npm install changelog-pro",    // no labels if identical
    "npm install -g changelog-pro"  // shows "global" label
  ]
};
```

## CI/CD Integration

### Basic Pipeline Usage
```bash
# Install globally
npm install -g changelog-pro

# Generate changelog
changelog-pro generate -i CHANGELOG.md -o docs/changelog.html
```

### Programmatic Usage
```javascript
const { ChangelogGenerator } = require('changelog-pro');

const generator = new ChangelogGenerator();
await generator.generate({
  input: 'CHANGELOG.md',
  output: 'docs/changelog.html'
});
```

### Configuration
Create `changelog-pro.config.js` in your project root:
```javascript
module.exports = {
  input: "CHANGELOG.md",
  output: "docs/changelog.html",
  installCommand: ["npm install my-package@{version}"]
};
```

### Exit Codes
- `0`: Success
- `1`: Error (file not found, parsing failed, etc.)

### Environment Variables
- `CHANGELOG_INPUT`: Input file path
- `CHANGELOG_OUTPUT`: Output file path
- `CHANGELOG_TEMPLATE`: Template name

### GitHub Actions Example
```yaml
- name: Generate Changelog
  run: |
    npm install -g changelog-pro
    changelog-pro generate
```

## API Usage

```javascript
const { ChangelogService } = require("changelog-pro");

const service = new ChangelogService();
const result = await service.generateChangelog("CHANGELOG.md", "output.html");
console.log(`Generated ${result.releases.length} releases`);
```

## Development

```bash
git clone https://github.com/varsharyalii/changelog-pro.git  # Clone repo
cd changelog-pro                                             # Enter directory
npm install                                                  # Install dependencies
npm test                                                     # Run tests
npm run lint                                                 # Check code style
```

## Release

```bash
npm version minor  # Bumps version, updates changelog, creates tag
```

## License

MIT License - see [LICENSE](LICENSE) file.
