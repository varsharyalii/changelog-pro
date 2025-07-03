# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2025-01-03

### Changed
- Made `generate` command explicit instead of default action
- Improved CLI help and user experience
- Show helpful guidance when no command provided

### Fixed
- Repository URLs in package.json
- Confusing default CLI behavior

## [1.2.0] - 2025-01-02

### Added
- Interactive version tags with copy-to-clipboard functionality
- Hover tooltips showing npm install commands
- Stable release tags for production versions

### Changed
- Enhanced timeline design with better spacing
- Improved color scheme for section badges

### Fixed
- Bug fix color scheme (yellow instead of red)
- Template loading and file path issues

## [1.1.0] - 2025-01-02

### Added
- Professional timeline design with gradient badges
- Live preview server with hot reloading
- Section grouping to avoid duplicate labels

### Fixed
- Resolved URL.parse() deprecation warnings
- Template variable replacement issues

## [1.0.0] - 2025-01-02

### Added
- Beautiful HTML changelog generation from markdown
- CLI commands: generate, init, preview, stats
- Support for semantic versioning
- Responsive design with mobile support

### Security
- Input validation for markdown parsing
- Safe HTML generation