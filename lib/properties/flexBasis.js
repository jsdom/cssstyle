"use strict";

var parseMeasurement = require("../parsers").parseMeasurement;

function parse(v) {
  if (v.toLowerCase() === "auto") {
    return "auto";
  }
  if (v.toLowerCase() === "inherit") {
    return "inherit";
  }
  return parseMeasurement(v);
}

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
    if (typeof v === "number") {
      v = v.toString();
    }
    this._setProperty("flex-basis", parse(v));
  },
  get() {
    return this.getPropertyValue("flex-basis");
  },
  enumerable: true,
  configurable: true
};
