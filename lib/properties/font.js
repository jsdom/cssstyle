"use strict";

const TYPES = require("../parsers").TYPES;
const valueType = require("../parsers").valueType;
const shorthandParser = require("../parsers").shorthandParser;
const fontStyle = require("./fontStyle");
const fontVariant = require("./fontVariant");
const fontWeight = require("./fontWeight");
const fontSize = require("./fontSize");
const lineHeight = require("./lineHeight");
const fontFamily = require("./fontFamily");

const shorthandFor = new Map([
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
    const shorthand = shorthandParser(v, shorthandFor);
    if (shorthand !== undefined) {
      this._shorthandSetter("font", v, shorthandFor);
    }
    const staticFonts = [
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
