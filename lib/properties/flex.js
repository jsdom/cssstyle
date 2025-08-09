"use strict";

const parsers = require("../parsers");
const flexGrow = require("./flexGrow");
const flexShrink = require("./flexShrink");
const flexBasis = require("./flexBasis");

module.exports.shorthandFor = new Map([
  ["flex-grow", flexGrow],
  ["flex-shrink", flexShrink],
  ["flex-basis", flexBasis]
]);

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue("flex", v, {
    globalObject,
    inArray: true
  });
  if (Array.isArray(value) && value.length) {
    if (value.length === 1) {
      const [{ isNumber, name, raw, type, unit, value: itemValue }] = value;
      switch (type) {
        case "Calc": {
          if (isNumber) {
            return `${raw} 1 0%`;
          }
          return `1 1 ${raw}`;
        }
        case "Dimension": {
          return `1 1 ${itemValue}${unit}`;
        }
        case "GlobalKeyword": {
          return name;
        }
        case "Identifier": {
          if (name === "auto") {
            return "1 1 auto";
          } else if (name === "none") {
            return "0 0 auto";
          }
          break;
        }
        case "Number": {
          return `${itemValue} 1 0%`;
        }
        case "Percentage": {
          return `1 1 ${itemValue}%`;
        }
        default:
      }
    } else {
      const flex = {
        "flex-grow": "1",
        "flex-shrink": "1",
        "flex-basis": "0%"
      };
      const [val1, val2, val3] = value;
      if (val1.type === "Calc" && val1.isNumber) {
        flex["flex-grow"] = val1.raw;
      } else if (val1.type === "Number") {
        flex["flex-grow"] = val1.value;
      } else {
        return;
      }
      if (val3) {
        if (val2.type === "Calc" && val2.isNumber) {
          flex["flex-shrink"] = val2.raw;
        } else if (val2.type === "Number") {
          flex["flex-shrink"] = val2.value;
        } else {
          return;
        }
        if (val3.type === "Calc" && !val3.isNumber) {
          flex["flex-basis"] = val3.raw;
        } else if (val3.type === "Dimension") {
          flex["flex-basis"] = `${val3.value}${val3.unit}`;
        } else if (val3.type === "Percentage") {
          flex["flex-basis"] = `${val3.value}%`;
        } else {
          return;
        }
      } else {
        switch (val2.type) {
          case "Calc": {
            if (val2.isNumber) {
              flex["flex-shrink"] = val2.raw;
            } else {
              flex["flex-basis"] = val2.raw;
            }
            break;
          }
          case "Dimension": {
            flex["flex-basis"] = `${val2.value}${val2.unit}`;
            break;
          }
          case "Number": {
            flex["flex-shrink"] = val2.value;
            break;
          }
          case "Percentage": {
            flex["flex-basis"] = `${val2.value}%`;
            break;
          }
          default: {
            return;
          }
        }
      }
      return [...Object.values(flex)].join(" ");
    }
  } else if (typeof value === "string") {
    return value;
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._shorthandSetter("flex", "", module.exports.shorthandFor);
      this._setProperty("flex", v);
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global
      });
      this._shorthandSetter("flex", val, module.exports.shorthandFor);
      this._setProperty("flex", val);
    }
  },
  get() {
    let val = this.getPropertyValue("flex");
    if (parsers.isGlobalKeyword(val) || parsers.hasVarFunc(val)) {
      return val;
    }
    val = this._shorthandGetter("flex", module.exports.shorthandFor);
    if (parsers.hasVarFunc(val)) {
      return "";
    }
    return val;
  },
  enumerable: true,
  configurable: true
};
