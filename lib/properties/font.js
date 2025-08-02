"use strict";

const parsers = require("../parsers");
const fontStyle = require("./fontStyle");
const fontVariant = require("./fontVariant");
const fontWeight = require("./fontWeight");
const fontSize = require("./fontSize");
const lineHeight = require("./lineHeight");
const fontFamily = require("./fontFamily");

const keywords = ["caption", "icon", "menu", "message-box", "small-caption", "status-bar"];

module.exports.shorthandFor = new Map([
  ["font-style", fontStyle],
  ["font-variant", fontVariant],
  ["font-weight", fontWeight],
  ["font-size", fontSize],
  ["line-height", lineHeight],
  ["font-family", fontFamily]
]);

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.parseCalc(v);
  } else if (!parsers.isValidPropertyValue("font", v)) {
    return;
  }
  const key = parsers.parseKeyword(v, keywords);
  if (key) {
    return key;
  }
  const [fontBlock, ...families] = parsers.splitValue(v, {
    delimiter: ","
  });
  const [fontBlockA, fontBlockB] = parsers.splitValue(fontBlock, {
    delimiter: "/"
  });
  const font = {
    "font-style": "normal",
    "font-variant": "normal",
    "font-weight": "normal"
  };
  const fontFamilies = new Set();
  if (fontBlockB) {
    const [lineB, ...familiesB] = fontBlockB.trim().split(" ");
    if (!lineB || !parsers.isValidPropertyValue("line-height", lineB) || !familiesB.length) {
      return;
    }
    const lineHeightB = lineHeight.parse(lineB);
    const familyB = familiesB.join(" ");
    if (parsers.isValidPropertyValue("font-family", familyB)) {
      fontFamilies.add(fontFamily.parse(familyB));
    } else {
      return;
    }
    const parts = parsers.splitValue(fontBlockA.trim());
    const properties = ["font-style", "font-variant", "font-weight", "font-size"];
    for (const part of parts) {
      if (part === "normal") {
        continue;
      } else {
        for (const property of properties) {
          switch (property) {
            case "font-style":
            case "font-variant":
            case "font-weight": {
              if (font[property] === "normal" && parsers.isValidPropertyValue(property, part)) {
                const value = module.exports.shorthandFor.get(property);
                font[property] = value.parse(part);
              }
              break;
            }
            case "font-size": {
              if (parsers.isValidPropertyValue(property, part)) {
                const value = module.exports.shorthandFor.get(property);
                font[property] = value.parse(part);
              }
              break;
            }
            default:
          }
        }
      }
    }
    if (Object.hasOwn(font, "font-size")) {
      font["line-height"] = lineHeightB;
    } else {
      return;
    }
  } else {
    const revParts = parsers.splitValue(fontBlockA.trim()).toReversed();
    const revFontFamily = [];
    const properties = ["font-style", "font-variant", "font-weight", "line-height"];
    font["font-style"] = "normal";
    font["font-variant"] = "normal";
    font["font-weight"] = "normal";
    font["line-height"] = "normal";
    let fontSizeA;
    for (const part of revParts) {
      if (fontSizeA) {
        if (part === "normal") {
          continue;
        } else {
          for (const property of properties) {
            switch (property) {
              case "font-style":
              case "font-variant":
              case "font-weight":
              case "line-height": {
                if (parsers.isValidPropertyValue(property, part)) {
                  const value = module.exports.shorthandFor.get(property);
                  font[property] = value.parse(part);
                }
                break;
              }
              default:
            }
          }
        }
      } else if (parsers.isValidPropertyValue("font-size", part)) {
        fontSizeA = fontSize.parse(part);
      } else if (parsers.isValidPropertyValue("font-family", part)) {
        revFontFamily.push(part);
      } else {
        return;
      }
    }
    const family = revFontFamily.reverse().join(" ");
    if (fontSizeA && parsers.isValidPropertyValue("font-family", family)) {
      font["font-size"] = fontSizeA;
      fontFamilies.add(fontFamily.parse(family));
    } else {
      return;
    }
  }
  for (const family of families) {
    if (parsers.isValidPropertyValue("font-family", family)) {
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
    if (v === "" || parsers.hasVarFunc(v)) {
      for (const [key] of module.exports.shorthandFor) {
        this._setProperty(key, "");
      }
      this._setProperty("font", v);
    } else {
      const obj = module.exports.parse(v);
      if (!obj) {
        return;
      }
      const str = new Set();
      for (const [key] of module.exports.shorthandFor) {
        const val = obj[key];
        if (typeof val === "string") {
          this._setProperty(key, val);
          if (val && val !== "normal" && !str.has(val)) {
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
    for (const [key] of module.exports.shorthandFor) {
      const v = this.getPropertyValue(key);
      if (parsers.hasVarFunc(v)) {
        return "";
      }
      if (v && v !== "normal" && !str.has(v)) {
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
