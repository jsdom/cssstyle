"use strict";

const borderWidth = require("./borderWidth");
const borderStyle = require("./borderStyle");
const borderColor = require("./borderColor");

const shorthandFor = new Map([
  ["border-width", borderWidth],
  ["border-style", borderStyle],
  ["border-color", borderColor]
]);

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    if (v.toString().toLowerCase() === "none") {
      v = "";
    }
    this._midShorthandSetter("border", v, shorthandFor);
  },
  get() {
    return this._shorthandGetter("border", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
