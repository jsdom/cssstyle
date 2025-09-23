"use strict";

const parsers = require("../parsers");
const borderRightWidth = require("./borderRightWidth");
const borderRightStyle = require("./borderRightStyle");
const borderRightColor = require("./borderRightColor");

const property = "border-right";
const shorthand = "border";

module.exports.initialValues = new Map([
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
  if (v === "") {
    return v;
  }
  const { globalObject, options } = opt;
  const values = parsers.splitValue(v);
  const parsedValues = new Map();
  for (const val of values) {
    const value = parsers.parsePropertyValue(property, val, {
      globalObject,
      options,
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
          const parseOpt = {
            min: 0
          };
          for (const [key, optVal] of Object.entries(options)) {
            parseOpt[key] = optVal;
          }
          const parsedValue = parsers.parseLength(value, parseOpt);
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
          const parsedValue = parsers.parseColor(value, options);
          if (!parsedValue) {
            return;
          }
          parsedValues.set("border-right-color", parsedValue);
          break;
        }
        case "GlobalKeyword": {
          return name;
        }
        case "Hash": {
          if (parsedValues.has("border-right-color")) {
            return;
          }
          const parsedValue = parsers.parseColor(`#${itemValue}`, options);
          if (!parsedValue) {
            return;
          }
          parsedValues.set("border-right-color", parsedValue);
          break;
        }
        case "Identifier": {
          if (parsers.isValidPropertyValue("border-right-width", name, globalObject)) {
            if (parsedValues.has("border-right-width")) {
              return;
            }
            parsedValues.set("border-right-width", name);
            break;
          } else if (parsers.isValidPropertyValue("border-right-style", name, globalObject)) {
            if (parsedValues.has("border-right-style")) {
              return;
            }
            parsedValues.set("border-right-style", name);
            break;
          } else if (parsers.isValidPropertyValue("border-right-color", name, globalObject)) {
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
    const obj = {
      "border-right-width": "medium"
    };
    for (const key of keys) {
      if (parsedValues.has(key)) {
        const parsedValue = parsedValues.get(key);
        if (parsedValue !== module.exports.initialValues.get(key)) {
          obj[key] = parsedValues.get(key);
          if (obj["border-right-width"] && obj["border-right-width"] === "medium") {
            delete obj["border-right-width"];
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
        globalObject: this._global,
        options: this._options
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
