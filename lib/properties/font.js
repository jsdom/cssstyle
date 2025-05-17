"use strict";

const parsers = require("../parsers");
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

const parse = function parse(v) {
  const keywords = ["caption", "icon", "menu", "message-box", "small-caption", "status-bar"];
  const key = parsers.parseKeyword(v, keywords);
  if (key) {
    return key;
  }
  const [fontBlock, ...families] = parsers.splitValue(v, {
    delimiter: ","
  });
  let blockA, blockB;
  if (fontBlock.includes("/")) {
    [blockA, blockB] = fontBlock.split(/\s*\/\s*/);
  } else {
    blockA = fontBlock.trim();
  }
  const obj = parsers.parseShorthand(blockA, shorthandFor, true);
  if (!obj) {
    return;
  }
  const font = {};
  const fontFamilies = new Set();
  for (const [property, value] of Object.entries(obj)) {
    if (property === "font-family") {
      if (!blockB) {
        fontFamilies.add(value);
      }
    } else {
      font[property] = value;
    }
  }
  // blockB includes line-height and first font-family
  if (blockB) {
    const [lineheight, family] = parsers.splitValue(blockB);
    if (lineHeight.isValid(lineheight)) {
      font["line-height"] = lineheight;
    } else {
      return;
    }
    if (fontFamily.isValid(family)) {
      fontFamilies.add(family);
    } else {
      return;
    }
  }
  for (const family of families) {
    fontFamilies.add(family);
  }
  font["font-family"] = [...fontFamilies].join(", ");
  return font;
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v);
    if (v === "undefined") {
      return;
    }
    const obj = parse(v);
    if (!obj) {
      return;
    }
    const str = new Set();
    for (const [key] of shorthandFor) {
      const val = obj[key];
      if (typeof val === "string") {
        this._setProperty(key, val);
        if (val && !str.has(val)) {
          if (key === "line-height") {
            str.add(`/ ${val}`);
          } else {
            str.add(`${val}`);
          }
        }
      }
    }
    this._setProperty("font", [...str].join(" "));
  },
  get() {
    const str = new Set();
    for (const [key] of shorthandFor) {
      const val = this.getPropertyValue(key);
      if (val && !str.has(val)) {
        if (key === "line-height") {
          str.add(`/ ${val}`);
        } else {
          str.add(`${val}`);
        }
      }
    }
    return [...str].join(" ");
  },
  enumerable: true,
  configurable: true
};
