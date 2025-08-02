"use strict";

const parsers = require("../parsers");
const flexGrow = require("./flexGrow");
const flexShrink = require("./flexShrink");
const flexBasis = require("./flexBasis");

const replaceKeys = new Map([["initial", "0 1 auto"]]);

module.exports.shorthandFor = new Map([
  ["flex-grow", flexGrow],
  ["flex-shrink", flexShrink],
  ["flex-basis", flexBasis]
]);

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.parseCalc(v);
  }
  if (!parsers.isValidPropertyValue("flex", v)) {
    return;
  }
  const key = parsers.parseKeyword(v, ["auto", "none"]);
  if (key) {
    switch (key) {
      case "auto": {
        return "1 1 auto";
      }
      case "none": {
        return "0 0 auto";
      }
      default: {
        return key;
      }
    }
  }
  const obj = parsers.parseShorthand(v, module.exports.shorthandFor);
  if (obj) {
    const flex = {
      "flex-grow": "1",
      "flex-shrink": "1",
      "flex-basis": "0%"
    };
    const items = Object.entries(obj);
    for (const [property, value] of items) {
      flex[property] = value;
    }
    return [...Object.values(flex)].join(" ");
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._shorthandSetter("flex", "", module.exports.shorthandFor);
      this._setProperty("flex", v);
    } else {
      const val = module.exports.parse(v);
      if (replaceKeys.has(val)) {
        this._shorthandSetter("flex", replaceKeys.get(val), module.exports.shorthandFor);
        this._setProperty("flex", val);
      } else {
        this._shorthandSetter("flex", val, module.exports.shorthandFor);
      }
    }
  },
  get() {
    let val = this.getPropertyValue("flex");
    if (parsers.hasVarFunc(val) || replaceKeys.has(val)) {
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
