/**
 * Preview Server
 * Handles live preview functionality with simple caching
 */
const http = require("http");
const { watch } = require("fs");
const cache = require('./utils/runtime-cache');

class PreviewServer {
  constructor(generator) {
    this.generator = generator;
    this.watcher = null;
  }

  /**
   * Start preview server
   * @param {Object} options - Server options
   * @returns {Promise<http.Server>} Server instance
   */
  async start(options) {
    const port = parseInt(options.port, 10);
    
    // Create server
    const server = http.createServer(async (req, res) => {
      try {
        await this._handleRequest(req, res, options);
      } catch (error) {
        this._sendError(res, error);
      }
    });

    // Setup file watching
    this._setupWatcher(options.input);

    // Start listening
    return new Promise((resolve, reject) => {
      server.listen(port, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(server);
      });

      // Cleanup on server close
      server.on('close', () => {
        if (this.watcher) {
          this.watcher.close();
          this.watcher = null;
        }
        cache.clearPreviewContent();
      });
    });
  }

  /**
   * Handle incoming request
   * @private
   */
  async _handleRequest(req, res, options) {
    const url = new URL(req.url, `http://localhost:${options.port}`);

    switch (url.pathname) {
      case "/":
      case "/index.html":
        await this._serveChangelog(res, options);
        break;

      case "/api/check":
        this._serveCheckStatus(res);
        break;

      default:
        this._send404(res);
    }
  }

  /**
   * Serve changelog HTML
   * @private
   */
  async _serveChangelog(res, options) {
    let content = cache.getPreviewContent();

    if (!content) {
      const result = await this.generator.generate({
        ...options,
        output: null, // Don't write to file in preview mode
      });

      if (result.success) {
        content = this._wrapWithLiveReload(result.html);
        cache.setPreviewContent(content);
      } else {
        throw new Error("Failed to generate changelog");
      }
    }

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    });
    res.end(content);
  }

  /**
   * Setup file watching
   * @private
   */
  _setupWatcher(filePath) {
    if (this.watcher) {
      this.watcher.close();
    }

    this.watcher = watch(filePath, () => {
      cache.clearPreviewContent();
    });
  }

  /**
   * Serve check status for live reload
   * @private
   */
  _serveCheckStatus(res) {
    const hasContent = cache.getPreviewContent() !== null;
    
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    });
    res.end(JSON.stringify({ changed: !hasContent }));
  }

  /**
   * Send error response
   * @private
   */
  _sendError(res, error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ 
      error: error.message,
      stack: process.env.DEBUG ? error.stack : undefined
    }));
  }

  /**
   * Send 404 response
   * @private
   */
  _send404(res) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }

  /**
   * Wrap HTML with live reload script
   * @private
   */
  _wrapWithLiveReload(html) {
    const script = `
      <script>
        // Simple live reload
        (function() {
          const CHECK_INTERVAL = 1000;
          
          function checkForChanges() {
            fetch('/api/check')
              .then(response => response.json())
              .then(data => {
                if (data.changed) {
                  console.log('📄 Changes detected, reloading...');
                  window.location.reload();
                }
              })
              .catch(error => {
                console.warn('Check failed:', error);
              });
          }

          // Start checking with fixed interval
          setInterval(checkForChanges, CHECK_INTERVAL);
          
          // Visual indicator
          const indicator = document.createElement('div');
          indicator.innerHTML = '🔄 Live Preview';
          indicator.style.cssText = \`
            position: fixed;
            top: 10px;
            right: 10px;
            background: #10b981;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            z-index: 9999;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          \`;
          document.body.appendChild(indicator);
        })();
      </script>
    `;

    return html.replace("</body>", `${script}</body>`);
  }
}

module.exports = PreviewServer; 