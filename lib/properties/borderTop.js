"use strict";

const parsers = require("../parsers");
const borderTopWidth = require("./borderTopWidth");
const borderTopStyle = require("./borderTopStyle");
const borderTopColor = require("./borderTopColor");

const initialValues = new Map([
  ["border-top-width", "medium"],
  ["border-top-style", "none"],
  ["border-top-color", "currentcolor"]
]);

module.exports.shorthandFor = new Map([
  ["border-top-width", borderTopWidth],
  ["border-top-style", borderTopStyle],
  ["border-top-color", borderTopColor]
]);

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const values = parsers.splitValue(v);
  const parsedValues = new Map();
  for (const val of values) {
    const value = parsers.parsePropertyValue("border-top", val, {
      globalObject,
      inArray: true
    });
    if (Array.isArray(value) && value.length === 1) {
      const [{ isNumber, name, type, value: itemValue }] = value;
      switch (type) {
        case "Calc": {
          if (isNumber || parsedValues.has("border-top-width")) {
            return;
          }
          parsedValues.set("border-top-width", `${name}(${itemValue})`);
          break;
        }
        case "Dimension":
        case "Number": {
          if (parsedValues.has("border-top-width")) {
            return;
          }
          const parsedValue = parsers.parseLength(value, {
            min: 0
          });
          if (!parsedValue) {
            return;
          }
          parsedValues.set("border-top-width", parsedValue);
          break;
        }
        case "Function": {
          if (parsedValues.has("border-top-color")) {
            return;
          }
          const parsedValue = parsers.parseColor(value);
          if (!parsedValue) {
            return;
          }
          parsedValues.set("border-top-color", parsedValue);
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
          if (parsedValues.has("border-top-color")) {
            return;
          }
          const parsedValue = parsers.parseColor(`#${itemValue}`);
          if (!parsedValue) {
            return;
          }
          parsedValues.set("border-top-color", parsedValue);
          break;
        }
        case "Identifier": {
          if (parsers.isValidPropertyValue("border-top-width", name)) {
            if (parsedValues.has("border-top-width")) {
              return;
            }
            parsedValues.set("border-top-width", name);
            break;
          } else if (parsers.isValidPropertyValue("border-top-style", name)) {
            if (parsedValues.has("border-top-style")) {
              return;
            }
            parsedValues.set("border-top-style", name);
            break;
          } else if (parsers.isValidPropertyValue("border-top-color", name)) {
            if (parsedValues.has("border-top-color")) {
              return;
            }
            parsedValues.set("border-top-color", name);
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
      this._setProperty("border-top", v);
    } else {
      const obj = module.exports.parse(v, {
        globalObject: this._global
      });
      if (obj === "") {
        for (const [key] of module.exports.shorthandFor) {
          this._setProperty(key, "");
        }
        this._setProperty("border", "");
        this._setProperty("border-top", "");
      } else if (obj) {
        const valueObj = Object.fromEntries(initialValues);
        for (const key of Object.keys(obj)) {
          valueObj[key] = obj[key];
        }
        for (const [key, value] of Object.entries(valueObj)) {
          this._setProperty(key, value);
        }
        this._setProperty("border", "");
        this._setProperty("border-top", [...Object.values(obj)].join(" "));
      }
    }
  },
  get() {
    const val = this.getPropertyValue("border-top");
    if (parsers.isGlobalKeyword(val) || parsers.hasVarFunc(val)) {
      return val;
    }
    const subVal = this._shorthandGetter("border-top", module.exports.shorthandFor);
    if (parsers.hasVarFunc(subVal)) {
      return "";
    }
    return subVal;
  },
  enumerable: true,
  configurable: true
};
