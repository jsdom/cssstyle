"use strict";

const parseMeasurement = require("../parsers").parseInheritingMeasurement;

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("left", parseMeasurement(v));
  },
  get() {
    return this.getPropertyValue("left");
  },
  enumerable: true,
  configurable: true
};
