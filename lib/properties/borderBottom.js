"use strict";

var borderBottomWidth = require("./borderBottomWidth");
var borderBottomStyle = require("./borderBottomStyle");
var borderBottomColor = require("./borderBottomColor");

var shorthandFor = new Map([
  ["border-bottom-width", borderBottomWidth],
  ["border-bottom-style", borderBottomStyle],
  ["border-bottom-color", borderBottomColor]
]);

module.exports.definition = {
  set(v) {
    this._shorthandSetter("border-bottom", v, shorthandFor);
  },
  get() {
    return this._shorthandGetter("border-bottom", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
