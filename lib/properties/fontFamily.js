"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  if (v === "") {
    return v;
  }
  if (v === "undefined") {
    return;
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
    if (/^\s*(?:[a-z\d\s-]+)\s*$/i.test(i)) {
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
  v = parsers.prepareValue(v);
  if (v === "") {
    return true;
  }
  return typeof parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v);
    this._setProperty("font-family", parse(v));
  },
  get() {
    return this.getPropertyValue("font-family");
  },
  enumerable: true,
  configurable: true
};
