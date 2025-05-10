"use strict";

var implicitSetter = require("../parsers").implicitSetter;

module.exports.isValid = function isValid(v) {
  // the valid border-styles:
  var styles = [
    "none",
    "hidden",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset"
  ];
  return typeof v === "string" && (v === "" || styles.indexOf(v) !== -1);
};

var parser = function (v) {
  if (module.exports.isValid(v)) {
    return v.toLowerCase();
  }
  return undefined;
};

module.exports.definition = {
  set: implicitSetter("border", "style", module.exports.isValid, parser),
  get() {
    return this.getPropertyValue("border-style");
  },
  enumerable: true,
  configurable: true
};
