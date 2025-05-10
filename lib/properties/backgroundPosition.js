"use strict";

var parsers = require("../parsers");

var parse = function parse(v) {
  if (v === "" || v === null) {
    return undefined;
  }
  var parts = v.split(/\s+/);
  if (parts.length > 2 || parts.length < 1) {
    return undefined;
  }
  var types = [];
  parts.forEach(function (part, index) {
    types[index] = parsers.valueType(part);
  });
  var validKeywords = ["top", "center", "bottom", "left", "right"];
  if (parts.length === 1) {
    if (types[0] === parsers.TYPES.LENGTH || types[0] === parsers.TYPES.PERCENT) {
      return v;
    }
    if (types[0] === parsers.TYPES.KEYWORD) {
      if (validKeywords.indexOf(v.toLowerCase()) !== -1 || v.toLowerCase() === "inherit") {
        return v;
      }
    }
    return undefined;
  }
  if (
    (types[0] === parsers.TYPES.LENGTH || types[0] === parsers.TYPES.PERCENT) &&
    (types[1] === parsers.TYPES.LENGTH || types[1] === parsers.TYPES.PERCENT)
  ) {
    return v;
  }
  if (types[0] !== parsers.TYPES.KEYWORD || types[1] !== parsers.TYPES.KEYWORD) {
    return undefined;
  }
  if (validKeywords.indexOf(parts[0]) !== -1 && validKeywords.indexOf(parts[1]) !== -1) {
    return v;
  }
  return undefined;
};

module.exports.isValid = function isValid(v) {
  return parse(v) !== undefined;
};

module.exports.definition = {
  set(v) {
    this._setProperty("background-position", parse(v));
  },
  get() {
    return this.getPropertyValue("background-position");
  },
  enumerable: true,
  configurable: true
};
