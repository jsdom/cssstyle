"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  const parts = parsers.splitValue(v);
  if (!parts.length || parts.length > 2) {
    return;
  }
  const validKeywords = ["top", "center", "bottom"];
  switch (parts.length) {
    case 1: {
      const dim = parsers.parseMeasurement(parts[0]);
      if (dim) {
        return dim;
      }
      return parsers.parseKeyword(v, validKeywords);
    }
    case 2:
    default: {
      const [part1, part2] = parts;
      const val1 = parsers.parseKeyword(part1, validKeywords);
      const val2 = parsers.parseMeasurement(part2);
      if (val1 && val2) {
        return `${val1} ${val2}`;
      }
    }
  }
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
      this._setProperty("background", "");
      this._setProperty("background-position", "");
      this._setProperty("background-position-y", v);
    } else {
      this._setProperty("background-position-y", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("background-position-y");
  },
  enumerable: true,
  configurable: true
};
