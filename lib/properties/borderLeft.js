"use strict";

const parsers = require("../parsers");
const borderLeftWidth = require("./borderLeftWidth");
const borderLeftStyle = require("./borderLeftStyle");
const borderLeftColor = require("./borderLeftColor");

const initialValues = new Map([
  ["border-left-width", "medium"],
  ["border-left-style", "none"],
  ["border-left-color", "currentcolor"]
]);

module.exports.shorthandFor = new Map([
  ["border-left-width", borderLeftWidth],
  ["border-left-style", borderLeftStyle],
  ["border-left-color", borderLeftColor]
]);

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const values = parsers.splitValue(v);
  const parsedValues = new Map();
  for (const val of values) {
    const value = parsers.parsePropertyValue("border-left", val, {
      globalObject,
      inArray: true
    });
    if (Array.isArray(value) && value.length === 1) {
      const [{ isNumber, name, type, value: itemValue }] = value;
      switch (type) {
        case "Calc": {
          if (isNumber || parsedValues.has("border-left-width")) {
            return;
          }
          parsedValues.set("border-left-width", `${name}(${itemValue})`);
          break;
        }
        case "Dimension":
        case "Number": {
          if (parsedValues.has("border-left-width")) {
            return;
          }
          const parsedValue = parsers.parseLength(value, {
            min: 0
          });
          if (!parsedValue) {
            return;
          }
          parsedValues.set("border-left-width", parsedValue);
          break;
        }
        case "Function": {
          if (parsedValues.has("border-left-color")) {
            return;
          }
          const parsedValue = parsers.parseColor(value);
          if (!parsedValue) {
            return;
          }
          parsedValues.set("border-left-color", parsedValue);
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
          if (parsedValues.has("border-left-color")) {
            return;
          }
          const parsedValue = parsers.parseColor(`#${itemValue}`);
          if (!parsedValue) {
            return;
          }
          parsedValues.set("border-left-color", parsedValue);
          break;
        }
        case "Identifier": {
          if (parsers.isValidPropertyValue("border-left-width", name)) {
            if (parsedValues.has("border-left-width")) {
              return;
            }
            parsedValues.set("border-left-width", name);
            break;
          } else if (parsers.isValidPropertyValue("border-left-style", name)) {
            if (parsedValues.has("border-left-style")) {
              return;
            }
            parsedValues.set("border-left-style", name);
            break;
          } else if (parsers.isValidPropertyValue("border-left-color", name)) {
            if (parsedValues.has("border-left-color")) {
              return;
            }
            parsedValues.set("border-left-color", name);
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
      this._setProperty("border", "");
      this._setProperty("border-left", v);
    } else {
      const obj = module.exports.parse(v, {
        globalObject: this._global
      });
      if (obj === "") {
        for (const [key] of module.exports.shorthandFor) {
          this._setProperty(key, "");
        }
        this._setProperty("border", "");
        this._setProperty("border-left", "");
      } else if (obj) {
        const valueObj = Object.fromEntries(initialValues);
        for (const key of Object.keys(obj)) {
          valueObj[key] = obj[key];
        }
        for (const [key, value] of Object.entries(valueObj)) {
          this._setProperty(key, value);
        }
        this._setProperty("border", "");
        this._setProperty("border-left", [...Object.values(obj)].join(" "));
      }
    }
  },
  get() {
    const val = this.getPropertyValue("border-left");
    if (parsers.isGlobalKeyword(val) || parsers.hasVarFunc(val)) {
      return val;
    }
    const subVal = this._shorthandGetter("border-left", module.exports.shorthandFor);
    if (parsers.hasVarFunc(subVal)) {
      return "";
    }
    return subVal;
  },
  enumerable: true,
  configurable: true
};
