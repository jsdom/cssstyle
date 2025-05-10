"use strict";

var parsers = require("../parsers");
var implicitSetter = require("../parsers").implicitSetter;

module.exports.isValid = function isValid(v) {
  var length = parsers.parseLength(v);
  if (length !== undefined) {
    return true;
  }
  if (typeof v !== "string") {
    return false;
  }
  if (v === "") {
    return true;
  }
  v = v.toLowerCase();
  // the valid border-widths:
  var widths = ["thin", "medium", "thick"];
  if (widths.indexOf(v) === -1) {
    return false;
  }
  return true;
};

var parser = function (v) {
  var length = parsers.parseLength(v);
  if (length !== undefined) {
    return length;
  }
  if (module.exports.isValid(v)) {
    return v.toLowerCase();
  }
  return undefined;
};

module.exports.definition = {
  set: implicitSetter("border", "width", module.exports.isValid, parser),
  get() {
    return this.getPropertyValue("border-width");
  },
  enumerable: true,
  configurable: true
};
