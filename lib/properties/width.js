"use strict";

var parseMeasurement = require("../parsers").parseMeasurement;

function parse(v) {
  if (String(v).toLowerCase() === "auto") {
    return "auto";
  }
  if (String(v).toLowerCase() === "inherit") {
    return "inherit";
  }
  return parseMeasurement(v);
}

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("width", parse(v));
  },
  get() {
    return this.getPropertyValue("width");
  },
  enumerable: true,
  configurable: true
};
