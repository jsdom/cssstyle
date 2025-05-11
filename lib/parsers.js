/**
 * These are commonly used parsers for CSS Values they take a string
 * to parse and return a string after it's been converted, if needed
 */
"use strict";

const { resolve: resolveColor, utils } = require("@asamuzakjp/css-color");
const { GLOBAL_VALUES } = require("./constants");

const { cssCalc, isColor, isGradient, splitValue } = utils;

exports.TYPES = {
  UNDEFINED: 0,
  NULL_OR_EMPTY_STR: 1,
  VAR: 2,
  NUMBER: 4,
  PERCENT: 8,
  LENGTH: 0x10,
  ANGLE: 0x20,
  CALC: 0x40,
  COLOR: 0x80,
  STRING: 0x100,
  KEYWORD: 0x200,
  UNIDENT: 0x8000
};

// regular expressions
const DIGIT = "(?:0|[1-9]\\d*)";
const NUMBER = `[+-]?(?:${DIGIT}(?:\\.\\d*)?|\\.\\d+)(?:e-?${DIGIT})?`;
const unitRegEx = new RegExp(`^(${NUMBER})([a-z]+|%)?$`);
const angleRegEx = new RegExp(`^${NUMBER}(?:deg|g?rad|turn)$`);
const urlRegEx = /^url\(\s*((?:[^)]|\\\))*)\s*\)$/;
const keywordRegEx = /^[a-z]+(?:-[a-z]+)*$/i;
const stringRegEx = /^("[^"]*"|'[^']*')$/;
const varRegEx = /^var\(/;
const varContainedRegEx = /(?<=[*/\s(])var\(/;
const calcRegEx =
  /^(?:a?(?:cos|sin|tan)|abs|atan2|calc|clamp|exp|hypot|log|max|min|mod|pow|rem|round|sign|sqrt)\(/;

// This will return one of the above types based on the passed in string
exports.valueType = function valueType(val) {
  // see https://webidl.spec.whatwg.org/#LegacyNullToEmptyString
  if (val === "" || val === null) {
    return exports.TYPES.NULL_OR_EMPTY_STR;
  }
  if (typeof val === "number") {
    val = val.toString();
  }
  if (typeof val !== "string") {
    return exports.TYPES.UNDEFINED;
  }
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
  if (isColor(val)) {
    return exports.TYPES.COLOR;
  }
  if (stringRegEx.test(val)) {
    return exports.TYPES.STRING;
  }

  switch (val.toLowerCase()) {
    // system color keywords
    case "accentcolor":
    case "accentcolortext":
    case "activetext":
    case "buttonborder":
    case "buttonface":
    case "buttontext":
    case "canvas":
    case "canvastext":
    case "field":
    case "fieldtext":
    case "graytext":
    case "highlight":
    case "highlighttext":
    case "linktext":
    case "mark":
    case "marktext":
    case "visitedtext": {
      return exports.TYPES.COLOR;
    }
    // the following are deprecated in CSS3
    case "activeborder":
    case "activecaption":
    case "appworkspace":
    case "background":
    case "buttonhighlight":
    case "buttonshadow":
    case "captiontext":
    case "inactiveborder":
    case "inactivecaption":
    case "inactivecaptiontext":
    case "infobackground":
    case "infotext":
    case "menu":
    case "menutext":
    case "scrollbar":
    case "threeddarkshadow":
    case "threedface":
    case "threedhighlight":
    case "threedlightshadow":
    case "threedshadow":
    case "window":
    case "windowframe":
    case "windowtext": {
      return exports.TYPES.COLOR;
    }
    default: {
      if (keywordRegEx.test(val)) {
        return exports.TYPES.KEYWORD;
      }
      return exports.TYPES.UNIDENT;
    }
  }
};

exports.parseNumber = function parseNumber(val) {
  const type = exports.valueType(val);
  switch (type) {
    case exports.TYPES.NULL_OR_EMPTY_STR:
    case exports.TYPES.VAR:
      return val;
    case exports.TYPES.NUMBER:
      return `${parseFloat(val)}`;
    case exports.TYPES.CALC:
      return cssCalc(val, {
        format: "specifiedValue"
      });
    default:
      if (varContainedRegEx.test(val)) {
        return val;
      }
  }
};

exports.parseLength = function parseLength(val) {
  const type = exports.valueType(val);
  switch (type) {
    case exports.TYPES.NULL_OR_EMPTY_STR:
    case exports.TYPES.VAR:
      return val;
    case exports.TYPES.CALC:
      return cssCalc(val, {
        format: "specifiedValue"
      });
    case exports.TYPES.LENGTH: {
      const [, numVal, unit] = unitRegEx.exec(val);
      return `${parseFloat(numVal)}${unit}`;
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

exports.parsePercent = function parsePercent(val) {
  const type = exports.valueType(val);
  switch (type) {
    case exports.TYPES.NULL_OR_EMPTY_STR:
    case exports.TYPES.VAR:
      return val;
    case exports.TYPES.CALC:
      return cssCalc(val, {
        format: "specifiedValue"
      });
    case exports.TYPES.PERCENT: {
      const [, numVal, unit] = unitRegEx.exec(val);
      return `${parseFloat(numVal)}${unit}`;
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
exports.parseMeasurement = function parseMeasurement(val) {
  const type = exports.valueType(val);
  switch (type) {
    case exports.TYPES.NULL_OR_EMPTY_STR:
    case exports.TYPES.VAR:
      return val;
    case exports.TYPES.CALC:
      return cssCalc(val, {
        format: "specifiedValue"
      });
    case exports.TYPES.LENGTH:
    case exports.TYPES.PERCENT: {
      const [, numVal, unit] = unitRegEx.exec(val);
      return `${parseFloat(numVal)}${unit}`;
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

exports.parseInheritingMeasurement = function parseInheritingMeasurement(val) {
  if (/^(?:auto|inherit)$/i.test(val)) {
    return val.toLowerCase();
  }
  return exports.parseMeasurement(val);
};

exports.parseUrl = function parseUrl(val) {
  const type = exports.valueType(val);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    return "";
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

// NOTE: seems not in use?
exports.parseString = function parseString(val) {
  const type = exports.valueType(val);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    return "";
  }
  if (type !== exports.TYPES.STRING) {
    return;
  }
  let i = 1;
  for (; i < val.length - 1; i++) {
    switch (val[i]) {
      case val[0]:
        return;
      case "\\":
        i++;
        while (i < val.length - 1 && /[0-9A-Fa-f]/.test(val[i])) {
          i++;
        }
        break;
    }
  }
  if (i >= val.length) {
    return;
  }
  return val;
};

exports.parseKeyword = function parseKeyword(val, validKeywords = []) {
  const type = exports.valueType(val);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    return "";
  }
  if (type === exports.TYPES.VAR) {
    return val;
  }
  if (type !== exports.TYPES.KEYWORD) {
    return;
  }
  val = val.toString().toLowerCase();
  if (validKeywords.includes(val) || GLOBAL_VALUES.includes(val)) {
    return val;
  }
};

exports.parseColor = function parseColor(val) {
  const type = exports.valueType(val);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    return "";
  }
  if (type === exports.TYPES.UNDEFINED) {
    return;
  }
  if (type === exports.TYPES.VAR) {
    return val;
  }
  if (type === exports.TYPES.KEYWORD) {
    return exports.parseKeyword(val);
  }
  if (/^[a-z]+$/i.test(val) && type === exports.TYPES.COLOR) {
    return val;
  }
  const res = resolveColor(val, {
    format: "specifiedValue"
  });
  if (res) {
    return res;
  }
};

// FIXME:
// This function seems to be incorrect.
// However, this has no impact so far, as this function is only used by the deprecated `azimuth` property.
exports.parseAngle = function parseAngle(val) {
  const type = exports.valueType(val);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    return "";
  }
  if (type !== exports.TYPES.ANGLE) {
    return;
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

exports.parseImage = function parseImage(val) {
  const type = exports.valueType(val);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    return "";
  }
  if (type === exports.TYPES.UNDEFINED) {
    return;
  }
  if (type === exports.TYPES.VAR) {
    return val;
  }
  if (type === exports.TYPES.KEYWORD) {
    return exports.parseKeyword(val, ["none"]);
  }
  const values = splitValue(val, {
    delimiter: ",",
    preserveComment: varContainedRegEx.test(val)
  });
  let isImage = Boolean(values.length);
  for (let i = 0; i < values.length; i++) {
    const image = values[i];
    if (exports.valueType(image) === exports.TYPES.NULL_OR_EMPTY_STR) {
      return image;
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

// this either returns undefined meaning that it isn't valid
// or returns an object where the keys are dashed short
// hand properties and the values are the values to set
// on them
// FIXME: need additional argument which indicates syntax
// and/or use Map() for shorthandFor to ensure order of the longhand properties.
// Note that there is `constants.js` that is presumably for this purpose?
exports.shorthandParser = function shorthandParser(v, shorthandFor) {
  if (v === undefined) {
    return;
  }
  if (v === null) {
    v = "";
  }
  const obj = {};
  if (v === "") {
    shorthandFor.keys().forEach(function (property) {
      obj[property] = "";
    });
    return obj;
  }
  if (typeof v === "number") {
    v = v.toString();
  }
  if (typeof v !== "string") {
    return;
  }
  if (v.toLowerCase() === "inherit") {
    return {};
  }
  const parts = splitValue(v);
  const shorthandArr = [...shorthandFor];
  let valid = true;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    let partValid = false;
    for (let j = 0; j < shorthandArr.length; j++) {
      const [property, value] = shorthandArr[j];
      if (value.isValid(part, i)) {
        partValid = true;
        obj[property] = part;
        shorthandArr.splice(j, 1);
        break;
      }
    }
    if (valid) {
      valid = partValid;
    }
  }
  if (!valid) {
    return;
  }
  return obj;
};
