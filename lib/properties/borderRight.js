"use strict";

const parsers = require("../parsers");
const borderRightWidth = require("./borderRightWidth");
const borderRightStyle = require("./borderRightStyle");
const borderRightColor = require("./borderRightColor");

const initialValues = new Map([
  ["border-right-width", "medium"],
  ["border-right-style", "none"],
  ["border-right-color", "currentcolor"]
]);

module.exports.shorthandFor = new Map([
  ["border-right-width", borderRightWidth],
  ["border-right-style", borderRightStyle],
  ["border-right-color", borderRightColor]
]);

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const values = parsers.splitValue(v);
  const parsedValues = new Map();
  for (const val of values) {
    const value = parsers.parsePropertyValue("border-right", val, {
      globalObject,
      inArray: true
    });
    if (Array.isArray(value) && value.length === 1) {
      const [{ isNumber, name, type, value: itemValue }] = value;
      switch (type) {
        case "Calc": {
          if (isNumber || parsedValues.has("border-right-width")) {
            return;
          }
          parsedValues.set("border-right-width", `${name}(${itemValue})`);
          break;
        }
        case "Dimension":
        case "Number": {
          if (parsedValues.has("border-right-width")) {
            return;
          }
          const parsedValue = parsers.parseLength(value, {
            min: 0
          });
          if (!parsedValue) {
            return;
          }
          parsedValues.set("border-right-width", parsedValue);
          break;
        }
        case "Function": {
          if (parsedValues.has("border-right-color")) {
            return;
          }
          const parsedValue = parsers.parseColor(value);
          if (!parsedValue) {
            return;
          }
          parsedValues.set("border-right-color", parsedValue);
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
          if (parsedValues.has("border-right-color")) {
            return;
          }
          const parsedValue = parsers.parseColor(`#${itemValue}`);
          if (!parsedValue) {
            return;
          }
          parsedValues.set("border-right-color", parsedValue);
          break;
        }
        case "Identifier": {
          if (parsers.isValidPropertyValue("border-right-width", name)) {
            if (parsedValues.has("border-right-width")) {
              return;
            }
            parsedValues.set("border-right-width", name);
            break;
          } else if (parsers.isValidPropertyValue("border-right-style", name)) {
            if (parsedValues.has("border-right-style")) {
              return;
            }
            parsedValues.set("border-right-style", name);
            break;
          } else if (parsers.isValidPropertyValue("border-right-color", name)) {
            if (parsedValues.has("border-right-color")) {
              return;
            }
            parsedValues.set("border-right-color", name);
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
      this._setProperty("border-right", v);
    } else {
      const obj = module.exports.parse(v, {
        globalObject: this._global
      });
      if (obj === "") {
        for (const [key] of module.exports.shorthandFor) {
          this._setProperty(key, "");
        }
        this._setProperty("border", "");
        this._setProperty("border-right", "");
      } else if (obj) {
        const valueObj = Object.fromEntries(initialValues);
        for (const key of Object.keys(obj)) {
          valueObj[key] = obj[key];
        }
        for (const [key, value] of Object.entries(valueObj)) {
          this._setProperty(key, value);
        }
        this._setProperty("border", "");
        this._setProperty("border-right", [...Object.values(obj)].join(" "));
      }
    }
  },
  get() {
    const val = this.getPropertyValue("border-right");
    if (parsers.isGlobalKeyword(val) || parsers.hasVarFunc(val)) {
      return val;
    }
    const subVal = this._shorthandGetter("border-right", module.exports.shorthandFor);
    if (parsers.hasVarFunc(subVal)) {
      return "";
    }
    return subVal;
  },
  enumerable: true,
  configurable: true
};
