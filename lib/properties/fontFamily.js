"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  }
  const keywords = ["serif", "sans-serif", "system-ui", "cursive", "fantasy", "monospace"];
  const val = parsers.splitValue(v, {
    delimiter: ","
  });
  const font = [];
  let valid = false;
  for (const i of val) {
    const str = parsers.parseString(i);
    if (str) {
      font.push(str);
      valid = true;
      continue;
    }
    const key = parsers.parseKeyword(i, keywords);
    if (key) {
      font.push(key);
      valid = true;
      continue;
    }
    // This implementation does not strictly follow the specification. The spec
    // does not require the first letter of the font-family to be capitalized.
    // Also, unquoted font-family names are not restricted to ASCII only.
    // However, in the real world, the first letter of the ASCII font-family
    // names are always capitalized, and unquoted font-family names do not
    // contain spaces, e.g. `Times`, and AFAIK, non-ASCII font-family names are
    // always quoted even without spaces, e.g. `"メイリオ"`.
    // Therefore, it is unlikely that this implementation will cause problems.
    // @see https://drafts.csswg.org/css-fonts/#font-family-prop
    if (/^\s*(?:[A-Z][A-Za-z\d\s-]+)\s*$/.test(i)) {
      font.push(i.trim());
      valid = true;
      continue;
    }
    if (!valid) {
      return;
    }
  }
  return font.join(", ");
};

module.exports.isValid = function isValid(v) {
  if (v === "") {
    return true;
  }
  return typeof module.exports.parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("font", "");
      this._setProperty("font-family", v);
    } else {
      this._setProperty("font-family", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("font-family");
  },
  enumerable: true,
  configurable: true
};
