"use strict";

const parsers = require("../parsers");
const borderWidth = require("./borderWidth");
const borderStyle = require("./borderStyle");
const borderColor = require("./borderColor");
const borderTop = require("./borderTop");
const borderRight = require("./borderRight");
const borderBottom = require("./borderBottom");
const borderLeft = require("./borderLeft");

const initialValues = new Map([
  ["border-width", "medium"],
  ["border-style", "none"],
  ["border-color", "currentcolor"]
]);

const positionShorthandFor = new Map([
  ["border-top", borderTop],
  ["border-right", borderRight],
  ["border-bottom", borderBottom],
  ["border-left", borderLeft]
]);

module.exports.shorthandFor = new Map([
  ["border-width", borderWidth],
  ["border-style", borderStyle],
  ["border-color", borderColor]
]);

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const values = parsers.splitValue(v);
  const parsedValues = new Map();
  for (const val of values) {
    const value = parsers.parsePropertyValue("border", val, {
      globalObject,
      inArray: true
    });
    if (Array.isArray(value) && value.length === 1) {
      const [{ isNumber, name, type, value: itemValue }] = value;
      switch (type) {
        case "Calc": {
          if (isNumber || parsedValues.has("border-width")) {
            return;
          }
          parsedValues.set("border-width", `${name}(${itemValue})`);
          break;
        }
        case "Dimension":
        case "Number": {
          if (parsedValues.has("border-width")) {
            return;
          }
          const parsedValue = parsers.parseLength(value, {
            min: 0
          });
          if (!parsedValue) {
            return;
          }
          parsedValues.set("border-width", parsedValue);
          break;
        }
        case "Function": {
          if (parsedValues.has("border-color")) {
            return;
          }
          const parsedValue = parsers.parseColor(value);
          if (!parsedValue) {
            return;
          }
          parsedValues.set("border-color", parsedValue);
          break;
        }
        case "GlobalKeyword": {
          if (values.length !== 1) {
            return;
          }
          for (const key of module.exports.shorthandFor.keys()) {
            parsedValues.set(key, name);
          }
          break;
        }
        case "Hash": {
          if (parsedValues.has("border-color")) {
            return;
          }
          const parsedValue = parsers.parseColor(`#${itemValue}`);
          if (!parsedValue) {
            return;
          }
          parsedValues.set("border-color", parsedValue);
          break;
        }
        case "Identifier": {
          if (parsers.isValidPropertyValue("border-width", name)) {
            if (parsedValues.has("border-width")) {
              return;
            }
            parsedValues.set("border-width", name);
            break;
          } else if (parsers.isValidPropertyValue("border-style", name)) {
            if (parsedValues.has("border-style")) {
              return;
            }
            parsedValues.set("border-style", name);
            break;
          } else if (parsers.isValidPropertyValue("border-color", name)) {
            if (parsedValues.has("border-color")) {
              return;
            }
            parsedValues.set("border-color", name);
            break;
          }
          return;
        }
        default: {
          return;
        }
      }
    } else {
      return;
    }
  }
  if (parsedValues.size) {
    const keys = module.exports.shorthandFor.keys();
    const obj = {};
    for (const key of keys) {
      if (parsedValues.has(key)) {
        obj[key] = parsedValues.get(key);
      }
    }
    return obj;
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      for (const [key] of module.exports.shorthandFor) {
        this._setProperty(key, "");
      }
      for (const [key, parser] of positionShorthandFor) {
        this._setProperty(key, "");
        for (const [subkey] of parser.shorthandFor) {
          this._setProperty(subkey, "");
        }
      }
      this._setProperty("border", v);
      this._setProperty("border-image", "none");
    } else {
      const obj = module.exports.parse(v, {
        globalObject: this._global
      });
      if (obj === "") {
        for (const [key] of module.exports.shorthandFor) {
          this._setProperty(key, "");
        }
        for (const [key, parser] of positionShorthandFor) {
          this._setProperty(key, "");
          for (const [subkey] of parser.shorthandFor) {
            this._setProperty(subkey, "");
          }
        }
        this._setProperty("border", "");
        this._setProperty("border-image", "");
      } else if (obj) {
        const valueObj = Object.fromEntries(initialValues);
        for (const key of Object.keys(obj)) {
          valueObj[key] = obj[key];
        }
        const positions = ["top", "right", "bottom", "left"];
        for (const [key, value] of Object.entries(valueObj)) {
          this._setProperty(key, value);
          const [prefix, suffix] = key.split("-");
          const { parse: parser } = module.exports.shorthandFor.get(key);
          this._implicitSetter(prefix, suffix, value, parser, positions);
        }
        this._setProperty("border", [...Object.values(obj)].join(" "));
        this._setProperty("border-image", "none");
      }
    }
  },
  get() {
    return this.getPropertyValue("border");
  },
  enumerable: true,
  configurable: true
};
