"use strict";

const parsers = require("../parsers");
const flexGrow = require("./flexGrow");
const flexShrink = require("./flexShrink");
const flexBasis = require("./flexBasis");

const shorthandFor = new Map([
  ["flex-grow", flexGrow],
  ["flex-shrink", flexShrink],
  ["flex-basis", flexBasis]
]);

const parse = function parse(v) {
  const key = parsers.parseKeyword(v, ["auto", "none"]);
  if (key) {
    if (key === "auto") {
      return "1 1 auto";
    }
    if (key === "none") {
      return "0 0 auto";
    }
    if (key === "initial") {
      return "0 1 auto";
    }
    return;
  }
  const obj = parsers.parseShorthand(v, shorthandFor);
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

module.exports.isValid = function isValid(v) {
  v = parsers.prepareValue(v);
  if (v === "") {
    return true;
  }
  return typeof parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v);
    this._shorthandSetter("flex", parse(v), shorthandFor);
  },
  get() {
    return this._shorthandGetter("flex", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
