"use strict";

var parseMeasurement = require("../parsers").parseInheritingMeasurement;

module.exports.definition = {
  set(v) {
    this._setProperty("left", parseMeasurement(v));
  },
  get() {
    return this.getPropertyValue("left");
  },
  enumerable: true,
  configurable: true
};
