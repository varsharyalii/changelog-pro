/**
 * Preview Command
 * Professional live preview server with modern APIs
 */

const http = require('http');
const fs = require('fs/promises');
const { existsSync } = require('fs');
const { ChangelogService } = require('../../../lib/changelog-service');
const { ChangelogError } = require('../utils/errors');

/**
 * Start live preview server
 * @param {Object} options - Command options
 * @param {string} options.input - Input markdown file
 * @param {number} options.port - Server port
 */
async function previewCommand(options) {
  const changelogFile = options.input || 'CHANGELOG.md';
  const port = parseInt(options.port) || 3000;
  
  console.log('🌐 Starting changelog preview server...');
  
  // Check if changelog exists
  if (!existsSync(changelogFile)) {
    throw new ChangelogError(
      `Changelog file not found: ${changelogFile}\n💡 Run "changelog-pro init" to create a sample changelog`,
      'FILE_NOT_FOUND'
    );
  }

  let lastModified = (await fs.stat(changelogFile)).mtime;
  let previewContent = null;

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    
    try {
      if (url.pathname === '/' || url.pathname === '/index.html') {
        // Serve the changelog HTML
        previewContent = await generatePreviewContent(changelogFile);
        const html = getPreviewHTML(previewContent);
        
        res.writeHead(200, { 
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.end(html);
        
      } else if (url.pathname === '/api/check') {
        // Check for file changes
        const currentModified = (await fs.stat(changelogFile)).mtime;
        const hasChanged = currentModified > lastModified;
        
        if (hasChanged) {
          lastModified = currentModified;
        }
        
        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        });
        res.end(JSON.stringify({ changed: hasChanged }));
        
      } else {
        // 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    } catch (error) {
      console.error('Server error:', error.message);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(getErrorHTML(error.message));
    }
  });

  return new Promise((resolve, reject) => {
    server.listen(port, (error) => {
      if (error) {
        reject(new ChangelogError(`Failed to start server: ${error.message}`, 'SERVER_ERROR'));
        return;
      }

      console.log('✅ Preview server running at:');
      console.log(`   🌐 http://localhost:${port}`);
      console.log(`   📱 Mobile: http://localhost:${port}`);
      console.log('');
      console.log('🔄 Watching for changes...');
      console.log(`📝 Edit ${changelogFile} and see live updates!`);
      console.log('');
      console.log('💡 Press Ctrl+C to stop');

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n👋 Shutting down preview server...');
        server.close(() => {
          console.log('✅ Server stopped');
          resolve();
        });
      });
    });
  });
}

/**
 * Generate changelog content for preview
 */
async function generatePreviewContent(changelogFile) {
  try {
    const service = new ChangelogService({
      config: {
        changelogFile: changelogFile,
        htmlFile: '.preview-temp.html'
      }
    });
    
    await service.processChangelog();
    const content = await fs.readFile('.preview-temp.html', 'utf8');
    
    // Clean up temp file
    if (existsSync('.preview-temp.html')) {
      await fs.unlink('.preview-temp.html');
    }
    
    return content;
  } catch (error) {
    return getErrorHTML(error.message);
  }
}

/**
 * Get preview HTML with live reload script
 */
function getPreviewHTML(content) {
  if (!content) {
    return getErrorHTML('No content generated yet');
  }

  // Inject live reload script (XSS-safe)
  const liveReloadScript = `
  <script>
    // Live reload functionality
    function checkForChanges() {
      fetch('/api/check?t=' + Date.now())
        .then(res => res.json())
        .then(data => {
          if (data.changed) {
            console.log('📝 Changelog updated, reloading...');
            window.location.reload();
          }
        })
        .catch(err => console.log('Connection lost:', err.message));
    }
    
    // Check every 1000ms (reduced frequency for better performance)
    setInterval(checkForChanges, 1000);
    
    // Add visual indicator
    const indicator = document.createElement('div');
    indicator.textContent = '🔄 Live Preview';
    indicator.style.cssText = \`
      position: fixed;
      top: 10px;
      right: 10px;
      background: #16a34a;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      font-family: system-ui, -apple-system, sans-serif;
    \`;
    document.body.appendChild(indicator);
  </script>`;

  return content.replace('</body>', liveReloadScript + '</body>');
}

/**
 * Get error HTML for preview (XSS-safe)
 */
function getErrorHTML(errorMessage) {
  // Escape HTML to prevent XSS
  const escapedMessage = errorMessage
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Changelog Preview - Error</title>
    <style>
      body { 
        font-family: system-ui, -apple-system, sans-serif; 
        max-width: 600px; 
        margin: 50px auto; 
        padding: 20px; 
        line-height: 1.6;
      }
      .error { 
        background: #fee2e2; 
        border: 1px solid #fca5a5; 
        padding: 20px; 
        border-radius: 8px; 
      }
      .error h1 { 
        color: #dc2626; 
        margin: 0 0 10px 0; 
        font-size: 1.25rem;
      }
      .error p { 
        color: #7f1d1d; 
        margin: 0; 
      }
    </style>
  </head>
  <body>
    <div class="error">
      <h1>❌ Preview Error</h1>
      <p>${escapedMessage}</p>
    </div>
  </body>
  </html>`;
}

module.exports = previewCommand; 