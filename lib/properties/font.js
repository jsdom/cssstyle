"use strict";

var TYPES = require("../parsers").TYPES;
var valueType = require("../parsers").valueType;
var shorthandParser = require("../parsers").shorthandParser;
var fontStyle = require("./fontStyle");
var fontVariant = require("./fontVariant");
var fontWeight = require("./fontWeight");
var fontSize = require("./fontSize");
var lineHeight = require("./lineHeight");
var fontFamily = require("./fontFamily");

var shorthandFor = new Map([
  ["font-style", fontStyle],
  ["font-variant", fontVariant],
  ["font-weight", fontWeight],
  ["font-size", fontSize],
  ["line-height", lineHeight],
  ["font-family", fontFamily]
]);

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    var shorthand = shorthandParser(v, shorthandFor);
    if (shorthand !== undefined) {
      this._shorthandSetter("font", v, shorthandFor);
    }
    var staticFonts = [
      "caption",
      "icon",
      "menu",
      "message-box",
      "small-caption",
      "status-bar",
      "inherit"
    ];
    if (valueType(v) === TYPES.KEYWORD && staticFonts.indexOf(v.toLowerCase()) !== -1) {
      this._setProperty("font", v);
    }
  },
  get() {
    return this._shorthandGetter("font", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
