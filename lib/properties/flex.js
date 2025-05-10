"use strict";

var shorthandParser = require("../parsers").shorthandParser;
var shorthandSetter = require("../parsers").shorthandSetter;
var shorthandGetter = require("../parsers").shorthandGetter;

var shorthandFor = {
  "flex-grow": require("./flexGrow"),
  "flex-shrink": require("./flexShrink"),
  "flex-basis": require("./flexBasis")
};

module.exports.isValid = function isValid(v) {
  return shorthandParser(v, shorthandFor) !== undefined;
};

module.exports.definition = {
  set(v) {
    var setter = shorthandSetter("flex", shorthandFor);
    var normalizedValue = String(v).trim().toLowerCase();

    if (normalizedValue === "none") {
      setter.call(this, "0 0 auto");
      return;
    }
    if (normalizedValue === "initial") {
      setter.call(this, "0 1 auto");
      return;
    }
    if (normalizedValue === "auto") {
      this.removeProperty("flex-grow");
      this.removeProperty("flex-shrink");
      this.setProperty("flex-basis", normalizedValue);
      return;
    }
    setter.call(this, v);
  },
  get: shorthandGetter("flex", shorthandFor),
  enumerable: true,
  configurable: true
};
