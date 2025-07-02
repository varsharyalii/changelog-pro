#!/usr/bin/env node

/**
 * Basic Tests for Changelog Pro
 * 
 * Simple test suite to verify core functionality works correctly.
 * This uses a minimal testing approach without external dependencies.
 */

const fs = require('fs');
const path = require('path');
const { ChangelogService, generate, getStats } = require('../index');

// Test configuration
const TEST_DIR = 'temp';
const TEST_CHANGELOG = 'test-changelog.md';
const TEST_HTML = 'test-output.html';

// Test data - updated to match the user's changelog format
const SAMPLE_CHANGELOG = `# Changelog

All notable changes to this project will be documented in this file.

## 1.0.0 (2024-01-01)

### Features

- **core**: Initial release with core functionality
- **ui**: Professional HTML generation with badge support

### Improvements

- **error-handling**: Enhanced error handling and validation

### Fixes

- **setup**: Resolved initial setup issues
`;

/**
 * Simple test runner
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('🧪 Running Changelog Pro Tests\n');

    // Setup test environment
    await this.setup();

    // Run all tests
    for (const test of this.tests) {
      try {
        console.log(`📝 ${test.name}...`);
        await test.fn();
        console.log(`✅ ${test.name} - PASSED\n`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name} - FAILED`);
        console.log(`   Error: ${error.message}\n`);
        this.failed++;
      }
    }

    // Cleanup
    await this.cleanup();

    // Report results
    this.report();
  }

  async setup() {
    // Create test directory
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }

    // Create sample changelog
    fs.writeFileSync(path.join(TEST_DIR, TEST_CHANGELOG), SAMPLE_CHANGELOG);
  }

  async cleanup() {
    // Remove test files
    const testHtmlPath = path.join(TEST_DIR, TEST_HTML);
    const testChangelogPath = path.join(TEST_DIR, TEST_CHANGELOG);
    
    if (fs.existsSync(testHtmlPath)) {
      fs.unlinkSync(testHtmlPath);
    }
    if (fs.existsSync(testChangelogPath)) {
      fs.unlinkSync(testChangelogPath);
    }
    if (fs.existsSync(TEST_DIR)) {
      fs.rmdirSync(TEST_DIR);
    }
  }

  report() {
    console.log('📊 Test Results:');
    console.log(`   Passed: ${this.passed}`);
    console.log(`   Failed: ${this.failed}`);
    console.log(`   Total:  ${this.tests.length}`);

    if (this.failed === 0) {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('\n💥 Some tests failed!');
      process.exit(1);
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  assertFileExists(filePath, message) {
    if (!fs.existsSync(filePath)) {
      throw new Error(message || `File does not exist: ${filePath}`);
    }
  }
}

// Create test runner
const runner = new TestRunner();

// Test 1: Basic module imports
runner.test('Module imports work correctly', async () => {
  runner.assert(typeof ChangelogService === 'function', 'ChangelogService should be a function');
  runner.assert(typeof generate === 'function', 'generate should be a function');
  runner.assert(typeof getStats === 'function', 'getStats should be a function');
});

// Test 2: ChangelogService instantiation
runner.test('ChangelogService can be instantiated', async () => {
  const service = new ChangelogService({
    config: {
      changelogFile: path.join(TEST_DIR, TEST_CHANGELOG),
      htmlFile: path.join(TEST_DIR, TEST_HTML)
    }
  });
  
  runner.assert(service instanceof ChangelogService, 'Should create ChangelogService instance');
});

// Test 3: Configuration validation
runner.test('Configuration validation works', async () => {
  const service = new ChangelogService({
    config: {
      changelogFile: path.join(TEST_DIR, TEST_CHANGELOG),
      htmlFile: path.join(TEST_DIR, TEST_HTML)
    }
  });
  
  const errors = service.validateConfiguration();
  runner.assertEqual(errors.length, 0, 'Should have no validation errors with valid config');
});

// Test 4: Generate function works
runner.test('Generate function produces output', async () => {
  const result = await generate({
    config: {
      changelogFile: path.join(TEST_DIR, TEST_CHANGELOG),
      htmlFile: path.join(TEST_DIR, TEST_HTML)
    }
  });
  
  runner.assert(result.success, 'Generate should succeed');
  runner.assert(result.stats, 'Result should include stats');
  runner.assert(result.stats.totalReleases > 0, 'Should find releases in test changelog');
  runner.assertFileExists(path.join(TEST_DIR, TEST_HTML), 'Should create HTML output file');
});

// Test 5: Statistics function works
runner.test('Statistics function returns data', async () => {
  const stats = await getStats({
    config: {
      changelogFile: path.join(TEST_DIR, TEST_CHANGELOG)
    }
  });
  
  runner.assert(stats.totalReleases > 0, 'Should return release count');
  runner.assert(typeof stats.latestVersion === 'string', 'Should return latest version');
  runner.assert(typeof stats.sectionCounts === 'object', 'Should return section counts');
});

// Test 6: HTML output contains expected content
runner.test('HTML output contains expected content', async () => {
  await generate({
    config: {
      changelogFile: path.join(TEST_DIR, TEST_CHANGELOG),
      htmlFile: path.join(TEST_DIR, TEST_HTML)
    }
  });
  
  const htmlContent = fs.readFileSync(path.join(TEST_DIR, TEST_HTML), 'utf8');
  
  runner.assert(htmlContent.includes('Changelog'), 'Should contain changelog title');
  runner.assert(htmlContent.includes('1.0.0'), 'Should contain version number');
  runner.assert(htmlContent.includes('Initial release'), 'Should contain changelog content');
});

// Test 7: Error handling for missing files
runner.test('Error handling for missing files', async () => {
  const service = new ChangelogService({
    config: {
      changelogFile: 'nonexistent.md',
      htmlFile: 'output.html'
    }
  });
  
  const errors = service.validateConfiguration();
  runner.assert(errors.length > 0, 'Should detect missing changelog file');
});

// Run all tests
if (require.main === module) {
  runner.run().catch(error => {
    console.error('💥 Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = TestRunner; 