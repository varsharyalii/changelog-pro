/**
 * Professional Spinner Utility
 * Provides loading feedback without external dependencies
 */

/**
 * Simple spinner for CLI feedback
 */
class Spinner {
  constructor(text = "Loading...") {
    this.text = text;
    this.isSpinning = false;
    this.interval = null;
    this.frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    this.frameIndex = 0;
  }

  start() {
    if (this.isSpinning) return;

    this.isSpinning = true;
    this.frameIndex = 0;

    // Hide cursor
    process.stdout.write("\x1B[?25l");

    this.interval = setInterval(() => {
      const frame = this.frames[this.frameIndex];
      process.stdout.write(`\r${frame} ${this.text}`);
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, 80);
  }

  succeed(text = null) {
    this.stop();
    const message = text || this.text;
    process.stdout.write(`\r✅ ${message}\n`);
  }

  fail(text = null) {
    this.stop();
    const message = text || this.text;
    process.stdout.write(`\r❌ ${message}\n`);
  }

  stop() {
    if (!this.isSpinning) return;

    this.isSpinning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    // Clear line and show cursor
    process.stdout.write("\r\x1B[K\x1B[?25h");
  }

  setText(text) {
    this.text = text;
  }
}

/**
 * Create a new spinner instance
 * @param {string} text - Loading text
 * @returns {Spinner} Spinner instance
 */
function createSpinner(text) {
  return new Spinner(text);
}

module.exports = {
  Spinner,
  createSpinner,
};
