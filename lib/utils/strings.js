// Forked from https://github.com/jsdom/jsdom/blob/main/lib/jsdom/living/helpers/strings.js

"use strict";

// Regular expressions
const asciiWhitespaceRe = /^[\t\n\f\r ]$/;
const floatingPointNumRe = /^-?(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?$/;

/**
 * Converts a string to ASCII lowercase.
 *
 * @see https://infra.spec.whatwg.org/#ascii-lowercase
 * @param {string} s - The string to convert.
 * @returns {string} The converted string.
 */
function asciiLowercase(s) {
  if (!/[^\x00-\x7f]/.test(s)) {
    return s.toLowerCase();
  }
  const len = s.length;
  const out = new Array(len);
  for (let i = 0; i < len; i++) {
    const code = s.charCodeAt(i);
    // If the character is between 'A' (65) and 'Z' (90), convert using bitwise OR with 32
    out[i] = code >= 65 && code <= 90 ? String.fromCharCode(code | 32) : s[i];
  }
  return out.join("");
}

/**
 * Converts a string to ASCII uppercase.
 *
 * @see https://infra.spec.whatwg.org/#ascii-uppercase
 * @param {string} s - The string to convert.
 * @returns {string} The converted string.
 */
function asciiUppercase(s) {
  if (!/[^\x00-\x7f]/.test(s)) {
    return s.toUpperCase();
  }
  const len = s.length;
  const out = new Array(len);
  for (let i = 0; i < len; i++) {
    const code = s.charCodeAt(i);
    // If the character is between 'a' (97) and 'z' (122), convert using bitwise AND with ~32
    out[i] = code >= 97 && code <= 122 ? String.fromCharCode(code & ~32) : s[i];
  }
  return out.join("");
}

/**
 * Removes newlines from a string.
 *
 * @see https://infra.spec.whatwg.org/#strip-newlines
 * @param {string} s - The string to process.
 * @returns {string} The string with newlines removed.
 */
function stripNewlines(s) {
  return s.replace(/[\n\r]+/g, "");
}

/**
 * Strips leading and trailing ASCII whitespace from a string.
 *
 * @see https://infra.spec.whatwg.org/#strip-leading-and-trailing-ascii-whitespace
 * @param {string} s - The string to trim.
 * @returns {string} The trimmed string.
 */
function stripLeadingAndTrailingASCIIWhitespace(s) {
  return s.replace(/^[ \t\n\f\r]+/, "").replace(/[ \t\n\f\r]+$/, "");
}

/**
 * Strips and collapses ASCII whitespace in a string.
 * Replaces sequences of whitespace with a single space.
 *
 * @see https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
 * @param {string} s - The string to process.
 * @returns {string} The processed string.
 */
function stripAndCollapseASCIIWhitespace(s) {
  return s
    .replace(/[ \t\n\f\r]+/g, " ")
    .replace(/^[ \t\n\f\r]+/, "")
    .replace(/[ \t\n\f\r]+$/, "");
}

/**
 * Checks if a string is a valid simple color.
 *
 * @see https://html.spec.whatwg.org/multipage/infrastructure.html#valid-simple-colour
 * @param {string} s - The string to check.
 * @returns {boolean} True if the string is a valid simple color.
 */
function isValidSimpleColor(s) {
  return /^#[a-fA-F\d]{6}$/.test(s);
}

/**
 * Performs an ASCII case-insensitive match between two strings.
 *
 * @see https://infra.spec.whatwg.org/#ascii-case-insensitive
 * @param {string} a - The first string.
 * @param {string} b - The second string.
 * @returns {boolean} True if the strings match case-insensitively.
 */
function asciiCaseInsensitiveMatch(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; ++i) {
    if ((a.charCodeAt(i) | 32) !== (b.charCodeAt(i) | 32)) {
      return false;
    }
  }
  return true;
}

/**
 * Parses an integer from a string according to HTML rules.
 * Error is represented as null.
 *
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#rules-for-parsing-integers
 * @param {string} input - The input string.
 * @returns {number|null} The parsed integer or null if invalid.
 */
function parseInteger(input) {
  // The implementation here is slightly different from the spec's. We want to use parseInt(), but parseInt() trims
  // Unicode whitespace in addition to just ASCII ones, so we make sure that the trimmed prefix contains only ASCII
  // whitespace ourselves.
  const numWhitespace = input.length - input.trimStart().length;
  if (/[^\t\n\f\r ]/.test(input.slice(0, numWhitespace))) {
    return null;
  }
  // We don't allow hexadecimal numbers here.
  // eslint-disable-next-line radix
  const value = parseInt(input, 10);
  if (Number.isNaN(value)) {
    return null;
  }
  // parseInt() returns -0 for "-0". Normalize that here.
  return value === 0 ? 0 : value;
}

/**
 * Parses a non-negative integer from a string.
 * Error is represented as null.
 *
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#rules-for-parsing-non-negative-integers
 * @param {string} input - The input string.
 * @returns {number|null} The parsed non-negative integer or null if invalid.
 */
function parseNonNegativeInteger(input) {
  const value = parseInteger(input);
  if (value === null) {
    return null;
  }
  if (value < 0) {
    return null;
  }
  return value;
}

/**
 * Checks if a string represents a valid floating-point number.
 *
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-floating-point-number
 * @param {string} str - The string to check.
 * @returns {boolean} True if the string is a valid floating-point number.
 */
function isValidFloatingPointNumber(str) {
  return floatingPointNumRe.test(str);
}

/**
 * Parses a floating-point number from a string values.
 * Error is represented as null.
 *
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#rules-for-parsing-floating-point-number-values
 * @param {string} str - The string to parse.
 * @returns {number|null} The parsed number or null if invalid.
 */
function parseFloatingPointNumber(str) {
  // The implementation here is slightly different from the spec's. We need to use parseFloat() in order to retain
  // accuracy, but parseFloat() trims Unicode whitespace in addition to just ASCII ones, so we make sure that the
  // trimmed prefix contains only ASCII whitespace ourselves.
  const numWhitespace = str.length - str.trimStart().length;
  if (/[^\t\n\f\r ]/.test(str.slice(0, numWhitespace))) {
    return null;
  }
  const parsed = parseFloat(str);
  return isFinite(parsed) ? parsed : null;
}

/**
 * Splits a string on ASCII whitespace.
 *
 * @see https://infra.spec.whatwg.org/#split-on-ascii-whitespace
 * @param {string} str - The string to split.
 * @returns {string[]} The array of tokens.
 */
function splitOnASCIIWhitespace(str) {
  let position = 0;
  const tokens = [];
  while (position < str.length && asciiWhitespaceRe.test(str[position])) {
    position++;
  }
  if (position === str.length) {
    return tokens;
  }
  while (position < str.length) {
    const start = position;
    while (position < str.length && !asciiWhitespaceRe.test(str[position])) {
      position++;
    }
    tokens.push(str.slice(start, position));
    while (position < str.length && asciiWhitespaceRe.test(str[position])) {
      position++;
    }
  }
  return tokens;
}

/**
 * Splits a string on commas.
 *
 * @see https://infra.spec.whatwg.org/#split-on-commas
 * @param {string} str - The string to split.
 * @returns {string[]} The array of tokens.
 */
function splitOnCommas(str) {
  let position = 0;
  const tokens = [];
  while (position < str.length) {
    let start = position;
    while (position < str.length && str[position] !== ",") {
      position++;
    }
    let end = position;
    while (start < str.length && asciiWhitespaceRe.test(str[start])) {
      start++;
    }
    while (end > start && asciiWhitespaceRe.test(str[end - 1])) {
      end--;
    }
    tokens.push(str.slice(start, end));
    if (position < str.length) {
      position++;
    }
  }
  return tokens;
}

module.exports = {
  asciiWhitespaceRe,
  asciiLowercase,
  asciiUppercase,
  stripNewlines,
  stripLeadingAndTrailingASCIIWhitespace,
  stripAndCollapseASCIIWhitespace,
  isValidSimpleColor,
  asciiCaseInsensitiveMatch,
  parseInteger,
  parseNonNegativeInteger,
  isValidFloatingPointNumber,
  parseFloatingPointNumber,
  splitOnASCIIWhitespace,
  splitOnCommas
};
