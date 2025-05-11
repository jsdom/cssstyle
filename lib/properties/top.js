"use strict";

var parseMeasurement = require("../parsers").parseInheritingMeasurement;

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("top", parseMeasurement(v));
  },
  get() {
    return this.getPropertyValue("top");
  },
  enumerable: true,
  configurable: true
};
