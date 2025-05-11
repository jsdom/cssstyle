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
    this._setProperty("right", parseMeasurement(v));
  },
  get() {
    return this.getPropertyValue("right");
  },
  enumerable: true,
  configurable: true
};
