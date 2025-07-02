# Changelog Pro

[![npm version](https://badge.fury.io/js/changelog-pro.svg)](https://badge.fury.io/js/changelog-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Professional changelog generator and processor with badge support, HTML rendering, and CLI tools. Transform your markdown changelogs into beautiful, styled HTML with advanced features like badge parsing, version categorization, and professional templates.

## ✨ Features

- 🎨 **Professional HTML Generation** - Convert markdown to beautiful, styled HTML
- 🏷️ **Badge Support** - Built-in support for `[new]`, `[bugfix]`, `[improvement]`, `[breaking]` and more
- 📦 **Dual API** - Use as CLI tool or programmatic library
- 🎯 **Clean Architecture** - Modular, testable, and maintainable codebase
- 📊 **Statistics** - Get insights about your changelog
- 🛠️ **Customizable** - Custom templates and configurations
- 🚀 **Modern** - ES6+, Professional error handling, TypeScript-ready

## 🚀 Quick Start

### Installation

```bash
# Install globally for CLI usage
npm install -g changelog-pro

# Or install locally in your project
npm install changelog-pro
```

### CLI Usage

```bash
# Generate HTML from CHANGELOG.md (creates changelog.html)
changelog-pro

# Custom input/output files
changelog-pro generate -i CHANGES.md -o docs/changelog.html

# Initialize with sample files
changelog-pro generate --init

# Get statistics about your changelog
changelog-pro stats

# Show help
changelog-pro help
```

### Programmatic Usage

```javascript
const { ChangelogPro } = require('changelog-pro');

// Quick generation
const result = await ChangelogPro.generate({
  config: {
    changelogFile: 'CHANGELOG.md',
    htmlFile: 'changelog.html'
  }
});

if (result.success) {
  console.log(`Generated ${result.stats.totalReleases} releases`);
}
```

## 📖 Documentation

### Badge Syntax

Changelog Pro supports various badge types that get converted to styled HTML badges:

#### Change Types
- `[new]` - New features (green)
- `[improvement]` - Enhancements (blue)
- `[bugfix]` - Bug fixes (red)
- `[breaking]` - Breaking changes (red)

#### Release Types
- `[beta]` - Beta releases (purple)
- `[alpha]` - Alpha releases (red)
- `[lts]` - LTS releases (yellow)

#### Status Types
- `[warning]` - Warnings (yellow)
- `[unstable]` - Unstable features (orange)
- `[deprecated]` - Deprecated features (gray)

### Example Changelog

```markdown
# Changelog

## [2.1.0] - 2024-01-15

### Added
- [new] Advanced template system with custom themes
- [new] Real-time preview functionality

### Changed  
- [improvement] Enhanced performance by 40%
- [improvement] Better error messages and debugging

### Fixed
- [bugfix] Fixed memory leak in large changelogs
- [bugfix] Resolved template parsing edge cases

### Breaking Changes
- [breaking] API restructure - see migration guide

## [2.0.0] - 2024-01-01

### Added
- [new] Complete rewrite with TypeScript support
- [lts] Long-term support version
```

### CLI Commands

#### `generate` (default)
Generate HTML from markdown changelog.

```bash
changelog-pro generate [options]

Options:
  -i, --input <file>     Input markdown file (default: CHANGELOG.md)
  -o, --output <file>    Output HTML file (default: changelog.html)
  --init                 Create default files if missing
  -v, --verbose          Show detailed error information
```

#### `stats`
Show changelog statistics.

```bash
changelog-pro stats [options]

Options:
  -i, --input <file>     Input markdown file (default: CHANGELOG.md)
```

### Programmatic API

#### Basic Usage

```javascript
const { ChangelogService, generate, getStats } = require('changelog-pro');

// Using convenience functions
const result = await generate({
  config: {
    changelogFile: 'CHANGELOG.md',
    htmlFile: 'public/changelog.html'
  }
});

const stats = await getStats({
  config: { changelogFile: 'CHANGELOG.md' }
});
```

#### Advanced Usage

```javascript
const { 
  ChangelogService,
  ReleaseParser,
  HtmlRenderer,
  TagGenerator 
} = require('changelog-pro');

// Custom configuration
const service = new ChangelogService({
  config: {
    changelogFile: 'CHANGES.md',
    htmlFile: 'docs/releases.html'
  },
  // Custom components (dependency injection)
  parser: new ReleaseParser(),
  htmlRenderer: new HtmlRenderer(),
  tagGenerator: new TagGenerator()
});

// Process changelog
const result = await service.processChangelog();

// Get statistics
const stats = await service.getStatistics();

// Validate configuration
const errors = service.validateConfiguration();
```

#### API Response Format

```javascript
// processChangelog() returns:
{
  success: boolean,
  message: string,
  stats: {
    totalReleases: number,
    changelogFile: string,
    htmlFile: string
  }
}

// getStatistics() returns:
{
  totalReleases: number,
  sectionCounts: {
    added: number,
    changed: number,
    fixed: number,
    // ... other sections
  },
  latestVersion: string,
  oldestVersion: string
}
```

## 🎨 Customization

### Custom Templates

Create your own HTML template by copying `templates/default.html` and modifying it:

```javascript
const service = new ChangelogService({
  config: {
    changelogFile: 'CHANGELOG.md',
    htmlFile: 'changelog.html',
    templateFile: 'my-template.html' // Custom template
  }
});
```

### Template Variables

Templates support these variables:
- `{{TITLE}}` - Project title
- `{{AUTHOR}}` - Author name
- `{{CHANGELOG_CONTENT}}` - Rendered changelog content
- `{{GENERATED_DATE}}` - ISO date string
- `{{GENERATED_DATE_FORMATTED}}` - Formatted date

### Custom Badge Styles

Override badge styles by modifying the CSS in your template:

```css
.badge-custom { 
  @apply text-purple-700 bg-gradient-to-br from-purple-200 to-purple-100; 
}
```

## 🏗️ Architecture

Changelog Pro follows clean architecture principles:

```
lib/
├── changelog-service.js     # Main orchestration service
├── release-parser.js        # Markdown parsing logic
├── description-formatter.js # Text formatting utilities  
├── tag-generator.js         # Badge/tag generation
├── html-renderer.js         # HTML template rendering
├── file-handler.js          # File I/O operations
└── tokenizer.js            # Text tokenization utilities
```

### Core Components

- **ChangelogService** - Main service orchestrating the pipeline
- **ReleaseParser** - Parses markdown into structured release data
- **HtmlRenderer** - Renders HTML from templates and data
- **TagGenerator** - Generates HTML badges from markdown badges
- **DescriptionFormatter** - Formats and cleans text content
- **FileHandler** - Handles file reading/writing operations

## 🧪 Testing

```bash
# Run tests
npm test

# Test CLI commands
changelog-pro generate --init
changelog-pro stats
```

## 📝 Examples

Check out the `examples/` directory for complete usage examples:

- **Basic Usage** (`examples/basic/`) - Simple changelog generation
- **Advanced Usage** (`examples/advanced/`) - Custom templates and configuration
- **Integration** (`examples/integration/`) - Using in build pipelines

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/changelog-pro/changelog-pro)
- [npm Package](https://www.npmjs.com/package/changelog-pro)
- [Issue Tracker](https://github.com/changelog-pro/changelog-pro/issues)
- [Documentation](https://github.com/changelog-pro/changelog-pro#readme)

## 🙏 Acknowledgments

- Inspired by clean architecture principles
- Built with modern JavaScript and Node.js
- Styled with Tailwind CSS for beautiful HTML output

---

Made with ❤️ by the Changelog Pro team 