"use strict";

var shorthandParser = require("../parsers").shorthandParser;
var flexGrow = require("./flexGrow");
var flexShrink = require("./flexShrink");
var flexBasis = require("./flexBasis");

var shorthandFor = new Map([
  ["flex-grow", flexGrow],
  ["flex-shrink", flexShrink],
  ["flex-basis", flexBasis]
]);

module.exports.isValid = function isValid(v) {
  return shorthandParser(v, shorthandFor) !== undefined;
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    var normalizedValue = String(v).trim().toLowerCase();
    if (normalizedValue === "none") {
      this._shorthandSetter("flex", "0 0 auto", shorthandFor);
      return;
    }
    if (normalizedValue === "initial") {
      this._shorthandSetter("flex", "0 1 auto", shorthandFor);
      return;
    }
    if (normalizedValue === "auto") {
      this.removeProperty("flex-grow");
      this.removeProperty("flex-shrink");
      this.setProperty("flex-basis", normalizedValue);
      return;
    }
    this._shorthandSetter("flex", v, shorthandFor);
  },
  get() {
    return this._shorthandGetter("flex", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
