"use strict";

const parsers = require("../parsers");

const property = "border-top-style";
const lineShorthand = "border-style";
const positionShorthand = "border-top";
const shorthand = "border";

const parse = (v) => {
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue(property, v);
  if (Array.isArray(value) && value.length === 1) {
    return parsers.resolveKeywordValue(value);
  } else if (typeof value === "string") {
    return value;
  }
};

const descriptor = {
  set(v) {
    v = parsers.prepareValue(v);
    if (parsers.hasVarFunc(v)) {
      this._borderSetter(property, v, "");
    } else {
      const val = parse(v);
      if (typeof val === "string") {
        const shorthandPriority = this._priorities.get(shorthand);
        const linePriority = this._priorities.get(lineShorthand);
        const positionPriority = this._priorities.get(positionShorthand);
        const priority =
          !(shorthandPriority || linePriority || positionPriority) && this._priorities.has(property)
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

module.exports = {
  descriptor,
  parse,
  property
};
