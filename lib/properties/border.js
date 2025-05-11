"use strict";

var borderWidth = require("./borderWidth");
var borderStyle = require("./borderStyle");
var borderColor = require("./borderColor");

var shorthandFor = new Map([
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
