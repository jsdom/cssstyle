"use strict";

const parsers = require("../parsers");

const parse = function parse(v) {
  if (v === "" || v === null) {
    return;
  }
  const parts = v.split(/\s+/);
  if (parts.length > 2 || parts.length < 1) {
    return;
  }
  const types = [];
  parts.forEach(function (part, index) {
    types[index] = parsers.valueType(part);
  });
  const validKeywords = ["top", "center", "bottom", "left", "right"];
  if (parts.length === 1) {
    if (types[0] === parsers.TYPES.LENGTH || types[0] === parsers.TYPES.PERCENT) {
      return v;
    }
    if (types[0] === parsers.TYPES.KEYWORD) {
      if (validKeywords.indexOf(v.toLowerCase()) !== -1 || v.toLowerCase() === "inherit") {
        return v;
      }
    }
    return;
  }
  if (
    (types[0] === parsers.TYPES.LENGTH || types[0] === parsers.TYPES.PERCENT) &&
    (types[1] === parsers.TYPES.LENGTH || types[1] === parsers.TYPES.PERCENT)
  ) {
    return v;
  }
  if (types[0] !== parsers.TYPES.KEYWORD || types[1] !== parsers.TYPES.KEYWORD) {
    return;
  }
  if (validKeywords.indexOf(parts[0]) !== -1 && validKeywords.indexOf(parts[1]) !== -1) {
    return v;
  }
};

module.exports.isValid = function isValid(v) {
  return parse(v) !== undefined;
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("background-position", parse(v));
  },
  get() {
    return this.getPropertyValue("background-position");
  },
  enumerable: true,
  configurable: true
};
