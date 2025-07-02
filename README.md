# Changelog Pro

A professional changelog generator that converts markdown changelogs into beautiful HTML with live preview capabilities.

## Overview

Changelog Pro is a command-line tool designed to help developers create and maintain beautiful, professional changelogs. It processes standard markdown changelog files and generates clean HTML output with customizable themes and real-time preview functionality.

## Features

- **Zero Configuration**: Works out of the box with sensible defaults
- **Live Preview**: Development server with auto-refresh for instant feedback
- **Professional Themes**: Multiple built-in themes for different project styles
- **Project Initialization**: Smart setup that detects your project structure
- **Statistics**: Detailed analytics about your changelog content
- **Modern Architecture**: Built with performance and maintainability in mind

## Installation

### Global Installation (Recommended)

```bash
npm install -g changelog-pro
```

### Local Installation

```bash
npm install --save-dev changelog-pro
```

## Quick Start

### Initialize a New Changelog

```bash
changelog-pro init
```

This creates a sample `CHANGELOG.md` file with proper formatting and generates an initial HTML output.

### Generate HTML Output

```bash
changelog-pro
```

By default, this processes `CHANGELOG.md` and creates `changelog.html` in your project root.

### Start Live Preview

```bash
changelog-pro preview
```

Opens a development server at `http://localhost:3000` with automatic reload when you edit your changelog.

## Command Reference

### `changelog-pro` (default)

Generates HTML from your markdown changelog.

```bash
changelog-pro [options]
```

**Options:**
- `--input, -i <file>`: Source markdown file (default: `CHANGELOG.md`)
- `--output, -o <file>`: Output HTML file (default: `changelog.html`)
- `--theme <name>`: Theme to use for HTML generation

### `changelog-pro init`

Creates a new changelog with sample content based on your project.

```bash
changelog-pro init [options]
```

**Options:**
- `--force`: Overwrite existing changelog file

### `changelog-pro preview`

Starts a development server for live editing.

```bash
changelog-pro preview [options]
```

**Options:**
- `--port, -p <number>`: Server port (default: `3000`)
- `--input, -i <file>`: Source markdown file to watch

### `changelog-pro stats`

Displays statistics about your changelog.

```bash
changelog-pro stats [options]
```

**Options:**
- `--input, -i <file>`: Source markdown file to analyze

## Changelog Format

Changelog Pro supports the [Keep a Changelog](https://keepachangelog.com/) format. Here's an example structure:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-01-02

### Added
- New feature for user authentication
- Support for multiple output formats

### Changed
- Improved error handling throughout the application
- Updated dependencies to latest versions

### Fixed
- Resolved issue with file parsing on Windows
- Fixed memory leak in preview server

## [1.1.0] - 2024-12-15

### Added
- Initial release functionality
```

## Themes

Changelog Pro includes several built-in themes:

- **default**: Clean, minimal design suitable for most projects
- **professional**: Corporate-friendly styling with enhanced typography
- **modern**: Contemporary design with subtle animations

## Configuration

Create a `changelog-pro.config.js` file in your project root for custom settings:

```javascript
module.exports = {
  input: 'CHANGELOG.md',
  output: 'docs/changelog.html',
  theme: 'professional',
  title: 'My Project Changelog',
  description: 'Track all changes and improvements'
};
```

## API Usage

You can also use Changelog Pro programmatically:

```javascript
const { ChangelogService } = require('changelog-pro');

const service = new ChangelogService();
const result = await service.generateChangelog('CHANGELOG.md', 'output.html');
console.log(`Generated changelog with ${result.releases.length} releases`);
```

## Development

### Prerequisites

- Node.js 14.0 or higher
- npm or yarn

### Setup

```bash
git clone https://github.com/varsharyalii/changelog-pro.git
cd changelog-pro
npm install
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of conduct
- Development workflow
- Pull request process
- Issue reporting guidelines

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes to this project.

## Support

- **Documentation**: Full documentation available in the [docs](docs/) directory
- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/varsharyalii/changelog-pro/issues)
- **Discussions**: Join the community on [GitHub Discussions](https://github.com/varsharyalii/changelog-pro/discussions)

---

Built with care by developers, for developers. 