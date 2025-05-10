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
    this._setProperty("height", parse(v));
  },
  get() {
    return this.getPropertyValue("height");
  },
  enumerable: true,
  configurable: true
};
