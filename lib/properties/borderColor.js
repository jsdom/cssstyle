"use strict";

var parsers = require("../parsers");
var implicitSetter = require("../parsers").implicitSetter;

var parser = function (v) {
  var parsed = parsers.parseColor(v);
  if (parsed !== undefined) {
    return parsed;
  }
  if (parsers.valueType(v) === parsers.TYPES.KEYWORD && v.toLowerCase() === "inherit") {
    return v;
  }
  return undefined;
};

module.exports.isValid = function isValid(v) {
  return parser(v) !== undefined;
};
var isValid = module.exports.isValid;

module.exports.definition = {
  set: implicitSetter("border", "color", isValid, parser),
  get() {
    return this.getPropertyValue("border-color");
  },
  enumerable: true,
  configurable: true
};
