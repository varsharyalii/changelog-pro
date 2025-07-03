/**
 * Professional Error Classes
 * Provides structured error handling for the CLI
 */

/**
 * Base error class for changelog-related errors
 */
class ChangelogError extends Error {
  constructor(message, code = "UNKNOWN_ERROR", originalError = null) {
    super(message);
    this.name = "ChangelogError";
    this.code = code;
    this.originalError = originalError;

    // Maintain proper stack trace (V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ChangelogError);
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage() {
    switch (this.code) {
      case "FILE_NOT_FOUND":
        return `${this.message}\n💡 Run "changelog-pro init" to create a sample changelog`;

      case "VALIDATION_ERROR":
        return `${this.message}\n💡 Use --init to create default files`;

      case "SERVER_ERROR":
        return `${this.message}\n💡 Try a different port with --port <number>`;

      case "PERMISSION_ERROR":
        return `${this.message}\n💡 Check file permissions or run with appropriate privileges`;

      default:
        return this.message;
    }
  }

  /**
   * Get exit code for different error types
   */
  getExitCode() {
    switch (this.code) {
      case "FILE_NOT_FOUND":
        return 2;
      case "VALIDATION_ERROR":
        return 3;
      case "SERVER_ERROR":
        return 4;
      case "PERMISSION_ERROR":
        return 5;
      default:
        return 1;
    }
  }
}

/**
 * File-related error
 */
class FileError extends ChangelogError {
  constructor(message, filePath, originalError = null) {
    super(message, "FILE_ERROR", originalError);
    this.filePath = filePath;
  }
}

/**
 * Network/Server-related error
 */
class ServerError extends ChangelogError {
  constructor(message, port = null, originalError = null) {
    super(message, "SERVER_ERROR", originalError);
    this.port = port;
  }
}

/**
 * Validation-related error
 */
class ValidationError extends ChangelogError {
  constructor(message, field = null, originalError = null) {
    super(message, "VALIDATION_ERROR", originalError);
    this.field = field;
  }
}

module.exports = {
  ChangelogError,
  FileError,
  ServerError,
  ValidationError,
};
