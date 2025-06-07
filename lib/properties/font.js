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

module.exports.parse = function parse(v) {
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
    [blockA, blockB] = parsers.splitValue(fontBlock, {
      delimiter: "/"
    });
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
  // blockB, if matched, includes line-height and first font-family
  if (blockB) {
    const [lineheight, family] = parsers.splitValue(blockB);
    if (lineHeight.isValid(lineheight)) {
      font["line-height"] = lineHeight.parse(lineheight);
    } else {
      return;
    }
    if (fontFamily.isValid(family)) {
      fontFamilies.add(fontFamily.parse(family));
    } else {
      return;
    }
  }
  for (const family of families) {
    if (fontFamily.isValid(family)) {
      fontFamilies.add(fontFamily.parse(family));
    } else {
      return;
    }
  }
  font["font-family"] = [...fontFamilies].join(", ");
  return font;
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      for (const [key] of shorthandFor) {
        this._setProperty(key, "");
      }
      this._setProperty("font", v);
    } else {
      const obj = module.exports.parse(v);
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
              str.add(val);
            }
          }
        }
      }
      this._setProperty("font", [...str].join(" "));
    }
  },
  get() {
    const val = this.getPropertyValue("font");
    if (parsers.hasVarFunc(val)) {
      return val;
    }
    const str = new Set();
    for (const [key] of shorthandFor) {
      const v = this.getPropertyValue(key);
      if (parsers.hasVarFunc(v)) {
        return "";
      }
      if (v && !str.has(v)) {
        if (key === "line-height") {
          str.add(`/ ${v}`);
        } else {
          str.add(`${v}`);
        }
      }
    }
    return [...str].join(" ");
  },
  enumerable: true,
  configurable: true
};
