"use strict";

const parsers = require("../parsers");
const borderLeftWidth = require("./borderLeftWidth");
const borderLeftStyle = require("./borderLeftStyle");
const borderLeftColor = require("./borderLeftColor");

const property = "border-left";
const shorthand = "border";

module.exports.initialValues = new Map([
  [borderLeftWidth.property, "medium"],
  [borderLeftStyle.property, "none"],
  [borderLeftColor.property, "currentcolor"]
]);

module.exports.shorthandFor = new Map([
  [borderLeftWidth.property, borderLeftWidth],
  [borderLeftStyle.property, borderLeftStyle],
  [borderLeftColor.property, borderLeftColor]
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
          if (isNumber || parsedValues.has(borderLeftWidth.property)) {
            return;
          }
          parsedValues.set(borderLeftWidth.property, `${name}(${itemValue})`);
          break;
        }
        case "Dimension":
        case "Number": {
          if (parsedValues.has(borderLeftWidth.property)) {
            return;
          }
          const parsedValue = parsers.parseLength(value, {
            min: 0
          });
          if (!parsedValue) {
            return;
          }
          parsedValues.set(borderLeftWidth.property, parsedValue);
          break;
        }
        case "Function": {
          if (parsedValues.has(borderLeftColor.property)) {
            return;
          }
          const parsedValue = parsers.parseColor(value);
          if (!parsedValue) {
            return;
          }
          parsedValues.set(borderLeftColor.property, parsedValue);
          break;
        }
        case "GlobalKeyword": {
          return name;
        }
        case "Hash": {
          if (parsedValues.has(borderLeftColor.property)) {
            return;
          }
          const parsedValue = parsers.parseColor(value);
          if (!parsedValue) {
            return;
          }
          parsedValues.set(borderLeftColor.property, parsedValue);
          break;
        }
        case "Identifier": {
          if (parsers.isValidPropertyValue(borderLeftWidth.property, name)) {
            if (parsedValues.has(borderLeftWidth.property)) {
              return;
            }
            parsedValues.set(borderLeftWidth.property, name);
            break;
          } else if (parsers.isValidPropertyValue(borderLeftStyle.property, name)) {
            if (parsedValues.has(borderLeftStyle.property)) {
              return;
            }
            parsedValues.set(borderLeftStyle.property, name);
            break;
          } else if (parsers.isValidPropertyValue(borderLeftColor.property, name)) {
            if (parsedValues.has(borderLeftColor.property)) {
              return;
            }
            parsedValues.set(borderLeftColor.property, name);
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
      [borderLeftWidth.property]: "medium"
    };
    for (const key of keys) {
      if (parsedValues.has(key)) {
        const parsedValue = parsedValues.get(key);
        if (parsedValue !== module.exports.initialValues.get(key)) {
          obj[key] = parsedValues.get(key);
          if (obj[borderLeftWidth.property] && obj[borderLeftWidth.property] === "medium") {
            delete obj[borderLeftWidth.property];
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
        const shorthandPriority = this._priorities.get(shorthand);
        const prior = this._priorities.get(property) ?? "";
        const priority = shorthandPriority && prior ? "" : prior;
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
