/**
 * Markdown Tokenizer
 * Single Responsibility: Convert markdown text into structured tokens
 */
class MarkdownTokenizer {
  static TOKEN_TYPES = {
    HEADING: 'heading',
    LIST_ITEM: 'list_item',
    TEXT: 'text'
  };

  /**
   * Tokenize markdown into structured tokens
   * @param {string} markdown - Raw markdown content
   * @returns {Array<Token>} Array of tokens
   */
  tokenize(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      throw new Error('Invalid markdown input');
    }

    const lines = markdown.split('\n');
    const tokens = [];

    for (const line of lines) {
      const token = this._parseLine(line.trim());
      if (token) {
        tokens.push(token);
      }
    }

    return tokens;
  }

  /**
   * Parse a single line into a token
   * @private
   */
  _parseLine(line) {
    if (!line) return null;

    // Heading detection
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      return {
        type: MarkdownTokenizer.TOKEN_TYPES.HEADING,
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
        raw: line
      };
    }

    // List item detection
    const listMatch = line.match(/^[-*+]\s+(.+)$/);
    if (listMatch) {
      return {
        type: MarkdownTokenizer.TOKEN_TYPES.LIST_ITEM,
        text: listMatch[1].trim(),
        raw: line
      };
    }

    // Regular text
    return {
      type: MarkdownTokenizer.TOKEN_TYPES.TEXT,
      text: line,
      raw: line
    };
  }
}

module.exports = { MarkdownTokenizer }; 