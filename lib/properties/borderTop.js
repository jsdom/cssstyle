"use strict";

const parsers = require("../parsers");
const borderTopWidth = require("./borderTopWidth");
const borderTopStyle = require("./borderTopStyle");
const borderTopColor = require("./borderTopColor");

const property = "border-top";
const shorthand = "border";

module.exports.initialValues = new Map([
  [borderTopWidth.property, "medium"],
  [borderTopStyle.property, "none"],
  [borderTopColor.property, "currentcolor"]
]);

module.exports.shorthandFor = new Map([
  [borderTopWidth.property, borderTopWidth],
  [borderTopStyle.property, borderTopStyle],
  [borderTopColor.property, borderTopColor]
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
          if (isNumber || parsedValues.has(borderTopWidth.property)) {
            return;
          }
          parsedValues.set(borderTopWidth.property, `${name}(${itemValue})`);
          break;
        }
        case "Dimension":
        case "Number": {
          if (parsedValues.has(borderTopWidth.property)) {
            return;
          }
          const parsedValue = parsers.parseLength(value, {
            min: 0
          });
          if (!parsedValue) {
            return;
          }
          parsedValues.set(borderTopWidth.property, parsedValue);
          break;
        }
        case "Function": {
          if (parsedValues.has(borderTopColor.property)) {
            return;
          }
          const parsedValue = parsers.parseColor(value);
          if (!parsedValue) {
            return;
          }
          parsedValues.set(borderTopColor.property, parsedValue);
          break;
        }
        case "GlobalKeyword": {
          return name;
        }
        case "Hash": {
          if (parsedValues.has(borderTopColor.property)) {
            return;
          }
          const parsedValue = parsers.parseColor(value);
          if (!parsedValue) {
            return;
          }
          parsedValues.set(borderTopColor.property, parsedValue);
          break;
        }
        case "Identifier": {
          if (parsers.isValidPropertyValue(borderTopWidth.property, name)) {
            if (parsedValues.has(borderTopWidth.property)) {
              return;
            }
            parsedValues.set(borderTopWidth.property, name);
            break;
          } else if (parsers.isValidPropertyValue(borderTopStyle.property, name)) {
            if (parsedValues.has(borderTopStyle.property)) {
              return;
            }
            parsedValues.set(borderTopStyle.property, name);
            break;
          } else if (parsers.isValidPropertyValue(borderTopColor.property, name)) {
            if (parsedValues.has(borderTopColor.property)) {
              return;
            }
            parsedValues.set(borderTopColor.property, name);
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
      [borderTopWidth.property]: "medium"
    };
    for (const key of keys) {
      if (parsedValues.has(key)) {
        const parsedValue = parsedValues.get(key);
        if (parsedValue !== module.exports.initialValues.get(key)) {
          obj[key] = parsedValues.get(key);
          if (obj[borderTopWidth.property] && obj[borderTopWidth.property] === "medium") {
            delete obj[borderTopWidth.property];
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
