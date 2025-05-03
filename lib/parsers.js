/*********************************************************************
 * These are commonly used parsers for CSS Values they take a string *
 * to parse and return a string after it's been converted, if needed *
 ********************************************************************/
'use strict';

// FIXME: should move shorthandGetter(), shorthandSetter(), implicitSetter() and
// subImplicitSetter() to CSSStyleDeclaration()

const { resolve: resolveColor, utils } = require('@asamuzakjp/css-color');
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
  UNIDENT: 0x8000,
};

// CSS global values
exports.GLOBAL_VALUES = Object.freeze(['initial', 'inherit', 'unset', 'revert', 'revert-layer']);

// regular expressions
var DIGIT = '(?:0|[1-9]\\d*)';
var NUMBER = `[+-]?(?:${DIGIT}(?:\\.\\d*)?|\\.\\d+)(?:e-?${DIGIT})?`;
var unitRegEx = new RegExp(`^(${NUMBER})([a-z]+|%)?$`);
var angleRegEx = new RegExp(`^${NUMBER}(?:deg|g?rad|turn)$`);
var urlRegEx = /^url\(\s*((?:[^)]|\\\))*)\s*\)$/;
var keywordRegEx = /^[a-z]+(?:\-[a-z]+)*$/i;
var stringRegEx = /^("[^"]*"|'[^']*')$/;
var varRegEx = /^var\(/;
var varContainedRegEx = /(?<=[*/\s(])var\(/;
var calcRegEx =
  /^(?:a?(?:cos|sin|tan)|abs|atan2|calc|clamp|exp|hypot|log|max|min|mod|pow|rem|round|sign|sqrt)\(/;

// This will return one of the above types based on the passed in string
exports.valueType = function valueType(val) {
  // see https://webidl.spec.whatwg.org/#LegacyNullToEmptyString
  if (val === '' || val === null) {
    return exports.TYPES.NULL_OR_EMPTY_STR;
  }
  if (typeof val === 'number') {
    val = val.toString();
  }
  if (typeof val !== 'string') {
    return exports.TYPES.UNDEFINED;
  }
  if (varRegEx.test(val)) {
    return exports.TYPES.VAR;
  }
  if (calcRegEx.test(val)) {
    return exports.TYPES.CALC;
  }
  if (unitRegEx.test(val)) {
    var [, , unit] = unitRegEx.exec(val);
    if (!unit) {
      return exports.TYPES.NUMBER;
    }
    if (unit === '%') {
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
    case 'accentcolor':
    case 'accentcolortext':
    case 'activetext':
    case 'buttonborder':
    case 'buttonface':
    case 'buttontext':
    case 'canvas':
    case 'canvastext':
    case 'field':
    case 'fieldtext':
    case 'graytext':
    case 'highlight':
    case 'highlighttext':
    case 'linktext':
    case 'mark':
    case 'marktext':
    case 'visitedtext':
    // the following are deprecated in CSS3
    case 'activeborder':
    case 'activecaption':
    case 'appworkspace':
    case 'background':
    case 'buttonface':
    case 'buttonhighlight':
    case 'buttonshadow':
    case 'buttontext':
    case 'captiontext':
    case 'graytext':
    case 'highlight':
    case 'highlighttext':
    case 'inactiveborder':
    case 'inactivecaption':
    case 'inactivecaptiontext':
    case 'infobackground':
    case 'infotext':
    case 'menu':
    case 'menutext':
    case 'scrollbar':
    case 'threeddarkshadow':
    case 'threedface':
    case 'threedhighlight':
    case 'threedlightshadow':
    case 'threedshadow':
    case 'window':
    case 'windowframe':
    case 'windowtext':
      return exports.TYPES.COLOR;
    default:
      if (keywordRegEx.test(val)) {
        return exports.TYPES.KEYWORD;
      }
      return exports.TYPES.UNIDENT;
  }
};

exports.parseNumber = function parseNumber(val) {
  var type = exports.valueType(val);
  switch (type) {
    case exports.TYPES.NULL_OR_EMPTY_STR:
    case exports.TYPES.VAR:
      return val;
    case exports.TYPES.NUMBER:
      return `${parseFloat(val)}`;
    case exports.TYPES.CALC:
      return cssCalc(val, {
        format: 'specifiedValue',
      });
    default:
      if (varContainedRegEx.test(val)) {
        return val;
      }
      return undefined;
  }
};

exports.parseLength = function parseLength(val) {
  var type = exports.valueType(val);
  switch (type) {
    case exports.TYPES.NULL_OR_EMPTY_STR:
    case exports.TYPES.VAR:
      return val;
    case exports.TYPES.CALC:
      return cssCalc(val, {
        format: 'specifiedValue',
      });
    case exports.TYPES.LENGTH: {
      var [, numVal, unit] = unitRegEx.exec(val);
      return `${parseFloat(numVal)}${unit}`;
    }
    default:
      if (varContainedRegEx.test(val)) {
        return val;
      }
      if (type === exports.TYPES.NUMBER && parseFloat(val) === 0) {
        return '0px';
      }
      return undefined;
  }
};

exports.parsePercent = function parsePercent(val) {
  var type = exports.valueType(val);
  switch (type) {
    case exports.TYPES.NULL_OR_EMPTY_STR:
    case exports.TYPES.VAR:
      return val;
    case exports.TYPES.CALC:
      return cssCalc(val, {
        format: 'specifiedValue',
      });
    case exports.TYPES.PERCENT: {
      var [, numVal, unit] = unitRegEx.exec(val);
      return `${parseFloat(numVal)}${unit}`;
    }
    default:
      if (varContainedRegEx.test(val)) {
        return val;
      }
      if (type === exports.TYPES.NUMBER && parseFloat(val) === 0) {
        return '0%';
      }
      return undefined;
  }
};

// either a length or a percent
exports.parseMeasurement = function parseMeasurement(val) {
  var type = exports.valueType(val);
  switch (type) {
    case exports.TYPES.NULL_OR_EMPTY_STR:
    case exports.TYPES.VAR:
      return val;
    case exports.TYPES.CALC:
      return cssCalc(val, {
        format: 'specifiedValue',
      });
    case exports.TYPES.LENGTH:
    case exports.TYPES.PERCENT: {
      var [, numVal, unit] = unitRegEx.exec(val);
      return `${parseFloat(numVal)}${unit}`;
    }
    default:
      if (varContainedRegEx.test(val)) {
        return val;
      }
      if (type === exports.TYPES.NUMBER && parseFloat(val) === 0) {
        return '0px';
      }
      return undefined;
  }
};

exports.parseInheritingMeasurement = function parseInheritingMeasurement(val) {
  if (/^(?:auto|inherit)$/i.test(val)) {
    return val.toLowerCase();
  }
  return exports.parseMeasurement(val);
};

exports.parseUrl = function parseUrl(val) {
  var type = exports.valueType(val);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    return '';
  }
  var res = urlRegEx.exec(val);
  // does it match the regex?
  if (!res) {
    return undefined;
  }
  var str = res[1];
  // if it starts with single or double quotes, does it end with the same?
  if ((str[0] === '"' || str[0] === "'") && str[0] !== str[str.length - 1]) {
    return undefined;
  }
  if (str[0] === '"' || str[0] === "'") {
    str = str.substr(1, str.length - 2);
  }

  var urlstr = '';
  var escaped = false;
  var i;
  for (i = 0; i < str.length; i++) {
    switch (str[i]) {
      case '\\':
        if (escaped) {
          urlstr += '\\\\';
          escaped = false;
        } else {
          escaped = true;
        }
        break;
      case '(':
      case ')':
      case ' ':
      case '\t':
      case '\n':
      case "'":
        if (!escaped) {
          return undefined;
        }
        urlstr += str[i];
        escaped = false;
        break;
      case '"':
        if (!escaped) {
          return undefined;
        }
        urlstr += '\\"';
        escaped = false;
        break;
      default:
        urlstr += str[i];
        escaped = false;
    }
  }

  return 'url("' + urlstr + '")';
};

// NOTE: seems not in use?
exports.parseString = function parseString(val) {
  var type = exports.valueType(val);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    return '';
  }
  if (type !== exports.TYPES.STRING) {
    return undefined;
  }
  var i;
  for (i = 1; i < val.length - 1; i++) {
    switch (val[i]) {
      case val[0]:
        return undefined;
      case '\\':
        i++;
        while (i < val.length - 1 && /[0-9A-Fa-f]/.test(val[i])) {
          i++;
        }
        break;
    }
  }
  if (i >= val.length) {
    return undefined;
  }
  return val;
};

exports.parseKeyword = function parseKeyword(val, validKeywords = []) {
  var type = exports.valueType(val);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    return '';
  }
  if (type === exports.TYPES.VAR) {
    return val;
  }
  if (type !== exports.TYPES.KEYWORD) {
    return undefined;
  }
  val = val.toString().toLowerCase();
  if (validKeywords.includes(val) || exports.GLOBAL_VALUES.includes(val)) {
    return val;
  }
  return undefined;
};

exports.parseColor = function parseColor(val) {
  var type = exports.valueType(val);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    return '';
  }
  if (type === exports.TYPES.UNDEFINED) {
    return undefined;
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
  var res = resolveColor(val, {
    format: 'specifiedValue',
  });
  if (res) {
    return res;
  }
  return undefined;
};

// FIXME:
// This function seems to be incorrect.
// However, this has no impact so far, as this function is only used by the deprecated `azimuth` property.
exports.parseAngle = function parseAngle(val) {
  var type = exports.valueType(val);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    return '';
  }
  if (type !== exports.TYPES.ANGLE) {
    return undefined;
  }
  var res = angleRegEx.exec(val);
  var flt = parseFloat(res[1]);
  if (res[2] === 'rad') {
    flt *= 180 / Math.PI;
  } else if (res[2] === 'grad') {
    flt *= 360 / 400;
  }

  while (flt < 0) {
    flt += 360;
  }
  while (flt > 360) {
    flt -= 360;
  }
  return flt + 'deg';
};

exports.parseImage = function parseImage(val) {
  var type = exports.valueType(val);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    return '';
  }
  if (type === exports.TYPES.UNDEFINED) {
    return undefined;
  }
  if (type === exports.TYPES.VAR) {
    return val;
  }
  if (type === exports.TYPES.KEYWORD) {
    return exports.parseKeyword(val, ['none']);
  }
  var values = splitValue(val, {
    delimiter: ',',
    preserveComment: varContainedRegEx.test(val),
  });
  var isImage = !!values.length;
  var i;
  for (i = 0; i < values.length; i++) {
    var image = values[i];
    if (exports.valueType(image) === exports.TYPES.NULL_OR_EMPTY_STR) {
      return image;
    }
    if (isGradient(image) || /^(?:none|inherit)$/i.test(image)) {
      continue;
    }
    var imageUrl = exports.parseUrl(image);
    if (imageUrl) {
      values[i] = imageUrl;
    } else {
      isImage = false;
      break;
    }
  }
  if (isImage) {
    return values.join(', ');
  }
  return undefined;
};

// utility to translate from border-width to borderWidth
exports.dashedToCamelCase = function (dashed) {
  if (dashed.startsWith('--')) {
    return dashed;
  }
  // skip leading hyphen in vendor prefixed value, e.g. -webkit-foo
  var i = /^\-webkit/.test(dashed) ? 1 : 0;
  var camel = '';
  var nextCap = false;
  for (; i < dashed.length; i++) {
    if (dashed[i] !== '-') {
      camel += nextCap ? dashed[i].toUpperCase() : dashed[i];
      nextCap = false;
    } else {
      nextCap = true;
    }
  }
  return camel;
};

exports.camelToDashed = function (camelCase) {
  var dashed = camelCase.replace(/(?<=[a-z])[A-Z]/g, '-$&').toLowerCase();
  var match = dashed.match(/^webkit\-/);
  if (match) {
    dashed = '-' + dashed;
  }
  return dashed;
};

// this either returns undefined meaning that it isn't valid
// or returns an object where the keys are dashed short
// hand properties and the values are the values to set
// on them
// FIXME: need additional argument which indicates syntax
// and/or use Map() for shorthandFor to ensure order of the longhand properties
exports.shorthandParser = function parse(v, shorthandFor) {
  var obj = {};
  var type = exports.valueType(v);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    Object.keys(shorthandFor).forEach(function (property) {
      obj[property] = '';
    });
    return obj;
  }
  if (type === exports.TYPES.UNDEFINED) {
    return undefined;
  }
  if (typeof v === 'number') {
    v = v.toString();
  }
  if (typeof v !== 'string') {
    return undefined;
  }
  if (v.toLowerCase() === 'inherit') {
    return {};
  }
  var parts = splitValue(v);
  var valid = true;
  parts.forEach(function (part, i) {
    var partValid = false;
    Object.keys(shorthandFor).forEach(function (property) {
      if (shorthandFor[property].isValid(part, i)) {
        partValid = true;
        obj[property] = part;
      }
    });
    if (valid) {
      valid = partValid;
    }
  });
  if (!valid) {
    return undefined;
  }
  return obj;
};

// FIXME: check against shorthandParser and reduce Object.keys().forEach() loops
exports.shorthandSetter = function (property, shorthandFor) {
  return function (v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = '';
    }
    var obj = exports.shorthandParser(v, shorthandFor);
    if (obj === undefined) {
      return;
    }
    Object.keys(obj).forEach(function (subprop) {
      // in case subprop is an implicit property, this will clear
      // *its* subpropertiesX
      var camel = exports.dashedToCamelCase(subprop);
      this[camel] = obj[subprop];
      // in case it gets translated into something else (0 -> 0px)
      obj[subprop] = this[camel];
      this.removeProperty(subprop);
      // don't add in empty properties
      if (obj[subprop] !== '') {
        this._values[subprop] = obj[subprop];
      }
    }, this);
    Object.keys(shorthandFor).forEach(function (subprop) {
      if (!obj.hasOwnProperty(subprop)) {
        this.removeProperty(subprop);
        delete this._values[subprop];
      }
    }, this);
    // in case the value is something like 'none' that removes all values,
    // check that the generated one is not empty, first remove the property
    // if it already exists, then call the shorthandGetter, if it's an empty
    // string, don't set the property
    this.removeProperty(property);
    var calculated = exports.shorthandGetter(property, shorthandFor).call(this);
    if (calculated !== '') {
      this._setProperty(property, calculated);
    }
  };
};

exports.shorthandGetter = function (property, shorthandFor) {
  return function () {
    if (this._values[property] !== undefined) {
      return this.getPropertyValue(property);
    }
    return Object.keys(shorthandFor)
      .map(function (subprop) {
        return this.getPropertyValue(subprop);
      }, this)
      .filter(function (value) {
        return value !== '';
      })
      .join(' ');
  };
};

// isValid(){1,4} | inherit
// if one, it applies to all
// if two, the first applies to the top and bottom, and the second to left and right
// if three, the first applies to the top, the second to left and right, the third bottom
// if four, top, right, bottom, left
exports.implicitSetter = function (propertyBefore, propertyAfter, isValid, parser) {
  propertyAfter = propertyAfter || '';
  if (propertyAfter !== '') {
    propertyAfter = '-' + propertyAfter;
  }
  var partNames = ['top', 'right', 'bottom', 'left'];

  return function (v) {
    if (typeof v === 'number') {
      v = v.toString();
    }
    if (typeof v !== 'string') {
      return undefined;
    }
    var parts;
    if (v.toLowerCase() === 'inherit' || v === '') {
      parts = [v];
    } else {
      parts = splitValue(v);
    }
    if (parts.length < 1 || parts.length > 4) {
      return undefined;
    }

    if (!parts.every(isValid)) {
      return undefined;
    }

    parts = parts.map(function (part) {
      return parser(part);
    });
    this._setProperty(propertyBefore + propertyAfter, parts.join(' '));
    if (parts.length === 1) {
      parts[1] = parts[0];
    }
    if (parts.length === 2) {
      parts[2] = parts[0];
    }
    if (parts.length === 3) {
      parts[3] = parts[1];
    }

    for (var i = 0; i < 4; i++) {
      var property = propertyBefore + '-' + partNames[i] + propertyAfter;
      this.removeProperty(property);
      if (parts[i] !== '') {
        this._values[property] = parts[i];
      }
    }
    return v;
  };
};

//  Companion to implicitSetter, but for the individual parts.
//  This sets the individual value, and checks to see if all four
//  sub-parts are set.  If so, it sets the shorthand version and removes
//  the individual parts from the cssText.
exports.subImplicitSetter = function (prefix, part, isValid, parser) {
  var property = prefix + '-' + part;
  var subparts = [prefix + '-top', prefix + '-right', prefix + '-bottom', prefix + '-left'];

  return function (v) {
    if (typeof v === 'number') {
      v = v.toString();
    }
    if (v === null) {
      v = '';
    }
    if (typeof v !== 'string') {
      return undefined;
    }
    if (!isValid(v)) {
      return undefined;
    }
    v = parser(v);
    this._setProperty(property, v);

    var combinedPriority = this.getPropertyPriority(prefix);
    var parts = subparts.map((subpart) => this._values[subpart]);
    var priorities = subparts.map((subpart) => this.getPropertyPriority(subpart));
    // Combine into a single property if all values are set and have the same priority
    if (
      parts.every((p) => p !== '' && p != null) &&
      priorities.every((p) => p === priorities[0]) &&
      priorities[0] === combinedPriority
    ) {
      for (var i = 0; i < subparts.length; i++) {
        this.removeProperty(subparts[i]);
        this._values[subparts[i]] = parts[i];
      }
      this._setProperty(prefix, parts.join(' '), priorities[0]);
    } else {
      this.removeProperty(prefix);
      for (var j = 0; j < subparts.length; j++) {
        // The property we're setting won't be important, the rest will either keep their priority or inherit it from the combined property
        var priority = subparts[j] === property ? '' : priorities[j] || combinedPriority;
        this._setProperty(subparts[j], parts[j], priority);
      }
    }
    return v;
  };
};
