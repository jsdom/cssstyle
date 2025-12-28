"use strict";

const parsers = require("../parsers");
const flexGrow = require("./flexGrow");
const flexShrink = require("./flexShrink");
const flexBasis = require("./flexBasis");

const property = "flex";

module.exports.initialValues = new Map([
  [flexGrow.property, "0"],
  [flexShrink.property, "1"],
  [flexBasis.property, "auto"]
]);

module.exports.shorthandFor = new Map([
  [flexGrow.property, flexGrow],
  [flexShrink.property, flexShrink],
  [flexBasis.property, flexBasis]
]);

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue(property, v, {
    globalObject,
    inArray: true
  });
  if (Array.isArray(value) && value.length) {
    const flex = {
      [flexGrow.property]: "1",
      [flexShrink.property]: "1",
      [flexBasis.property]: "0%"
    };
    if (value.length === 1) {
      const [{ isNumber, name, type, unit, value: itemValue }] = value;
      switch (type) {
        case "Calc": {
          if (isNumber) {
            flex[flexGrow.property] = `${name}(${itemValue})`;
            return flex;
          }
          flex[flexBasis.property] = `${name}(${itemValue})`;
          return flex;
        }
        case "Dimension": {
          flex[flexBasis.property] = `${itemValue}${unit}`;
          return flex;
        }
        case "GlobalKeyword": {
          return name;
        }
        case "Identifier": {
          if (name === "none") {
            return {
              [flexGrow.property]: "0",
              [flexShrink.property]: "0",
              [flexBasis.property]: "auto"
            };
          }
          flex[flexBasis.property] = name;
          return flex;
        }
        case "Number": {
          flex[flexGrow.property] = itemValue;
          return flex;
        }
        case "Percentage": {
          flex[flexBasis.property] = `${itemValue}%`;
          return flex;
        }
        default:
      }
    } else {
      const [val1, val2, val3] = value;
      if (val1.type === "Calc" && val1.isNumber) {
        flex[flexGrow.property] = `${val1.name}(${val1.value})`;
      } else if (val1.type === "Number") {
        flex[flexGrow.property] = val1.value;
      } else {
        return;
      }
      if (val3) {
        if (val2.type === "Calc" && val2.isNumber) {
          flex[flexShrink.property] = `${val2.name}(${val2.value})`;
        } else if (val2.type === "Number") {
          flex[flexShrink.property] = val2.value;
        } else {
          return;
        }
        if (val3.type === "GlobalKeyword" || val3.type === "Identifier") {
          flex[flexBasis.property] = val3.name;
        } else if (val3.type === "Calc" && !val3.isNumber) {
          flex[flexBasis.property] = `${val3.name}(${val3.value})`;
        } else if (val3.type === "Dimension") {
          flex[flexBasis.property] = `${val3.value}${val3.unit}`;
        } else if (val3.type === "Percentage") {
          flex[flexBasis.property] = `${val3.value}%`;
        } else {
          return;
        }
      } else {
        switch (val2.type) {
          case "Calc": {
            if (val2.isNumber) {
              flex[flexShrink.property] = `${val2.name}(${val2.value})`;
            } else {
              flex[flexBasis.property] = `${val2.name}(${val2.value})`;
            }
            break;
          }
          case "Dimension": {
            flex[flexBasis.property] = `${val2.value}${val2.unit}`;
            break;
          }
          case "Number": {
            flex[flexShrink.property] = val2.value;
            break;
          }
          case "Percentage": {
            flex[flexBasis.property] = `${val2.value}%`;
            break;
          }
          case "Identifier": {
            flex[flexBasis.property] = val2.name;
            break;
          }
          default: {
            return;
          }
        }
      }
      return flex;
    }
  } else if (typeof value === "string") {
    return value;
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      for (const [longhand] of module.exports.shorthandFor) {
        this._setProperty(longhand, "");
      }
      this._setProperty(property, v);
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global
      });
      const priority = this._priorities.get(property) ?? "";
      if (typeof val === "string") {
        for (const [longhand] of module.exports.shorthandFor) {
          this._setProperty(longhand, val, priority);
        }
        this._setProperty(property, val, priority);
      } else if (val) {
        const values = [];
        for (const [longhand, value] of Object.entries(val)) {
          values.push(value);
          this._setProperty(longhand, value, priority);
        }
        this._setProperty(property, values.join(" "), priority);
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
