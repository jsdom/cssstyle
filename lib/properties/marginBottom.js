"use strict";

const parsers = require("../parsers");

const property = "margin-bottom";
const shorthand = "margin";

const position = "bottom";

const parse = (v) => {
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue(property, v);
  if (Array.isArray(value) && value.length === 1) {
    return parsers.resolveNumericValue(value, {
      type: "length"
    });
  } else if (typeof value === "string") {
    return value;
  }
};

const descriptor = {
  set(v) {
    v = parsers.prepareValue(v);
    if (parsers.hasVarFunc(v)) {
      this._setProperty(shorthand, "");
      this._setProperty(property, v);
    } else {
      const val = parse(v);
      if (typeof val === "string") {
        const priority =
          !this._priorities.get(shorthand) && this._priorities.has(property)
            ? this._priorities.get(property)
            : "";
        this._positionLonghandSetter(property, val, priority, shorthand);
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
  position,
  property
};
