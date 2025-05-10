"use strict";

var parseMeasurement = require("../parsers").parseInheritingMeasurement;

module.exports.definition = {
  set(v) {
    this._setProperty("bottom", parseMeasurement(v));
  },
  get() {
    return this.getPropertyValue("bottom");
  },
  enumerable: true,
  configurable: true
};
