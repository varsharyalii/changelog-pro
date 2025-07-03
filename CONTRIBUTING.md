# Contributing to Changelog Pro

We're building the best npm tool for changelog generation, and we'd love your help! This guide will help you contribute effectively.

## 🎯 Project Goals

- **Developer Experience First**: Zero-config defaults, deep customization options
- **Professional Quality**: Performance, reliability, and comprehensive testing
- **Ecosystem Integration**: Works seamlessly with existing dev workflows

## 🚀 Quick Start

```bash
# Fork and clone the repo
git clone https://github.com/your-username/changelog-pro.git
cd changelog-pro

# Install dependencies
npm install

# Run tests
npm test

# Try the CLI locally
node bin/changelog-pro --help
```

## 📋 Development Process

### 1. Before You Start

- Check existing [issues](https://github.com/changelog-pro/changelog-pro/issues) and [pull requests](https://github.com/changelog-pro/changelog-pro/pulls)
- For major features, open an issue first to discuss the approach
- For bugs, include reproduction steps and environment details

### 2. Making Changes

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Add tests for new functionality
# Update documentation if needed

# Test everything
npm test
npm run lint

# Commit with conventional commit format
git commit -m "feat: add watch mode for development"
```

### 3. Submitting Changes

- Open a pull request with a clear description
- Include tests for new functionality
- Update documentation for user-facing changes
- Ensure all CI checks pass

## 🧪 Testing Guidelines

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

### Test Structure

```javascript
// Use descriptive test names
describe("ReleaseParser", () => {
  describe("when parsing version headers", () => {
    it('should extract version from "## 1.0.0 (2025-01-01)" format', () => {
      // Arrange
      const markdown = "## 1.0.0 (2025-01-01)";

      // Act
      const result = parser.parseVersionHeader(markdown);

      // Assert
      expect(result.version).toBe("1.0.0");
      expect(result.date).toBe("2025-01-01");
    });
  });
});
```

### Coverage Requirements

- **Minimum 90% coverage** for all new code
- **100% coverage** for critical parsing logic
- **Edge cases** must be tested (empty files, malformed input, etc.)

## 📝 Code Standards

### TypeScript Usage

```typescript
// Use strict types, avoid 'any'
interface ReleaseData {
  version: string;
  date: string;
  sections: Record<string, ChangelogEntry[]>;
}

// Document public APIs
/**
 * Parse changelog markdown into structured release data
 * @param markdown - Raw changelog content
 * @returns Array of parsed releases
 * @throws {ParseError} When markdown format is invalid
 */
export function parseChangelog(markdown: string): ReleaseData[] {
  // Implementation
}
```

### Error Handling

```javascript
// Good: User-friendly CLI errors
throw new CliError(
  "Parse Error: Invalid version format on line 15",
  "Expected: ## 1.0.0 (2025-01-01)",
  "Found: ## Version 1.0.0",
  "https://changelog-pro.dev/formats#versions",
);

// Avoid: Technical errors in user output
throw new Error("Invalid releases data");
```

### Performance Guidelines

- **CLI startup**: Keep imports lazy-loaded
- **Large files**: Stream processing for 1000+ entries
- **Memory usage**: Clean up resources, avoid memory leaks
- **Bundle size**: Minimize dependencies

## 🎨 User Experience Standards

### CLI Design Principles

```bash
# ✅ Good: Simple, memorable commands
changelog build
changelog serve --watch
changelog init

# ❌ Avoid: Complex, forgettable syntax
changelog-pro generate-html --input=file.md --output=file.html
```

### Error Message Format

```bash
❌ Parse Error: CHANGELOG.md line 15
   Expected: ## 1.0.0 (2025-01-01)
   Found:    ## Version 1.0.0

💡 Fix: Use semantic version format with date
📖 Guide: https://changelog-pro.dev/formats#versions
🔍 Debug: Run with --debug for detailed parsing info
```

### Progress Feedback

```bash
🔄 Parsing changelog...
📋 Found 25 releases
🎨 Applying theme: professional
✅ Generated changelog.html (142kb)
```

## 🛠 Architecture Guidelines

### Module Organization

```
lib/
├── parsers/          # Input format parsers
│   ├── markdown.js   # Standard markdown parsing
│   ├── git.js        # Git commit parsing
│   └── conventional.js # Conventional commits
├── formatters/       # Output formatters
│   ├── html.js       # HTML generation
│   ├── json.js       # JSON API export
│   └── rss.js        # RSS feed generation
├── themes/           # Built-in themes
├── plugins/          # Plugin system
└── core/             # Core functionality
    ├── changelog-service.js
    ├── file-handler.js
    └── config-manager.js
```

### Plugin Architecture

```javascript
// Plugins should follow this interface
interface ChangelogPlugin {
  name: string;
  version: string;
  apply(api: PluginAPI): void;
}

// Example plugin
export const customThemePlugin: ChangelogPlugin = {
  name: 'custom-theme',
  version: '1.0.0',
  apply(api) {
    api.addTheme('corporate', corporateTheme);
    api.addFormatter('slack', slackFormatter);
  }
};
```

## 📚 Documentation Standards

### README Updates

When adding features, update the README with:

- **Quick example** of the new functionality
- **Configuration options** if applicable
- **Integration examples** for popular workflows

### JSDoc Comments

````javascript
/**
 * Generate HTML changelog from markdown source
 *
 * @param {Object} options - Configuration options
 * @param {string} options.input - Path to markdown changelog
 * @param {string} options.output - Path for HTML output
 * @param {string} [options.theme='default'] - Theme name
 * @param {Object} [options.customVars] - Template variables
 *
 * @returns {Promise<GenerationResult>} Generation statistics and output info
 *
 * @throws {FileNotFoundError} When input file doesn't exist
 * @throws {ParseError} When markdown format is invalid
 *
 * @example
 * ```javascript
 * const result = await generate({
 *   input: 'CHANGELOG.md',
 *   output: 'docs/changelog.html',
 *   theme: 'professional'
 * });
 * console.log(`Generated ${result.entriesCount} changelog entries`);
 * ```
 */
````

## 🎯 Feature Development

### Phase 1 Priority Features

1. **Configuration System**
   - `changelog.config.js` support
   - Environment variable configuration
   - CLI flag overrides

2. **Development Workflow**
   - Watch mode with live reload
   - Local preview server
   - Hot reload for templates

3. **Better CLI UX**
   - Progress indicators
   - Verbose/debug modes
   - Comprehensive help system

### Adding New Themes

```javascript
// themes/corporate.js
export const corporateTheme = {
  name: "corporate",
  template: "corporate.html",
  styles: {
    primaryColor: "#1f2937",
    accentColor: "#3b82f6",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  components: {
    versionBadge: "professional",
    changelogEntry: "detailed",
  },
};
```

### Adding New Parsers

```javascript
// parsers/conventional-commits.js
export class ConventionalCommitsParser extends BaseParser {
  parse(commits) {
    return commits
      .filter((commit) => this.isConventional(commit.message))
      .map((commit) => this.parseCommitMessage(commit))
      .groupBy((change) => change.version);
  }
}
```

## 🔄 Release Process

### Version Management

- Follow [Semantic Versioning](https://semver.org/)
- Update CHANGELOG.md with every release
- Use conventional commit messages for automated versioning

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] npm publish
- [ ] GitHub release created
- [ ] Examples updated if needed

## 💬 Community

### Getting Help

- **Questions**: Open a [GitHub Discussion](https://github.com/changelog-pro/changelog-pro/discussions)
- **Bugs**: Create an [Issue](https://github.com/changelog-pro/changelog-pro/issues)
- **Ideas**: Start a discussion or RFC issue

### Code of Conduct

We're committed to providing a welcoming and inspiring community for all. Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🏆 Recognition

Contributors who make significant improvements will be:

- Added to the README contributors section
- Mentioned in release notes
- Invited to join the core team for ongoing contributors

---

**Remember**: We're building the Prettier of changelog tools. Every contribution should make the developer experience better!

Thank you for contributing to Changelog Pro! 🚀
