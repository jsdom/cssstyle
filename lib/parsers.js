/**
 * These are commonly used parsers for CSS Values they take a string to parse
 * and return a string after it's been converted, if needed
 */
"use strict";

const {
  resolve: resolveColor,
  utils: { cssCalc, resolveGradient, splitValue }
} = require("@asamuzakjp/css-color");
const { next: syntaxes } = require("@csstools/css-syntax-patches-for-csstree");
const csstree = require("css-tree");
const { asciiLowercase } = require("./utils/strings");

// CSS global values
// @see https://drafts.csswg.org/css-cascade-5/#defaulting-keywords
const GLOBAL_VALUE = Object.freeze(["initial", "inherit", "unset", "revert", "revert-layer"]);

// Numeric data types
const NUM_TYPE = Object.freeze({
  UNDEFINED: 0,
  NUMBER: 1,
  PERCENT: 2,
  LENGTH: 4,
  ANGLE: 8
});

// System colors
// @see https://drafts.csswg.org/css-color/#css-system-colors
// @see https://drafts.csswg.org/css-color/#deprecated-system-colors
const SYS_COLOR = Object.freeze([
  "accentcolor",
  "accentcolortext",
  "activeborder",
  "activecaption",
  "activetext",
  "appworkspace",
  "background",
  "buttonborder",
  "buttonface",
  "buttonhighlight",
  "buttonshadow",
  "buttontext",
  "canvas",
  "canvastext",
  "captiontext",
  "field",
  "fieldtext",
  "graytext",
  "highlight",
  "highlighttext",
  "inactiveborder",
  "inactivecaption",
  "inactivecaptiontext",
  "infobackground",
  "infotext",
  "linktext",
  "mark",
  "marktext",
  "menu",
  "menutext",
  "scrollbar",
  "selecteditem",
  "selecteditemtext",
  "threeddarkshadow",
  "threedface",
  "threedhighlight",
  "threedlightshadow",
  "threedshadow",
  "visitedtext",
  "window",
  "windowframe",
  "windowtext"
]);

// Regular expressions
const DIGIT = "(?:0|[1-9]\\d*)";
const NUMBER = `[+-]?(?:${DIGIT}(?:\\.\\d*)?|\\.\\d+)(?:e-?${DIGIT})?`;
const CALC_KEY =
  "(?:a?(?:cos|sin|tan)|abs|atan2|calc|clamp|exp|hypot|log|max|min|mod|pow|rem|round|sign|sqrt)";
const unitRegEx = new RegExp(`^(${NUMBER})([a-z]+|%)?$`, "i");
const urlRegEx = /^url\(\s*((?:[^)]|\\\))*)\s*\)$/;
const keywordRegEx = /^[a-z]+(?:-[a-z]+)*$/i;
const stringRegEx = /^("[^"]*"|'[^']*')$/;
const varRegEx = /^var\(/;
const varContainedRegEx = /(?<=[*/\s(])var\(/;
const calcRegEx = new RegExp(`^${CALC_KEY}\\(`);
const calcNameRegEx = new RegExp(`^${CALC_KEY}$`);
const calcContainedRegEx = new RegExp(`(?<=[*/\\s(])${CALC_KEY}\\(`);
const gradientRegEx = /^(?:repeating-)?(?:conic|linear|radial)-gradient\(/;
const functionRegEx = /^([a-z][a-z\d]*(?:-[a-z\d]+)*)\(/i;

const getNumericType = function getNumericType(val) {
  if (unitRegEx.test(val)) {
    const [, , unit] = unitRegEx.exec(val);
    if (!unit) {
      return NUM_TYPE.NUMBER;
    }
    if (unit === "%") {
      return NUM_TYPE.PERCENT;
    }
    if (/^(?:[cm]m|[dls]?v(?:[bhiw]|max|min)|in|p[ctx]|q|r?(?:[cl]h|cap|e[mx]|ic))$/i.test(unit)) {
      return NUM_TYPE.LENGTH;
    }
    if (/^(?:deg|g?rad|turn)$/i.test(unit)) {
      return NUM_TYPE.ANGLE;
    }
  }
  return NUM_TYPE.UNDEFINED;
};

// Patch css-tree
const cssTree = csstree.fork(syntaxes);

// Prepare stringified value.
exports.prepareValue = function prepareValue(value, globalObject = globalThis) {
  // `null` is converted to an empty string.
  // @see https://webidl.spec.whatwg.org/#LegacyNullToEmptyString
  if (value === null) {
    return "";
  }
  const type = typeof value;
  switch (type) {
    case "string":
      return value.trim();
    case "number":
      return value.toString();
    case "undefined":
      return "undefined";
    case "symbol":
      throw new globalObject.TypeError("Can not convert symbol to string.");
    default: {
      const str = value.toString();
      if (typeof str === "string") {
        return str;
      }
      throw new globalObject.TypeError(`Can not convert ${type} to string.`);
    }
  }
};

// Value starts with and/or contains CSS var() function
exports.hasVarFunc = function hasVarFunc(val) {
  return varRegEx.test(val) || varContainedRegEx.test(val);
};

// Value starts with and/or contains CSS calc() related functions
exports.hasCalcFunc = function hasCalcFunc(val) {
  return calcRegEx.test(val) || calcContainedRegEx.test(val);
};

// Splits value into an array.
// @see https://github.com/asamuzaK/cssColor/blob/main/src/js/util.ts
exports.splitValue = splitValue;

// Parse CSS to AST or Object
exports.parseCSS = function parseCSS(val, opt, toObject = false) {
  const ast = cssTree.parse(val, opt);
  if (toObject) {
    return cssTree.toPlainObject(ast);
  }
  return ast;
};

// Returns `false` for custom property and/or var().
exports.isValidPropertyValue = function isValidPropertyValue(prop, val) {
  if (val === "") {
    return true;
  }
  // cssTree.lexer does not support deprecated system colors
  // @see https://github.com/w3c/webref/issues/1519#issuecomment-3120290261
  if (SYS_COLOR.includes(asciiLowercase(val))) {
    if (/^(?:-webkit-)?(?:[a-z][a-z\d]*-)*color$/i.test(prop)) {
      return true;
    }
    return false;
  }
  let ast;
  try {
    ast = exports.parseCSS(val, {
      context: "value"
    });
  } catch {
    return false;
  }
  const { error, matched } = cssTree.lexer.matchProperty(prop, ast);
  return error === null && matched !== null;
};

exports.parseCalc = function parseCalc(val, opt = { format: "specifiedValue" }) {
  if (val === "" || exports.hasVarFunc(val) || !exports.hasCalcFunc(val)) {
    return val;
  }
  const obj = exports.parseCSS(val, { context: "value" }, true);
  if (!obj?.children) {
    return;
  }
  const { children: items } = obj;
  const values = [];
  for (const item of items) {
    const { type: itemType, name: itemName, value: itemValue } = item;
    if (itemType === "Function") {
      const value = cssTree.generate(item).replaceAll(")", ") ").trim();
      if (calcNameRegEx.test(itemName)) {
        const newValue = cssCalc(value, opt);
        values.push(newValue);
      } else {
        values.push(value);
      }
    } else if (itemType === "String") {
      values.push(`"${itemValue}"`);
    } else {
      values.push(itemName ?? itemValue);
    }
  }
  return values.join(" ");
};

exports.parseNumber = function parseNumber(val, restrictToPositive = false) {
  if (val === "" || exports.hasVarFunc(val)) {
    return val;
  } else if (exports.hasCalcFunc(val)) {
    return exports.parseCalc(val, {
      format: "specifiedValue"
    });
  }
  const type = getNumericType(val);
  if (type === NUM_TYPE.NUMBER) {
    const num = parseFloat(val);
    if (restrictToPositive && num < 0) {
      return;
    }
    return `${num}`;
  }
};

exports.parseLength = function parseLength(val, restrictToPositive = false) {
  if (val === "" || exports.hasVarFunc(val)) {
    return val;
  } else if (exports.hasCalcFunc(val)) {
    return exports.parseCalc(val, {
      format: "specifiedValue"
    });
  }
  const type = getNumericType(val);
  switch (type) {
    case NUM_TYPE.NUMBER: {
      if (parseFloat(val) === 0) {
        return "0px";
      }
      break;
    }
    case NUM_TYPE.LENGTH: {
      const [, numVal, unit] = unitRegEx.exec(val);
      const num = parseFloat(numVal);
      if (restrictToPositive && num < 0) {
        return;
      }
      return `${num}${asciiLowercase(unit)}`;
    }
    default:
  }
};

exports.parsePercent = function parsePercent(val, restrictToPositive = false) {
  if (val === "" || exports.hasVarFunc(val)) {
    return val;
  } else if (exports.hasCalcFunc(val)) {
    return exports.parseCalc(val, {
      format: "specifiedValue"
    });
  }
  const type = getNumericType(val);
  switch (type) {
    case NUM_TYPE.NUMBER: {
      if (parseFloat(val) === 0) {
        return "0%";
      }
      break;
    }
    case NUM_TYPE.PERCENT: {
      const [, numVal, unit] = unitRegEx.exec(val);
      const num = parseFloat(numVal);
      if (restrictToPositive && num < 0) {
        return;
      }
      return `${num}${asciiLowercase(unit)}`;
    }
    default:
  }
};

// Either a length or a percent.
exports.parseMeasurement = function parseMeasurement(val, restrictToPositive = false) {
  if (val === "" || exports.hasVarFunc(val)) {
    return val;
  } else if (exports.hasCalcFunc(val)) {
    return exports.parseCalc(val, {
      format: "specifiedValue"
    });
  }
  const type = getNumericType(val);
  switch (type) {
    case NUM_TYPE.NUMBER: {
      if (parseFloat(val) === 0) {
        return "0px";
      }
      break;
    }
    case NUM_TYPE.LENGTH:
    case NUM_TYPE.PERCENT: {
      const [, numVal, unit] = unitRegEx.exec(val);
      const num = parseFloat(numVal);
      if (restrictToPositive && num < 0) {
        return;
      }
      return `${num}${asciiLowercase(unit)}`;
    }
    default:
  }
};

exports.parseAngle = function parseAngle(val, normalizeDeg = false) {
  if (val === "" || exports.hasVarFunc(val)) {
    return val;
  } else if (exports.hasCalcFunc(val)) {
    return exports.parseCalc(val, {
      format: "specifiedValue"
    });
  }
  const type = getNumericType(val);
  switch (type) {
    case NUM_TYPE.NUMBER: {
      if (parseFloat(val) === 0) {
        return "0deg";
      }
      break;
    }
    case NUM_TYPE.ANGLE: {
      let [, numVal, unit] = unitRegEx.exec(val);
      numVal = parseFloat(numVal);
      unit = asciiLowercase(unit);
      if (unit === "deg") {
        if (normalizeDeg && numVal < 0) {
          while (numVal < 0) {
            numVal += 360;
          }
        }
        numVal %= 360;
      }
      return `${numVal}${unit}`;
    }
    default:
  }
};

exports.parseUrl = function parseUrl(val) {
  if (val === "") {
    return val;
  }
  const res = urlRegEx.exec(val);
  if (!res) {
    return;
  }
  let str = res[1];
  // If it starts with single or double quotes, does it end with the same?
  if ((str[0] === '"' || str[0] === "'") && str[0] !== str[str.length - 1]) {
    return;
  }
  if (str[0] === '"' || str[0] === "'") {
    str = str.substr(1, str.length - 2);
  }
  let urlstr = "";
  let escaped = false;
  for (let i = 0; i < str.length; i++) {
    switch (str[i]) {
      case "\\":
        if (escaped) {
          urlstr += "\\\\";
          escaped = false;
        } else {
          escaped = true;
        }
        break;
      case "(":
      case ")":
      case " ":
      case "\t":
      case "\n":
      case "'":
        if (!escaped) {
          return;
        }
        urlstr += str[i];
        escaped = false;
        break;
      case '"':
        if (!escaped) {
          return;
        }
        urlstr += '\\"';
        escaped = false;
        break;
      default:
        urlstr += str[i];
        escaped = false;
    }
  }
  return `url("${urlstr}")`;
};

exports.parseString = function parseString(val) {
  if (val === "") {
    return "";
  }
  if (!stringRegEx.test(val)) {
    return;
  }
  val = val.substr(1, val.length - 2);
  let str = "";
  let escaped = false;
  for (let i = 0; i < val.length; i++) {
    switch (val[i]) {
      case "\\":
        if (escaped) {
          str += "\\\\";
          escaped = false;
        } else {
          escaped = true;
        }
        break;
      case '"':
        str += '\\"';
        escaped = false;
        break;
      default:
        str += val[i];
        escaped = false;
    }
  }
  return `"${str}"`;
};

exports.parseKeyword = function parseKeyword(val, validKeywords = []) {
  if (val === "") {
    return "";
  }
  if (varRegEx.test(val)) {
    return val;
  }
  val = asciiLowercase(val);
  if (validKeywords.includes(val) || GLOBAL_VALUE.includes(val)) {
    return val;
  }
};

exports.parseColor = function parseColor(val) {
  if (val === "") {
    return "";
  }
  if (varRegEx.test(val)) {
    return val;
  }
  if (/^[a-z]+$/i.test(val)) {
    const v = asciiLowercase(val);
    if (SYS_COLOR.includes(v)) {
      return v;
    }
  }
  const res = resolveColor(val, {
    format: "specifiedValue"
  });
  if (res) {
    return res;
  }
  return exports.parseKeyword(val);
};

exports.parseImage = function parseImage(val) {
  if (val === "") {
    return "";
  }
  if (gradientRegEx.test(val) && exports.hasVarFunc(val)) {
    return val;
  }
  if (keywordRegEx.test(val)) {
    return exports.parseKeyword(val, ["none"]);
  }
  const res = resolveGradient(val, {
    format: "specifiedValue"
  });
  if (res) {
    return res;
  }
  return exports.parseUrl(val);
};

exports.parseFunction = function parseFunction(val) {
  if (val === "") {
    return {
      name: null,
      value: ""
    };
  }
  if (functionRegEx.test(val) && val.endsWith(")")) {
    if (varRegEx.test(val) || varContainedRegEx.test(val)) {
      return {
        name: "var",
        value: val
      };
    }
    const [, name] = functionRegEx.exec(val);
    const value = val
      .replace(new RegExp(`^${name}\\(`), "")
      .replace(/\)$/, "")
      .trim();
    return {
      name,
      value
    };
  }
};

exports.parseShorthand = function parseShorthand(val, shorthandFor, preserve = false) {
  const obj = {};
  if (val === "" || exports.hasVarFunc(val)) {
    for (const [property] of shorthandFor) {
      obj[property] = "";
    }
    return obj;
  }
  const key = exports.parseKeyword(val);
  if (key) {
    if (key === "inherit") {
      return obj;
    }
    return;
  }
  const parts = splitValue(val);
  const shorthandArr = [...shorthandFor];
  for (let part of parts) {
    if (exports.hasCalcFunc(part)) {
      part = exports.parseCalc(part);
    }
    let partValid = false;
    for (let i = 0; i < shorthandArr.length; i++) {
      const [property, value] = shorthandArr[i];
      if (exports.isValidPropertyValue(property, part)) {
        partValid = true;
        obj[property] = value.parse(part);
        if (!preserve) {
          shorthandArr.splice(i, 1);
          break;
        }
      }
    }
    if (!partValid) {
      return;
    }
  }
  return obj;
};
