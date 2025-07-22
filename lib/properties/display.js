"use strict";

const parsers = require("../parsers");

/* keywords */
const displayOutside = ["block", "inline", "run-in"];
const displayFlow = ["flow", "flow-root"];
const displayInside = ["table", "flex", "grid", "ruby", ...displayFlow];
const displayListItem = ["list-item"];
const displayInternal = [
  "table-row-group",
  "table-header-group",
  "table-footer-group",
  "table-row",
  "table-cell",
  "table-column-group",
  "table-column",
  "table-caption",
  "ruby-base",
  "ruby-text",
  "ruby-base-container",
  "ruby-text-container"
];
const displayBox = ["contents", "none"];
const displayLegacy = ["inline-block", "inline-table", "inline-flex", "inline-grid"];
const keywords = [
  ...displayOutside,
  ...displayInside,
  ...displayListItem,
  ...displayInternal,
  ...displayBox,
  ...displayLegacy
];

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  }
  const values = parsers.splitValue(v);
  switch (values.length) {
    case 1: {
      let [v1] = values;
      v1 = parsers.parseKeyword(v1, keywords);
      if (v1) {
        if (v1 === "flow") {
          return "block";
        }
        return v1;
      }
      break;
    }
    case 2: {
      let [v1, v2] = values;
      v1 = parsers.parseKeyword(v1, keywords);
      v2 = parsers.parseKeyword(v2, keywords);
      if (!v1 || !v2) {
        return;
      }
      let outerValue = "";
      let innerValue = "";
      if (v1 === "list-item") {
        outerValue = v2;
        innerValue = v1;
      } else if (v2 === "list-item") {
        outerValue = v1;
        innerValue = v2;
      } else if (displayOutside.includes(v1)) {
        outerValue = v1;
        innerValue = v2;
      } else if (displayOutside.includes(v2)) {
        outerValue = v2;
        innerValue = v1;
      }
      if (innerValue === "list-item") {
        switch (outerValue) {
          case "block":
          case "flow": {
            return innerValue;
          }
          case "flow-root":
          case "inline":
          case "run-in": {
            return `${outerValue} ${innerValue}`;
          }
          default:
        }
      } else if (outerValue === "block") {
        switch (innerValue) {
          case "flow": {
            return outerValue;
          }
          case "flow-root":
          case "flex":
          case "grid":
          case "table": {
            return innerValue;
          }
          case "ruby": {
            return `${outerValue} ${innerValue}`;
          }
          default:
        }
      } else if (outerValue === "inline") {
        switch (innerValue) {
          case "flow": {
            return outerValue;
          }
          case "flow-root": {
            return `${outerValue}-block`;
          }
          case "flex":
          case "grid":
          case "table": {
            return `${outerValue}-${innerValue}`;
          }
          case "ruby": {
            return innerValue;
          }
          default:
        }
      } else if (outerValue === "run-in") {
        switch (innerValue) {
          case "flow": {
            return outerValue;
          }
          case "flow-root":
          case "flex":
          case "grid":
          case "table":
          case "ruby": {
            return `${outerValue} ${innerValue}`;
          }
          default:
        }
      }
      break;
    }
    case 3: {
      let [v1, v2, v3] = values;
      v1 = parsers.parseKeyword(v1, keywords);
      v2 = parsers.parseKeyword(v2, keywords);
      v3 = parsers.parseKeyword(v3, keywords);
      if (!v1 || !v2 || !v3) {
        return;
      }
      let outerValue = "";
      let flowValue = "";
      let listItemValue = "";
      if (v1 === "list-item") {
        listItemValue = v1;
        if (displayFlow.includes(v2)) {
          flowValue = v2;
          outerValue = v3;
        } else if (displayFlow.includes(v3)) {
          flowValue = v3;
          outerValue = v2;
        }
      } else if (v2 === "list-item") {
        listItemValue = v2;
        if (displayFlow.includes(v1)) {
          flowValue = v1;
          outerValue = v3;
        } else if (displayFlow.includes(v3)) {
          flowValue = v3;
          outerValue = v1;
        }
      } else if (v3 === "list-item") {
        listItemValue = v3;
        if (displayFlow.includes(v1)) {
          flowValue = v1;
          outerValue = v2;
        } else if (displayFlow.includes(v2)) {
          flowValue = v2;
          outerValue = v1;
        }
      }
      if (outerValue && flowValue && listItemValue) {
        switch (outerValue) {
          case "block": {
            if (flowValue === "flow") {
              return listItemValue;
            }
            return `${flowValue} ${listItemValue}`;
          }
          case "inline":
          case "run-in": {
            if (flowValue === "flow") {
              return `${outerValue} ${listItemValue}`;
            }
            return `${outerValue} ${flowValue} ${listItemValue}`;
          }
        }
      }
      break;
    }
    default:
  }
};

module.exports.isValid = function isValid(v) {
  if (v === "") {
    return true;
  }
  return typeof module.exports.parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    this._setProperty("display", module.exports.parse(v));
  },
  get() {
    return this.getPropertyValue("display");
  },
  enumerable: true,
  configurable: true
};
