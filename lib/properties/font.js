"use strict";

var TYPES = require("../parsers").TYPES;
var valueType = require("../parsers").valueType;
var shorthandParser = require("../parsers").shorthandParser;
var shorthandSetter = require("../parsers").shorthandSetter;
var shorthandGetter = require("../parsers").shorthandGetter;

var shorthandFor = {
  "font-family": require("./fontFamily"),
  "font-size": require("./fontSize"),
  "font-style": require("./fontStyle"),
  "font-variant": require("./fontVariant"),
  "font-weight": require("./fontWeight"),
  "line-height": require("./lineHeight")
};

module.exports.definition = {
  set: function (v) {
    var shorthand = shorthandParser(v, shorthandFor);
    var setter = shorthandSetter("font", shorthandFor);
    if (shorthand !== undefined) {
      return setter.call(this, v);
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
  get: shorthandGetter("font", shorthandFor),
  enumerable: true,
  configurable: true
};
