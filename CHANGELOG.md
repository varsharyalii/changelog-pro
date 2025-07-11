# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2025-07-03

### Fixed
- Named installCommand rendering now displays proper tab labels instead of "INSTALL"
- Installation commands show actual names (e.g., "core", "angular", "rust") as tabs
- Improved HTML escaping for installation command tooltips

## [1.4.1] - 2025-07-03

### Fixed
- Circular dependency issues between ChangelogService and ChangelogGenerator
- Duration calculation showing "undefinedms" instead of actual time
- Linting errors with unused imports
- Export/import mismatches causing test failures
- ConfigLoader instantiation issues

## [1.4.0] - 2025-07-03

### Added
- Smart install command labeling based on package manager type
- Runtime caching system for improved CI/CD pipeline performance

### Fixed
- Module resolution for config-loader
- Preview server memory management
- Template caching efficiency
- Circular dependency issues in ChangelogGenerator

## [1.3.0] - 2025-07-03

### Changed
- Made `generate` command explicit instead of default action
- Improved CLI help and user experience
- Show helpful guidance when no command provided

### Fixed
- Repository URLs in package.json
- Confusing default CLI behavior

## [1.2.0] - 2025-07-03

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

## [1.1.0] - 2025-07-03

### Added
- Professional timeline design with gradient badges
- Live preview server with hot reloading
- Section grouping to avoid duplicate labels

### Fixed
- Resolved URL.parse() deprecation warnings
- Template variable replacement issues

## [1.0.0] - 2025-07-03

### Added
- Beautiful HTML changelog generation from markdown
- CLI commands: generate, init, preview, stats
- Support for semantic versioning
- Responsive design with mobile support

### Security
- Input validation for markdown parsing
- Safe HTML generation
