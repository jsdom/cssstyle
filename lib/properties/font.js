"use strict";

var TYPES = require("../parsers").TYPES;
var valueType = require("../parsers").valueType;
var shorthandParser = require("../parsers").shorthandParser;

var shorthandFor = {
  "font-family": require("./fontFamily"),
  "font-size": require("./fontSize"),
  "font-style": require("./fontStyle"),
  "font-variant": require("./fontVariant"),
  "font-weight": require("./fontWeight"),
  "line-height": require("./lineHeight")
};

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
