"use strict";

var parseMeasurement = require("../parsers").parseMeasurement;

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
    var parse = function parse(val) {
      if (val.toLowerCase() === "auto") {
        return "auto";
      }
      if (val.toLowerCase() === "inherit") {
        return "inherit";
      }
      return parseMeasurement(val);
    };
    this._setProperty("width", parse(v));
  },
  get() {
    return this.getPropertyValue("width");
  },
  enumerable: true,
  configurable: true
};
