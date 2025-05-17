/**
 * These are commonly used parsers for CSS Values they take a string to parse
 * and return a string after it's been converted, if needed
 */
"use strict";

const { resolve: resolveColor, utils } = require("@asamuzakjp/css-color");
const { GLOBAL_VALUES } = require("./constants");

const { cssCalc, isColor, isGradient, splitValue } = utils;
exports.splitValue = splitValue;

// constants
exports.TYPES = {
  UNDEFINED: 0,
  VAR: 1,
  NUMBER: 2,
  PERCENT: 4,
  LENGTH: 8,
  ANGLE: 0x10,
  CALC: 0x20
};
const SYS_COLOR = [
  "accentcolor",
  "accentcolortext",
  "activetext",
  "buttonborder",
  "buttonface",
  "buttontext",
  "canvas",
  "canvastext",
  "field",
  "fieldtext",
  "graytext",
  "highlight",
  "highlighttext",
  "linktext",
  "mark",
  "marktext",
  "visitedtext",
  "activeborder",
  "activecaption",
  "appworkspace",
  "background",
  "buttonhighlight",
  "buttonshadow",
  "captiontext",
  "inactiveborder",
  "inactivecaption",
  "inactivecaptiontext",
  "infobackground",
  "infotext",
  "menu",
  "menutext",
  "scrollbar",
  "threeddarkshadow",
  "threedface",
  "threedhighlight",
  "threedlightshadow",
  "threedshadow",
  "window",
  "windowframe",
  "windowtext"
];
const DIGIT = "(?:0|[1-9]\\d*)";
const NUMBER = `[+-]?(?:${DIGIT}(?:\\.\\d*)?|\\.\\d+)(?:e-?${DIGIT})?`;

// regular expressions
const unitRegEx = new RegExp(`^(${NUMBER})([a-z]+|%)?$`);
const angleRegEx = new RegExp(`^${NUMBER}(?:deg|g?rad|turn)$`);
const urlRegEx = /^url\(\s*((?:[^)]|\\\))*)\s*\)$/;
const keywordRegEx = /^[a-z]+(?:-[a-z]+)*$/i;
const stringRegEx = /^("[^"]*"|'[^']*')$/;
const varRegEx = /^var\(/;
const varContainedRegEx = /(?<=[*/\s(])var\(/;
const calcRegEx =
  /^(?:a?(?:cos|sin|tan)|abs|atan2|calc|clamp|exp|hypot|log|max|min|mod|pow|rem|round|sign|sqrt)\(/;

// prepare stringified value.
// NOTE: null is converted to an empty string.
// @see https://webidl.spec.whatwg.org/#LegacyNullToEmptyString
exports.prepareValue = function prepareValue(value) {
  if (value === undefined) {
    value = "undefined";
  } else if (value === null) {
    value = "";
  } else if (typeof value === "number") {
    value = value.toString();
  }
  return value;
};

// This will return one of the above types based on the passed in string
exports.valueType = function valueType(val) {
  val = exports.prepareValue(val);
  if (varRegEx.test(val)) {
    return exports.TYPES.VAR;
  }
  if (calcRegEx.test(val)) {
    return exports.TYPES.CALC;
  }
  if (unitRegEx.test(val)) {
    const [, , unit] = unitRegEx.exec(val);
    if (!unit) {
      return exports.TYPES.NUMBER;
    }
    if (unit === "%") {
      return exports.TYPES.PERCENT;
    }
    if (/^(?:[cm]m|[dls]?v(?:[bhiw]|max|min)|in|p[ctx]|q|r?(?:[cl]h|cap|e[mx]|ic))$/.test(unit)) {
      return exports.TYPES.LENGTH;
    }
    if (/^(?:deg|g?rad|turn)$/.test(unit)) {
      return exports.TYPES.ANGLE;
    }
  }
  return exports.TYPES.UNDEFINED;
};

exports.parseNumber = function parseNumber(val, positive = false) {
  val = exports.prepareValue(val);
  if (val === "") {
    return "";
  }
  const type = exports.valueType(val);
  switch (type) {
    case exports.TYPES.VAR:
      return val;
    case exports.TYPES.CALC:
      return cssCalc(val, {
        format: "specifiedValue"
      });
    case exports.TYPES.NUMBER: {
      const num = parseFloat(val);
      if (Number.isNaN(num)) {
        return;
      }
      if (positive && num < 0) {
        return;
      }
      return `${num}`;
    }
    default:
      if (varContainedRegEx.test(val)) {
        return val;
      }
  }
};

exports.parseLength = function parseLength(val, positive = false) {
  val = exports.prepareValue(val);
  if (val === "") {
    return "";
  }
  const type = exports.valueType(val);
  switch (type) {
    case exports.TYPES.VAR:
      return val;
    case exports.TYPES.CALC:
      return cssCalc(val, {
        format: "specifiedValue"
      });
    case exports.TYPES.LENGTH: {
      const [, numVal, unit] = unitRegEx.exec(val);
      const num = parseFloat(numVal);
      if (positive && num < 0) {
        return;
      }
      return `${num}${unit}`;
    }
    default:
      if (varContainedRegEx.test(val)) {
        return val;
      }
      if (type === exports.TYPES.NUMBER && parseFloat(val) === 0) {
        return "0px";
      }
  }
};

exports.parsePercent = function parsePercent(val, positive = false) {
  val = exports.prepareValue(val);
  if (val === "") {
    return "";
  }
  const type = exports.valueType(val);
  switch (type) {
    case exports.TYPES.VAR:
      return val;
    case exports.TYPES.CALC:
      return cssCalc(val, {
        format: "specifiedValue"
      });
    case exports.TYPES.PERCENT: {
      const [, numVal, unit] = unitRegEx.exec(val);
      const num = parseFloat(numVal);
      if (positive && num < 0) {
        return;
      }
      return `${num}${unit}`;
    }
    default:
      if (varContainedRegEx.test(val)) {
        return val;
      }
      if (type === exports.TYPES.NUMBER && parseFloat(val) === 0) {
        return "0%";
      }
  }
};

// either a length or a percent
exports.parseMeasurement = function parseMeasurement(val, positive = false) {
  val = exports.prepareValue(val);
  if (val === "") {
    return "";
  }
  const type = exports.valueType(val);
  switch (type) {
    case exports.TYPES.VAR:
      return val;
    case exports.TYPES.CALC:
      return cssCalc(val, {
        format: "specifiedValue"
      });
    case exports.TYPES.LENGTH:
    case exports.TYPES.PERCENT: {
      const [, numVal, unit] = unitRegEx.exec(val);
      const num = parseFloat(numVal);
      if (positive && num < 0) {
        return;
      }
      return `${num}${unit}`;
    }
    default:
      if (varContainedRegEx.test(val)) {
        return val;
      }
      if (type === exports.TYPES.NUMBER && parseFloat(val) === 0) {
        return "0px";
      }
  }
};

// FIXME:
// This function seems to be incorrect.
// However, this has no impact so far, as this function is not used
exports.parseAngle = function parseAngle(val) {
  val = exports.prepareValue(val);
  if (val === "") {
    return "";
  }
  const type = exports.valueType(val);
  if (type === exports.TYPES.CALC) {
    return val;
  }
  const res = angleRegEx.exec(val);
  let flt = parseFloat(res[1]);
  if (res[2] === "rad") {
    flt *= 180 / Math.PI;
  } else if (res[2] === "grad") {
    flt *= 360 / 400;
  }
  while (flt < 0) {
    flt += 360;
  }
  while (flt > 360) {
    flt -= 360;
  }
  return `${flt}deg`;
};

exports.parseUrl = function parseUrl(val) {
  val = exports.prepareValue(val);
  if (val === "") {
    return val;
  }
  const res = urlRegEx.exec(val);
  // does it match the regex?
  if (!res) {
    return;
  }
  let str = res[1];
  // if it starts with single or double quotes, does it end with the same?
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
  val = exports.prepareValue(val);
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
  val = exports.prepareValue(val);
  if (val === "") {
    return "";
  }
  if (varRegEx.test(val)) {
    return val;
  }
  val = val.toString().toLowerCase();
  if (validKeywords.includes(val) || GLOBAL_VALUES.includes(val)) {
    return val;
  }
};

exports.parseColor = function parseColor(val) {
  val = exports.prepareValue(val);
  if (val === "") {
    return "";
  }
  if (varRegEx.test(val)) {
    return val;
  }
  if (/^[a-z]+$/i.test(val) && SYS_COLOR.includes(val.toLowerCase())) {
    return val;
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
  val = exports.prepareValue(val);
  if (val === "") {
    return "";
  }
  if (varRegEx.test(val)) {
    return val;
  }
  if (keywordRegEx.test(val)) {
    return exports.parseKeyword(val, ["none"]);
  }
  const values = splitValue(val, {
    delimiter: ",",
    preserveComment: varContainedRegEx.test(val)
  });
  let isImage = Boolean(values.length);
  for (let i = 0; i < values.length; i++) {
    const image = values[i];
    if (image === "") {
      return "";
    }
    if (isGradient(image) || /^(?:none|inherit)$/i.test(image)) {
      continue;
    }
    const imageUrl = exports.parseUrl(image);
    if (imageUrl) {
      values[i] = imageUrl;
    } else {
      isImage = false;
      break;
    }
  }
  if (isImage) {
    return values.join(", ");
  }
};

exports.parseShorthand = function parseShorthand(val, shorthandFor, preserve = false) {
  val = exports.prepareValue(val);
  const obj = {};
  if (val === "") {
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
  for (const part of parts) {
    let partValid = false;
    for (let i = 0; i < shorthandArr.length; i++) {
      const [property, value] = shorthandArr[i];
      if (value.isValid(part)) {
        partValid = true;
        obj[property] = part;
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

// NOTE: returns false for global CSS values, e.g. "inherit"
exports.isValidColor = function isValidColor(val) {
  val = exports.prepareValue(val);
  if (SYS_COLOR.includes(val.toLowerCase())) {
    return true;
  }
  return isColor(val);
};
