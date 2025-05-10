"use strict";

var parseMeasurement = require("../parsers").parseInheritingMeasurement;

module.exports.definition = {
  set(v) {
    this._setProperty("right", parseMeasurement(v));
  },
  get() {
    return this.getPropertyValue("right");
  },
  enumerable: true,
  configurable: true
};
