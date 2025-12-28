"use strict";

const parsers = require("../parsers");
const borderRightWidth = require("./borderRightWidth");
const borderRightStyle = require("./borderRightStyle");
const borderRightColor = require("./borderRightColor");

const property = "border-right";
const shorthand = "border";

module.exports.initialValues = new Map([
  [borderRightWidth.property, "medium"],
  [borderRightStyle.property, "none"],
  [borderRightColor.property, "currentcolor"]
]);

module.exports.shorthandFor = new Map([
  [borderRightWidth.property, borderRightWidth],
  [borderRightStyle.property, borderRightStyle],
  [borderRightColor.property, borderRightColor]
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
          if (isNumber || parsedValues.has(borderRightWidth.property)) {
            return;
          }
          parsedValues.set(borderRightWidth.property, `${name}(${itemValue})`);
          break;
        }
        case "Dimension":
        case "Number": {
          if (parsedValues.has(borderRightWidth.property)) {
            return;
          }
          const parsedValue = parsers.parseLength(value, {
            min: 0
          });
          if (!parsedValue) {
            return;
          }
          parsedValues.set(borderRightWidth.property, parsedValue);
          break;
        }
        case "Function": {
          if (parsedValues.has(borderRightColor.property)) {
            return;
          }
          const parsedValue = parsers.parseColor(value);
          if (!parsedValue) {
            return;
          }
          parsedValues.set(borderRightColor.property, parsedValue);
          break;
        }
        case "GlobalKeyword": {
          return name;
        }
        case "Hash": {
          if (parsedValues.has(borderRightColor.property)) {
            return;
          }
          const parsedValue = parsers.parseColor(value);
          if (!parsedValue) {
            return;
          }
          parsedValues.set(borderRightColor.property, parsedValue);
          break;
        }
        case "Identifier": {
          if (parsers.isValidPropertyValue(borderRightWidth.property, name)) {
            if (parsedValues.has(borderRightWidth.property)) {
              return;
            }
            parsedValues.set(borderRightWidth.property, name);
            break;
          } else if (parsers.isValidPropertyValue(borderRightStyle.property, name)) {
            if (parsedValues.has(borderRightStyle.property)) {
              return;
            }
            parsedValues.set(borderRightStyle.property, name);
            break;
          } else if (parsers.isValidPropertyValue(borderRightColor.property, name)) {
            if (parsedValues.has(borderRightColor.property)) {
              return;
            }
            parsedValues.set(borderRightColor.property, name);
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
      [borderRightWidth.property]: "medium"
    };
    for (const key of keys) {
      if (parsedValues.has(key)) {
        const parsedValue = parsedValues.get(key);
        if (parsedValue !== module.exports.initialValues.get(key)) {
          obj[key] = parsedValues.get(key);
          if (obj[borderRightWidth.property] && obj[borderRightWidth.property] === "medium") {
            delete obj[borderRightWidth.property];
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
