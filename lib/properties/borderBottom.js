"use strict";

const parsers = require("../parsers");
const borderBottomWidth = require("./borderBottomWidth");
const borderBottomStyle = require("./borderBottomStyle");
const borderBottomColor = require("./borderBottomColor");

const property = "border-bottom";
const shorthand = "border";

module.exports.initialValues = new Map([
  [borderBottomWidth.property, "medium"],
  [borderBottomStyle.property, "none"],
  [borderBottomColor.property, "currentcolor"]
]);

module.exports.shorthandFor = new Map([
  [borderBottomWidth.property, borderBottomWidth],
  [borderBottomStyle.property, borderBottomStyle],
  [borderBottomColor.property, borderBottomColor]
]);

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const values = parsers.splitValue(v);
  const parsedValues = new Map();
  for (const val of values) {
    const value = parsers.parsePropertyValue(property, val, {
      globalObject,
      inArray: true
    });
    if (Array.isArray(value) && value.length === 1) {
      const [{ isNumber, name, type, value: itemValue }] = value;
      switch (type) {
        case "Calc": {
          if (isNumber || parsedValues.has(borderBottomWidth.property)) {
            return;
          }
          parsedValues.set(borderBottomWidth.property, `${name}(${itemValue})`);
          break;
        }
        case "Dimension":
        case "Number": {
          if (parsedValues.has(borderBottomWidth.property)) {
            return;
          }
          const parsedValue = parsers.parseLength(value, {
            min: 0
          });
          if (!parsedValue) {
            return;
          }
          parsedValues.set(borderBottomWidth.property, parsedValue);
          break;
        }
        case "Function": {
          if (parsedValues.has(borderBottomColor.property)) {
            return;
          }
          const parsedValue = parsers.parseColor(value);
          if (!parsedValue) {
            return;
          }
          parsedValues.set(borderBottomColor.property, parsedValue);
          break;
        }
        case "GlobalKeyword": {
          return name;
        }
        case "Hash": {
          if (parsedValues.has(borderBottomColor.property)) {
            return;
          }
          const parsedValue = parsers.parseColor(value);
          if (!parsedValue) {
            return;
          }
          parsedValues.set(borderBottomColor.property, parsedValue);
          break;
        }
        case "Identifier": {
          if (parsers.isValidPropertyValue(borderBottomWidth.property, name)) {
            if (parsedValues.has(borderBottomWidth.property)) {
              return;
            }
            parsedValues.set(borderBottomWidth.property, name);
            break;
          } else if (parsers.isValidPropertyValue(borderBottomStyle.property, name)) {
            if (parsedValues.has(borderBottomStyle.property)) {
              return;
            }
            parsedValues.set(borderBottomStyle.property, name);
            break;
          } else if (parsers.isValidPropertyValue(borderBottomColor.property, name)) {
            if (parsedValues.has(borderBottomColor.property)) {
              return;
            }
            parsedValues.set(borderBottomColor.property, name);
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
    const obj = {
      [borderBottomWidth.property]: "medium"
    };
    for (const key of keys) {
      if (parsedValues.has(key)) {
        const parsedValue = parsedValues.get(key);
        if (parsedValue !== module.exports.initialValues.get(key)) {
          obj[key] = parsedValues.get(key);
          if (obj[borderBottomWidth.property] && obj[borderBottomWidth.property] === "medium") {
            delete obj[borderBottomWidth.property];
          }
        }
      }
    }
    return obj;
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._borderSetter(property, v, "");
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global
      });
      if (val || typeof val === "string") {
        const priority =
          !this._priorities.get(shorthand) && this._priorities.has(property)
            ? this._priorities.get(property)
            : "";
        this._borderSetter(property, val, priority);
      }
    }
  },
  get() {
    return this.getPropertyValue(property);
  },
  enumerable: true,
  configurable: true
};

module.exports.property = property;
