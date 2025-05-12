"use strict";

const parseMeasurement = require("../parsers").parseMeasurement;

const parse = function (val) {
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
  const matches = val.match(/^rect\((.*)\)$/i);
  if (!matches) {
    return;
  }
  let parts = matches[1].split(/\s*,\s*/);
  if (parts.length !== 4) {
    return;
  }
  const valid = parts.every(function (part, index) {
    const measurement = parseMeasurement(part);
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
