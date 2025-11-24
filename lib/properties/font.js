"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");
const fontStyle = require("./fontStyle");
const fontVariant = require("./fontVariant");
const fontWeight = require("./fontWeight");
const fontSize = require("./fontSize");
const lineHeight = require("./lineHeight");
const fontFamily = require("./fontFamily");

const PROPERTY = "font";
const FONT_STYLE = "font-style";
const FONT_VARIANT = "font-variant";
const FONT_WEIGHT = "font-weight";
const FONT_SIZE = "font-size";
const LINE_HEIGHT = "line-height";
const FONT_FAMILY = "font-family";

module.exports.shorthandFor = new Map([
  [FONT_STYLE, fontStyle],
  [FONT_VARIANT, fontVariant],
  [FONT_WEIGHT, fontWeight],
  [FONT_SIZE, fontSize],
  [LINE_HEIGHT, lineHeight],
  [FONT_FAMILY, fontFamily]
]);

module.exports.parse = function parse(v, opt = {}) {
  const { AST_TYPES } = constants;
  const { globalObject, options } = opt;
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.resolveCalc(v, opt);
  }
  if (!parsers.isValidPropertyValue(PROPERTY, v, globalObject)) {
    return;
  }
  const [fontBlock, ...families] = parsers.splitValue(v, {
    delimiter: ","
  });
  const [fontBlockA, fontBlockB] = parsers.splitValue(fontBlock, {
    delimiter: "/"
  });
  const font = {
    [FONT_STYLE]: "normal",
    [FONT_VARIANT]: "normal",
    [FONT_WEIGHT]: "normal"
  };
  const fontFamilies = new Set();
  if (fontBlockB) {
    const [lineB, ...familiesB] = fontBlockB.trim().split(" ");
    if (!lineB || !familiesB.length) {
      return;
    }
    const lineHeightB = lineHeight.parse(lineB, {
      globalObject,
      options
    });
    if (typeof lineHeightB !== "string") {
      return;
    }
    const familyB = fontFamily.parse(familiesB.join(" "), {
      globalObject,
      options,
      caseSensitive: true
    });
    if (typeof familyB === "string") {
      fontFamilies.add(familyB);
    } else {
      return;
    }
    const parts = parsers.splitValue(fontBlockA.trim());
    const properties = [FONT_STYLE, FONT_VARIANT, FONT_WEIGHT, FONT_SIZE];
    for (const part of parts) {
      if (part === "normal") {
        continue;
      } else {
        for (const longhand of properties) {
          switch (longhand) {
            case FONT_SIZE: {
              const parsedValue = fontSize.parse(part, {
                globalObject,
                options
              });
              if (typeof parsedValue === "string") {
                font[longhand] = parsedValue;
              }
              break;
            }
            case FONT_STYLE:
            case FONT_WEIGHT: {
              if (font[longhand] === "normal") {
                const longhandItem = module.exports.shorthandFor.get(longhand);
                const parsedValue = longhandItem.parse(part, {
                  globalObject,
                  options
                });
                if (typeof parsedValue === "string") {
                  font[longhand] = parsedValue;
                }
              }
              break;
            }
            case FONT_VARIANT: {
              if (font[longhand] === "normal") {
                const parsedValue = fontVariant.parse(part, {
                  globalObject,
                  options
                });
                if (typeof parsedValue === "string") {
                  if (parsedValue === "small-cap") {
                    font[longhand] = parsedValue;
                  } else if (parsedValue !== "normal") {
                    return;
                  }
                }
              }
              break;
            }
            default:
          }
        }
      }
    }
    if (Object.hasOwn(font, FONT_SIZE)) {
      font[LINE_HEIGHT] = lineHeightB;
    } else {
      return;
    }
  } else {
    const revParts = parsers.splitValue(fontBlockA.trim()).toReversed();
    if (revParts.length === 1) {
      const [part] = revParts;
      const value = parsers.parsePropertyValue(PROPERTY, part, {
        globalObject,
        options,
        inArray: true
      });
      if (Array.isArray(value) && value.length === 1) {
        const [{ name, type }] = value;
        if (type === AST_TYPES.GLOBAL_KEY) {
          return {
            [FONT_STYLE]: name,
            [FONT_VARIANT]: name,
            [FONT_WEIGHT]: name,
            [FONT_SIZE]: name,
            [LINE_HEIGHT]: name,
            [FONT_FAMILY]: name
          };
        }
      }
      return;
    }
    const properties = [FONT_STYLE, FONT_VARIANT, FONT_WEIGHT, LINE_HEIGHT];
    for (const longhand of properties) {
      font[longhand] = "normal";
    }
    const revFontFamily = [];
    let fontSizeA;
    for (const part of revParts) {
      if (fontSizeA) {
        if (/^normal$/i.test(part)) {
          continue;
        } else {
          for (const longhand of properties) {
            switch (longhand) {
              case FONT_STYLE:
              case FONT_WEIGHT:
              case LINE_HEIGHT: {
                if (font[longhand] === "normal") {
                  const longhandItem = module.exports.shorthandFor.get(longhand);
                  const parsedValue = longhandItem.parse(part, {
                    globalObject,
                    options
                  });
                  if (typeof parsedValue === "string") {
                    font[longhand] = parsedValue;
                  }
                }
                break;
              }
              case FONT_VARIANT: {
                if (font[longhand] === "normal") {
                  const parsedValue = fontVariant.parse(part, {
                    globalObject,
                    options
                  });
                  if (typeof parsedValue === "string") {
                    if (parsedValue === "small-cap") {
                      font[longhand] = parsedValue;
                    } else if (parsedValue !== "normal") {
                      return;
                    }
                  }
                }
                break;
              }
              default:
            }
          }
        }
      } else {
        const parsedFontSize = fontSize.parse(part, {
          globalObject,
          options
        });
        if (typeof parsedFontSize === "string") {
          fontSizeA = parsedFontSize;
        } else {
          const parsedFontFamily = fontFamily.parse(part, {
            globalObject,
            options,
            caseSensitive: true
          });
          if (typeof parsedFontFamily === "string") {
            revFontFamily.push(parsedFontFamily);
          } else {
            return;
          }
        }
      }
    }
    const family = fontFamily.parse(revFontFamily.toReversed().join(" "), {
      globalObject,
      options,
      caseSensitive: true
    });
    if (fontSizeA && family) {
      font[FONT_SIZE] = fontSizeA;
      fontFamilies.add(fontFamily.parse(family));
    } else {
      return;
    }
  }
  for (const family of families) {
    const parsedFontFamily = fontFamily.parse(family, {
      globalObject,
      options,
      caseSensitive: true
    });
    if (parsedFontFamily) {
      fontFamilies.add(parsedFontFamily);
    } else {
      return;
    }
  }
  font[FONT_FAMILY] = [...fontFamilies].join(", ");
  return font;
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    // The value has already been set.
    if (this._values.get(PROPERTY) === v && !this._priorities.get(PROPERTY)) {
      return;
    }
    if (v === "" || parsers.hasVarFunc(v)) {
      for (const [key] of module.exports.shorthandFor) {
        this._setProperty(key, "");
      }
      this._setProperty(PROPERTY, v);
    } else {
      const obj = module.exports.parse(v, {
        globalObject: this._global,
        options: this._options
      });
      if (!obj) {
        return;
      }
      const priority = this._priorities.get(PROPERTY) ?? "";
      const str = new Set();
      for (const [key] of module.exports.shorthandFor) {
        const val = obj[key];
        if (typeof val === "string") {
          this._setProperty(key, val, priority);
          if (val && val !== "normal" && !str.has(val)) {
            if (key === LINE_HEIGHT) {
              str.add(`/ ${val}`);
            } else {
              str.add(val);
            }
          }
        }
      }
      this._setProperty(PROPERTY, [...str].join(" "), priority);
    }
  },
  get() {
    const val = this.getPropertyValue(PROPERTY);
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
        if (key === LINE_HEIGHT) {
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
