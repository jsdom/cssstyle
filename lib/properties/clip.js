"use strict";

var parseMeasurement = require("../parsers").parseMeasurement;

var parse = function (val) {
  if (val === "" || val === null) {
    return val;
  }
  if (typeof val !== "string") {
    return;
  }
  val = val.toLowerCase();
  if (val === "auto" || val === "inherit") {
    return val;
  }
  var matches = val.match(/^rect\((.*)\)$/i);
  if (!matches) {
    return;
  }
  var parts = matches[1].split(/\s*,\s*/);
  if (parts.length !== 4) {
    return;
  }
  var valid = parts.every(function (part, index) {
    var measurement = parseMeasurement(part);
    parts[index] = measurement;
    return measurement !== undefined;
  });
  if (!valid) {
    return;
  }
  parts = parts.join(", ");
  return val.replace(matches[1], parts);
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("clip", parse(v));
  },
  get() {
    return this.getPropertyValue("clip");
  },
  enumerable: true,
  configurable: true
};
