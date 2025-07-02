#!/usr/bin/env node

/**
 * Changelog Generator - Spinal-inspired approach
 * Converts markdown with [badge] syntax to styled HTML
 * 
 * Usage: node tools/changelog/changelog-generator.js
 */

const fs = require('fs');
const path = require('path');

// Badge definitions - inspired by Spinal CMS approach
const BADGES = {
  // Change types
  'new': { label: 'New', class: 'badge-new', color: 'text-green-700 bg-gradient-to-br from-green-200 to-green-100' },
  'improvement': { label: 'Improvement', class: 'badge-improvement', color: 'text-indigo-700 bg-gradient-to-br from-indigo-200 to-indigo-100' },
  'bugfix': { label: 'Bugfix', class: 'badge-bugfix', color: 'text-red-700 bg-gradient-to-br from-red-200 to-red-100' },
  'breaking': { label: 'Breaking Change', class: 'badge-breaking', color: 'text-red-700 bg-gradient-to-br from-red-200 to-red-100' },
  
  // Release types
  'beta': { label: 'Beta', class: 'badge-beta', color: 'text-purple-700 bg-gradient-to-br from-purple-200 to-purple-100' },
  'alpha': { label: 'Alpha', class: 'badge-alpha', color: 'text-red-700 bg-gradient-to-br from-red-200 to-red-100' },
  'lts': { label: 'LTS', class: 'badge-lts', color: 'text-yellow-700 bg-gradient-to-br from-yellow-200 to-yellow-100' },
  
  // Status types
  'warning': { label: 'Warning', class: 'badge-warning', color: 'text-yellow-700 bg-gradient-to-br from-yellow-200 to-yellow-100' },
  'unstable': { label: 'Unstable', class: 'badge-unstable', color: 'text-orange-700 bg-gradient-to-br from-orange-200 to-orange-100' },
  'deprecated': { label: 'Deprecated', class: 'badge-deprecated', color: 'text-gray-700 bg-gradient-to-br from-gray-200 to-gray-100' }
};

// Version type classification
const VERSION_TYPES = {
  major: { class: 'version-major', color: '#fee2e2', textColor: '#dc2626' },
  minor: { class: 'version-minor', color: '#dbeafe', textColor: '#2563eb' },
  patch: { class: 'version-patch', color: '#dcfce7', textColor: '#16a34a' }
};

/**
 * Determine version type from version string
 */
function getVersionType(version) {
  const versionMatch = version.match(/^v?(\d+)\.(\d+)\.(\d+)/);
  if (!versionMatch) return 'minor';
  
  const [, major, minor, patch] = versionMatch;
  
  if (major === '0') {
    return minor === '0' ? 'patch' : 'minor';
  }
  
  return 'major';
}

/**
 * Transform markdown badges to HTML - Spinal CMS inspired
 */
function transformBadges(content) {
  const badgeRegex = /\[(\w+)\]\s*/g;
  
  return content.replace(badgeRegex, (match, badgeType) => {
    const badge = BADGES[badgeType.toLowerCase()];
    
    if (!badge) {
      console.warn(`Unknown badge type: [${badgeType}]`);
      return match; // Return original if badge not found
    }
    
    return `<span class="inline-block px-2 py-1 text-sm font-medium leading-none ${badge.color} rounded-full mb-2">${badge.label}</span>\n`;
  });
}

/**
 * Generate version badge HTML
 */
function generateVersionBadge(version, releaseChannel = null) {
  const versionType = getVersionType(version);
  const versionClass = VERSION_TYPES[versionType].class;
  
  let releaseTag = '';
  if (releaseChannel) {
    const channelClass = releaseChannel === 'lts' ? 'release-lts' : 
                        releaseChannel === 'beta' ? 'release-beta' : 
                        releaseChannel === 'alpha' ? 'release-alpha' : '';
    
    releaseTag = `<span class="release-tag ${channelClass}">${releaseChannel.toUpperCase()}</span>`;
  }
  
  const installCommand = releaseChannel && releaseChannel !== 'lts' ? 
    `@agentchat/core@${version}-${releaseChannel}` : 
    `@agentchat/core@${version}`;
    
  const angularCommand = releaseChannel && releaseChannel !== 'lts' ? 
    `@agentchat/angular@${version}-${releaseChannel}` : 
    `@agentchat/angular@${version}`;
  
  return `
    <span class="version-badge ml-3 inline-block px-2 py-1 text-xs font-semibold ${versionClass} rounded-full align-middle">
      ${version}${releaseTag}
      <div class="tooltip">
        npm install ${installCommand}<br>
        npm install ${angularCommand}
        <span class="copy-btn" onclick="copyToClipboard('npm install ${installCommand} ${angularCommand}')">Copy</span>
      </div>
    </span>
  `;
}

/**
 * Sample changelog data structure
 */
const sampleChangelog = {
  releases: [
    {
      version: "v1.0.0",
      date: "2023-03-07",
      channel: "lts",
      changes: [
        "[breaking] Major API restructure - requires migration guide",
        "[new] Complete rewrite with improved performance and TypeScript support",
        "[improvement] Enhanced error handling with detailed stack traces"
      ]
    },
    {
      version: "v0.33.0", 
      date: "2023-02-17",
      channel: null,
      changes: [
        "[new] Added multi-language support with 15 new languages",
        "[new] Introduced new onboarding flow with interactive tutorials",
        "[improvement] Streamlined user interface for better UX"
      ]
    },
    {
      version: "v0.32.1",
      date: "2023-02-10", 
      channel: null,
      changes: [
        "[bugfix] Fixed memory leak in chat message handling",
        "[bugfix] Resolved authentication timeout issues on slow networks",
        "[improvement] Optimized bundle size by 15%"
      ]
    },
    {
      version: "v0.32.0",
      date: "2023-01-28",
      channel: "beta", 
      changes: [
        "[beta] Experimental voice message feature (testing phase)",
        "[warning] Not recommended for production use - API may change",
        "[new] Added WebRTC support for real-time communication"
      ]
    },
    {
      version: "v0.31.0",
      date: "2023-01-15",
      channel: "alpha",
      changes: [
        "[alpha] Early preview of AI-powered message suggestions", 
        "[unstable] Highly experimental - expect breaking changes and bugs",
        "[new] Initial machine learning integration"
      ]
    }
  ]
};

/**
 * Generate HTML changelog from data
 */
function generateChangelog(data) {
  const releases = data.releases.map(release => {
    const versionBadge = generateVersionBadge(release.version, release.channel);
    const transformedChanges = release.changes.map(change => {
      const transformed = transformBadges(change);
      const textContent = change.replace(/\[\w+\]\s*/, '');
      return `${transformed}<p class="text-gray-700 mb-4">${textContent}</p>`;
    }).join('\n        ');
    
    return `
      <li class="flex flex-col items-start mt-20 md:flex-row">
        <h3 class="flex items-center w-full mb-3 space-x-3 md:w-1/3">
          <span class="z-10 hidden block w-5 h-5 bg-white border-4 border-gray-300 rounded-full md:block"></span>
          <time datetime="${release.date}" class="text-xl font-semibold tracking-tight text-gray-800">${new Date(release.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
          ${versionBadge}
        </h3>
        <div class="w-full space-y-2 md:w-2/3">
          ${transformedChanges}
        </div>
      </li>
    `;
  }).join('\n');

  return `<!doctype html>
<html lang="en" class="font-sans">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Agent Chatbot MFE - Changelog</title>
  <meta name="description" content="Changelog for Agent Chatbot MFE packages">
  <meta name="author" content="Agent Chatbot Team">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .version-badge {
      position: relative;
      cursor: pointer;
    }
    .tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      color: white;
      padding: 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
      z-index: 1000;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: #1f2937;
    }
    .version-badge:hover .tooltip {
      opacity: 1;
      visibility: visible;
    }
    .copy-btn {
      margin-left: 8px;
      padding: 2px 6px;
      background: #374151;
      border-radius: 4px;
      font-size: 10px;
      cursor: pointer;
    }
    .copy-btn:hover {
      background: #4b5563;
    }
    
    /* Version Type Badges */
    .version-major { background: #fee2e2; color: #dc2626; } /* Red for breaking changes */
    .version-minor { background: #dbeafe; color: #2563eb; } /* Blue for features */
    .version-patch { background: #dcfce7; color: #16a34a; } /* Green for bugfixes */
    
    /* Release Channel Badges */
    .release-lts { 
      background: linear-gradient(135deg, #fbbf24, #f59e0b); 
      color: white; 
      font-weight: bold;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .release-beta { 
      background: linear-gradient(135deg, #8b5cf6, #7c3aed); 
      color: white; 
      animation: pulse 2s infinite;
    }
    .release-alpha { 
      background: linear-gradient(135deg, #ef4444, #dc2626); 
      color: white; 
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    
    .release-tag {
      margin-left: 6px;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <section class="w-full max-w-5xl px-2 py-6 md:py-12 mx-auto text-center">
    <h1 class="text-3xl font-bold">
      Changelog
    </h1>
    <p class="mt-3 text-xl text-gray-600 md:text-2xl">
      Find all the new features, improvements and bugfixes here.
    </p>
    <p class="mt-2 text-sm text-gray-500">
      Hover over version badges to see installation commands
    </p>
    <p class="mt-1 text-xs text-gray-400">
      Generated from markdown using [badge] syntax
    </p>
  </section>
  <section class="px-2 py-12 md:mt-12 bg-gradient-to-b from-gray-50 to-white">
    <ul class="relative w-full max-w-5xl mx-auto">
      <span class="absolute bottom-0 left-0 hidden w-1 rounded bg-gray-200/60 top-3 translate-x-2 md:block" aria-hidden="true"></span>
      ${releases}
    </ul>
  </section>

  <script>
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(function() {
        console.log('Copied to clipboard:', text);
        
        // Optional: Add toast notification
        const toast = document.createElement('div');
        toast.textContent = 'Copied to clipboard!';
        toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:8px 16px;border-radius:8px;z-index:9999;font-size:14px;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      }, function(err) {
        console.error('Could not copy text: ', err);
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Main execution
 */
function main() {
  try {
    // Ensure directory exists
    const toolsDir = path.dirname(__filename);
    if (!fs.existsSync(toolsDir)) {
      fs.mkdirSync(toolsDir, { recursive: true });
    }
    
    // Generate changelog
    const html = generateChangelog(sampleChangelog);
    
    // Write to public directory
    const outputPath = path.join(process.cwd(), 'public', 'changelog.html');
    fs.writeFileSync(outputPath, html, 'utf8');
    
    console.log('✅ Changelog generated successfully!');
    console.log(`📁 Output: ${outputPath}`);
    console.log('\n🎯 Spinal-inspired features:');
    console.log('  • [new] [bugfix] [improvement] markdown syntax');
    console.log('  • Automatic badge transformation');
    console.log('  • Semantic version detection');
    console.log('  • Release channel support (LTS, Beta, Alpha)');
    console.log('  • Copy-to-clipboard npm commands');
    
    // Create sample changelog markdown for reference
    const markdownSample = `# Changelog Data Format

## Example Release Entry:
\`\`\`javascript
{
  version: "v1.2.3",
  date: "2023-12-01", 
  channel: "lts", // or "beta", "alpha", null
  changes: [
    "[new] Added amazing new feature",
    "[bugfix] Fixed critical security issue", 
    "[improvement] Enhanced performance by 50%",
    "[breaking] Changed API structure - migration required"
  ]
}
\`\`\`

## Available Badge Types:
- [new] - New features
- [improvement] - Enhancements
- [bugfix] - Bug fixes
- [breaking] - Breaking changes
- [beta] - Beta features
- [alpha] - Alpha features
- [warning] - Warnings
- [unstable] - Unstable features
- [deprecated] - Deprecated features

## Release Channels:
- \`lts\` - Long Term Support (gold badge)
- \`beta\` - Beta release (purple, pulsing)
- \`alpha\` - Alpha release (red, pulsing)
- \`null\` - Stable release (no special tag)
`;
    
    const readmePath = path.join(toolsDir, 'README.md');
    fs.writeFileSync(readmePath, markdownSample, 'utf8');
    console.log(`📚 Documentation: ${readmePath}`);
    
  } catch (error) {
    console.error('❌ Error generating changelog:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateChangelog,
  transformBadges,
  generateVersionBadge,
  BADGES,
  VERSION_TYPES
}; 