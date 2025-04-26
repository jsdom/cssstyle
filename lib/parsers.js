/*********************************************************************
 * These are commonly used parsers for CSS Values they take a string *
 * to parse and return a string after it's been converted, if needed *
 ********************************************************************/
'use strict';

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

// regular expressions
var DIGIT = '(?:0|[1-9]\\d*)';
var NUMBER = `[+-]?(?:${DIGIT}(?:\\.\\d*)?|\\.\\d+)(?:e-?${DIGIT})?`;
var unitRegEx = new RegExp(`^(${NUMBER})([a-z]+|%)?$`);
var angleRegEx = new RegExp(`^${NUMBER}(?:deg|g?rad|turn)$`);
var urlRegEx = /^url\(\s*((?:[^)]|\\\))*)\s*\)$/;
var keywordRegEx = /^[a-z]+(?:\-[a-z]+)*$/i;
var stringRegEx = /^("[^"]*"|'[^']*')$/;
var varRegEx = /^var\(|(?<=[*/\s(])var\(/;
var calcRegEx =
  /^(?:a?(?:cos|sin|tan)|abs|atan2|calc|clamp|exp|hypot|log|max|min|mod|pow|rem|round|sign|sqrt)\(/;

// This will return one of the above types based on the passed in string
exports.valueType = function valueType(val) {
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
    const [, , unit] = unitRegEx.exec(val);
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
    default:
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
      const [, numVal, unit] = unitRegEx.exec(val);
      return `${parseFloat(numVal)}${unit}`;
    }
    default:
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
    case exports.TYPES.PERCENT:
      const [, numVal, unit] = unitRegEx.exec(val);
      return `${parseFloat(numVal)}${unit}`;
    default:
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
    case exports.TYPES.PERCENT:
      const [, numVal, unit] = unitRegEx.exec(val);
      return `${parseFloat(numVal)}${unit}`;
    default:
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
    return val;
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

exports.parseString = function parseString(val) {
  var type = exports.valueType(val);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    return val;
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

exports.parseColor = function parseColor(val) {
  var type = exports.valueType(val);
  if (type & (exports.TYPES.NULL_OR_EMPTY_STR | exports.TYPES.VAR)) {
    return val;
  }
  if (type === exports.TYPES.UNDEFINED) {
    return undefined;
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
    return val;
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

exports.parseKeyword = function parseKeyword(val, validKeywords) {
  var type = exports.valueType(val);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    return val;
  }
  if (type !== exports.TYPES.KEYWORD) {
    return undefined;
  }
  val = val.toString().toLowerCase();
  var i;
  for (i = 0; i < validKeywords.length; i++) {
    if (validKeywords[i].toLowerCase() === val) {
      return validKeywords[i];
    }
  }
  return undefined;
};

exports.parseImage = function parseImage(val) {
  if (/^(?:none|inherit)$/i.test(val)) {
    return val.toLowerCase();
  }
  var type = exports.valueType(val);
  if (type & (exports.TYPES.NULL_OR_EMPTY_STR | exports.TYPES.VAR)) {
    return val;
  }
  if (type === exports.TYPES.UNDEFINED) {
    return undefined;
  }
  var values = splitValue(val, ',');
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
var dashedToCamelCase = function (dashed) {
  var i;
  var camel = '';
  var nextCap = false;
  for (i = 0; i < dashed.length; i++) {
    if (dashed[i] !== '-') {
      camel += nextCap ? dashed[i].toUpperCase() : dashed[i];
      nextCap = false;
    } else {
      nextCap = true;
    }
  }
  return camel;
};
exports.dashedToCamelCase = dashedToCamelCase;

var is_space = /\s/;
var opening_deliminators = ['"', "'", '('];
var closing_deliminators = ['"', "'", ')'];
// this splits on whitespace, but keeps quoted and parened parts together
var getParts = function (str) {
  var deliminator_stack = [];
  var length = str.length;
  var i;
  var parts = [];
  var current_part = '';
  var opening_index;
  var closing_index;
  for (i = 0; i < length; i++) {
    opening_index = opening_deliminators.indexOf(str[i]);
    closing_index = closing_deliminators.indexOf(str[i]);
    if (is_space.test(str[i])) {
      if (deliminator_stack.length === 0) {
        if (current_part !== '') {
          parts.push(current_part);
        }
        current_part = '';
      } else {
        current_part += str[i];
      }
    } else {
      if (str[i] === '\\') {
        i++;
        current_part += str[i];
      } else {
        current_part += str[i];
        if (
          closing_index !== -1 &&
          closing_index === deliminator_stack[deliminator_stack.length - 1]
        ) {
          deliminator_stack.pop();
        } else if (opening_index !== -1) {
          deliminator_stack.push(opening_index);
        }
      }
    }
  }
  if (current_part !== '') {
    parts.push(current_part);
  }
  return parts;
};

/*
 * this either returns undefined meaning that it isn't valid
 * or returns an object where the keys are dashed short
 * hand properties and the values are the values to set
 * on them
 */
exports.shorthandParser = function parse(v, shorthand_for) {
  var obj = {};
  var type = exports.valueType(v);
  if (type === exports.TYPES.NULL_OR_EMPTY_STR) {
    Object.keys(shorthand_for).forEach(function (property) {
      obj[property] = '';
    });
    return obj;
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
  var parts = getParts(v);
  var valid = true;
  parts.forEach(function (part, i) {
    var part_valid = false;
    Object.keys(shorthand_for).forEach(function (property) {
      if (shorthand_for[property].isValid(part, i)) {
        part_valid = true;
        obj[property] = part;
      }
    });
    valid = valid && part_valid;
  });
  if (!valid) {
    return undefined;
  }
  return obj;
};

exports.shorthandSetter = function (property, shorthand_for) {
  return function (v) {
    var obj = exports.shorthandParser(v, shorthand_for);
    if (obj === undefined) {
      return;
    }
    //console.log('shorthandSetter for:', property, 'obj:', obj);
    Object.keys(obj).forEach(function (subprop) {
      // in case subprop is an implicit property, this will clear
      // *its* subpropertiesX
      var camel = dashedToCamelCase(subprop);
      this[camel] = obj[subprop];
      // in case it gets translated into something else (0 -> 0px)
      obj[subprop] = this[camel];
      this.removeProperty(subprop);
      // don't add in empty properties
      if (obj[subprop] !== '') {
        this._values[subprop] = obj[subprop];
      }
    }, this);
    Object.keys(shorthand_for).forEach(function (subprop) {
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
    var calculated = exports.shorthandGetter(property, shorthand_for).call(this);
    if (calculated !== '') {
      this._setProperty(property, calculated);
    }
  };
};

exports.shorthandGetter = function (property, shorthand_for) {
  return function () {
    if (this._values[property] !== undefined) {
      return this.getPropertyValue(property);
    }
    return Object.keys(shorthand_for)
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
exports.implicitSetter = function (property_before, property_after, isValid, parser) {
  property_after = property_after || '';
  if (property_after !== '') {
    property_after = '-' + property_after;
  }
  var part_names = ['top', 'right', 'bottom', 'left'];

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
      parts = getParts(v);
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
    this._setProperty(property_before + property_after, parts.join(' '));
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
      var property = property_before + '-' + part_names[i] + property_after;
      this.removeProperty(property);
      if (parts[i] !== '') {
        this._values[property] = parts[i];
      }
    }
    return v;
  };
};

//
//  Companion to implicitSetter, but for the individual parts.
//  This sets the individual value, and checks to see if all four
//  sub-parts are set.  If so, it sets the shorthand version and removes
//  the individual parts from the cssText.
//
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

var camel_to_dashed = /[A-Z]/g;
var first_segment = /^\([^-]\)-/;
var vendor_prefixes = ['o', 'moz', 'ms', 'webkit'];
exports.camelToDashed = function (camel_case) {
  var match;
  var dashed = camel_case.replace(camel_to_dashed, '-$&').toLowerCase();
  match = dashed.match(first_segment);
  if (match && vendor_prefixes.indexOf(match[1]) !== -1) {
    dashed = '-' + dashed;
  }
  return dashed;
};
