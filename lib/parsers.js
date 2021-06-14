/*********************************************************************
 * These are commonly used parsers for CSS Values they take a string *
 * to parse and return a string after it's been converted, if needed *
 ********************************************************************/
'use strict';

const namedColors = require('./named_colors.json');
const { hslToRgb } = require('./utils/colorSpace');

// the following are deprecated in CSS3
namedColors.push(
  'activeborder',
  'activecaption',
  'appworkspace',
  'background',
  'buttonface',
  'buttonhighlight',
  'buttonshadow',
  'buttontext',
  'captiontext',
  'graytext',
  'highlight',
  'highlighttext',
  'inactiveborder',
  'inactivecaption',
  'inactivecaptiontext',
  'infobackground',
  'infotext',
  'menu',
  'menutext',
  'scrollbar',
  'threeddarkshadow',
  'threedface',
  'threedhighlight',
  'threedlightshadow',
  'threedshadow',
  'window',
  'windowframe',
  'windowtext'
);

const newline = '\\n\\r\\f';
const whitespace = `[ \\t${newline}]`;
const ws = `${whitespace}*`;
const hexDigit = '[\\da-f]';
const escape = `\\\\([^\\n\\da-f]|${hexDigit}{1,6}${ws})`;
const ident = `(-?([_a-z]|${escape})([-_\\w]|${escape})*|--([-_\\w]|${escape})*)`;

// rough regular expressions
const identRegEx = new RegExp(`^${ident}$`, 'i');
var integerRegEx = /^[-+]?[0-9]+$/;
var numberRegEx = /^[-+]?[0-9]*\.?[0-9]+$/;
var lengthRegEx = /^(0|[-+]?[0-9]*\.?[0-9]+(in|cm|em|mm|pt|pc|px|ex|rem|vh|vw|ch))$/;
var percentRegEx = /^[-+]?[0-9]*\.?[0-9]+%$/;
var urlRegEx = /^url\(\s*([^)]*)\s*\)$/;
var stringRegEx = /^("[^"]*"|'[^']*')$/;
var colorRegEx1 = /^#([0-9a-fA-F]{3,4}){1,2}$/;
var colorRegEx2 = /^rgb\(([^)]*)\)$/;
var colorRegEx3 = /^rgba\(([^)]*)\)$/;
var calcRegEx = /^calc\(([^)]*)\)$/;
var colorRegEx4 = /^hsla?\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*(,\s*(-?\d+|-?\d*.\d+)\s*)?\)/;
var angleRegEx = /^([-+]?[0-9]*\.?[0-9]+)(deg|grad|rad)$/;

exports.parseInteger = function parseInteger(val) {
  if (integerRegEx.test(val)) {
    return String(parseInt(val, 10));
  }
  return null;
};

exports.parseNumber = function parseNumber(val) {
  if (numberRegEx.test(val) || integerRegEx.test(val)) {
    return String(parseFloat(val));
  }
  return null;
};

exports.parseLength = function parseLength(val) {
  if (val === '0') {
    return '0px';
  }
  if (lengthRegEx.test(val)) {
    return val;
  }
  return null;
};

exports.parsePercent = function parsePercent(val) {
  if (val === '0') {
    return '0%';
  }
  if (percentRegEx.test(val)) {
    return val;
  }
  return null;
};

// either a length or a percent
exports.parseMeasurement = function parseMeasurement(val) {
  if (calcRegEx.test(val)) {
    return val;
  }

  var length = exports.parseLength(val);
  if (length !== null) {
    return length;
  }
  return exports.parsePercent(val);
};

exports.parseKeyword = function parseKeyword(
  val,
  valid = ['initial', 'inherit', 'revert', 'unset']
) {
  const lowerCaseValue = val.toLowerCase();
  if (valid.includes(lowerCaseValue)) {
    return lowerCaseValue;
  }
  return null;
};

exports.parseCustomIdentifier = function parseCustomIdentifier(val) {
  if (identRegEx.test(val) && !exports.parseKeyword(val) && val !== 'default') {
    return val;
  }
  return null;
};

exports.parseUrl = function parseUrl(val) {
  var res = urlRegEx.exec(val);
  // does it match the regex?
  if (!res) {
    return null;
  }
  var str = res[1];
  // if it starts with single or double quotes, does it end with the same?
  if ((str[0] === '"' || str[0] === "'") && str[0] !== str[str.length - 1]) {
    return null;
  }
  if (str[0] === '"' || str[0] === "'") {
    str = str.substr(1, str.length - 2);
  }

  var i;
  for (i = 0; i < str.length; i++) {
    switch (str[i]) {
      case '(':
      case ')':
      case ' ':
      case '\t':
      case '\n':
      case "'":
      case '"':
        return null;
      case '\\':
        i++;
        break;
    }
  }

  return 'url(' + str + ')';
};

exports.parseString = function parseString(val) {
  if (stringRegEx.test(val)) {
    var i;
    for (i = 1; i < val.length - 1; i++) {
      switch (val[i]) {
        case val[0]:
          return null;
        case '\\':
          i++;
          while (i < val.length - 1 && /[0-9A-Fa-f]/.test(val[i])) {
            i++;
          }
          break;
      }
    }
    if (i >= val.length) {
      return null;
    }
    return val;
  }
  return null;
};

exports.parseColor = function parseColor(val) {
  var red,
    green,
    blue,
    hue,
    saturation,
    lightness,
    alpha = 1;
  var parts;
  var res = colorRegEx1.exec(val);
  // is it #aaa, #ababab, #aaaa, #abababaa
  if (res) {
    var defaultHex = val.substr(1);
    var hex = val.substr(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];

      if (defaultHex.length === 4) {
        hex = hex + defaultHex[3] + defaultHex[3];
      }
    }
    red = parseInt(hex.substr(0, 2), 16);
    green = parseInt(hex.substr(2, 2), 16);
    blue = parseInt(hex.substr(4, 2), 16);
    if (hex.length === 8) {
      var hexAlpha = hex.substr(6, 2);
      var hexAlphaToRgbaAlpha = Number((parseInt(hexAlpha, 16) / 255).toFixed(3));

      return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + hexAlphaToRgbaAlpha + ')';
    }
    return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
  }

  res = colorRegEx2.exec(val);
  if (res) {
    parts = res[1].split(/\s*,\s*/);
    if (parts.length !== 3) {
      return null;
    }
    if (parts.every(percentRegEx.test.bind(percentRegEx))) {
      red = Math.floor((parseFloat(parts[0].slice(0, -1)) * 255) / 100);
      green = Math.floor((parseFloat(parts[1].slice(0, -1)) * 255) / 100);
      blue = Math.floor((parseFloat(parts[2].slice(0, -1)) * 255) / 100);
    } else if (parts.every(integerRegEx.test.bind(integerRegEx))) {
      red = parseInt(parts[0], 10);
      green = parseInt(parts[1], 10);
      blue = parseInt(parts[2], 10);
    } else {
      return null;
    }
    red = Math.min(255, Math.max(0, red));
    green = Math.min(255, Math.max(0, green));
    blue = Math.min(255, Math.max(0, blue));
    return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
  }

  res = colorRegEx3.exec(val);
  if (res) {
    parts = res[1].split(/\s*,\s*/);
    if (parts.length !== 4) {
      return null;
    }
    if (parts.slice(0, 3).every(percentRegEx.test.bind(percentRegEx))) {
      red = Math.floor((parseFloat(parts[0].slice(0, -1)) * 255) / 100);
      green = Math.floor((parseFloat(parts[1].slice(0, -1)) * 255) / 100);
      blue = Math.floor((parseFloat(parts[2].slice(0, -1)) * 255) / 100);
      alpha = parseFloat(parts[3]);
    } else if (parts.slice(0, 3).every(integerRegEx.test.bind(integerRegEx))) {
      red = parseInt(parts[0], 10);
      green = parseInt(parts[1], 10);
      blue = parseInt(parts[2], 10);
      alpha = parseFloat(parts[3]);
    } else {
      return null;
    }
    if (isNaN(alpha)) {
      alpha = 1;
    }
    red = Math.min(255, Math.max(0, red));
    green = Math.min(255, Math.max(0, green));
    blue = Math.min(255, Math.max(0, blue));
    alpha = Math.min(1, Math.max(0, alpha));
    if (alpha === 1) {
      return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    }
    return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
  }

  res = colorRegEx4.exec(val);
  if (res) {
    const [, _hue, _saturation, _lightness, _alphaString = ''] = res;
    const _alpha = parseFloat(_alphaString.replace(',', '').trim());
    if (!_hue || !_saturation || !_lightness) {
      return null;
    }
    hue = parseFloat(_hue);
    saturation = parseInt(_saturation, 10);
    lightness = parseInt(_lightness, 10);
    if (_alpha && numberRegEx.test(_alpha)) {
      alpha = parseFloat(_alpha);
    }

    const [r, g, b] = hslToRgb(hue, saturation / 100, lightness / 100);
    if (!_alphaString || alpha === 1) {
      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
  }

  return exports.parseKeyword(val, namedColors);
};

exports.parseAngle = function parseAngle(val) {
  if (angleRegEx.test(val)) {
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
  }
  return null;
};

/**
 * utility to translate from border-width to borderWidth
 *
 * @param {string} property
 * @param {boolean} [lowercaseFirst]
 * @see https://drafts.csswg.org/cssom/#css-property-to-idl-attribute
 */
function cssPropertyToIDLAttribute(property, lowercaseFirst = false) {
  let output = '';
  let uppercaseNext = false;

  if (lowercaseFirst) {
    property = property.substring(1);
  }

  for (const c of property) {
    if (c === '-') {
      uppercaseNext = true;
    } else if (uppercaseNext) {
      uppercaseNext = false;
      output += c.toUpperCase();
    } else {
      output += c;
    }
  }

  return output;
}
exports.cssPropertyToIDLAttribute = cssPropertyToIDLAttribute;

var is_space = /\s/;
var opening_deliminators = ['"', "'", '('];
var closing_deliminators = ['"', "'", ')'];
// this splits on whitespace, but keeps quoted and parened parts together
var getParts = function(str) {
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

/**
 * @param {string} value
 * @param {object} longhands
 * @returns {object | null}
 *
 * this either returns null meaning that it isn't valid
 * or returns an object where the keys are dashed short
 * hand properties and the values are the values to set
 * on them
 */
exports.parseShorthand = function parseShorthand(value, longhands) {
  const parsed = {};
  const components = getParts(value);
  const entries = Object.entries(longhands);
  const valid = components.every((component, position) =>
    entries.some(longhand => {
      const [property, { parse }] = longhand;
      if (!parsed[property]) {
        const value = parse(component, position);
        if (value !== null) {
          parsed[property] = value;
          return true;
        }
      }
      return false;
    })
  );
  if (valid) {
    return entries.reduce(
      (longhands, [property]) => ({ ...longhands, [property]: parsed[property] || 'initial' }),
      {}
    );
  }
  return null;
};

/**
 * @param {string} value
 * @param {object} longhands
 * @returns {object | null}
 */
exports.parseImplicitShorthand = function parseImplicitShorthand(value, longhands) {
  const components = getParts(value);
  const entries = Object.entries(longhands);
  const { length: longhandLength } = entries;
  let { length: currentLength } = components;
  const valid =
    currentLength / longhandLength <= 1 &&
    components.every((component, i) => {
      const [, { parse }] = entries[i];
      const value = parse(component);
      if (value === null) {
        return false;
      }
      components[i] = value;
      return true;
    });
  if (valid) {
    while (currentLength < longhandLength) {
      components.push(components[Math.max(0, currentLength++ - 2)]);
    }
    return entries.reduce(
      (longhands, [property], i) => ({ ...longhands, [property]: components[i] }),
      {}
    );
  }
  return null;
};

/**
 * @param {object} longhands
 * @param {function?} parse
 * @return {boolean}
 *
 * It should set longhands with values parsed from shorthand component values.
 *
 * The parse function should return an object with longhands as props assigned
 * their parsed component value. A null object means that the specified value is
 * invalid.
 */
exports.createShorthandSetter = function createShorthandSetter(
  longhands,
  parse = exports.parseShorthand
) {
  return function setShorthand(value) {
    const parsed = parse(value, longhands);
    if (parsed === null) {
      return false;
    }
    Object.entries(parsed).forEach(([property, value]) => (this[property] = value));
    return true;
  };
};

/**
 * @param {array} components
 * @param {string} glue
 * @returns {string}
 */
exports.serializeShorthand = function serializeShorthand(components, glue = ' ') {
  const [same, ...values] = components;
  // All component values are the same CSS wide keyword
  if (values.every(value => value === same)) {
    return same;
  }
  // Filter out initial
  components = components.filter(value => value !== 'initial');
  // Some (but not all) component values are CSS wide keywords
  if (components.some(value => exports.parseKeyword(value))) {
    return '';
  }
  // Filter out empty string
  return components.filter(Boolean).join(glue);
};

/**
 * @param {array} components longhand values
 * @returns {string}
 */
exports.serializeImplicitShorthand = function serializeImplicitShorthand(components) {
  const [same, ...values] = components;
  // All component values are equals
  if (values.every(value => value === same)) {
    return same;
  }
  // Some (but not all) component values are empty string or CSS wide keywords
  if (components.some(value => value === '' || exports.parseKeyword(value))) {
    return '';
  }
  // Reduce shorthand value to its minimal expression
  if (components.length === 4 && components[3] === components[1]) {
    components.pop();
  }
  if (components.length === 3 && components[2] === components[0]) {
    components.pop();
  }
  return components.join(' ');
};

/**
 * @param {object} longhands
 * @param {function} serialize
 * @returns {string}
 */
exports.createShorthandGetter = function createShorthandGetter(
  longhands,
  serialize = exports.serializeShorthand
) {
  return function getShorthand() {
    return serialize(Object.keys(longhands).map(property => this[property]));
  };
};

const camel_to_dashed = /[A-Z]/g;

/**
 * @param {string} attribute
 * @param {boolean} [dashPrefix]
 * @see https://drafts.csswg.org/cssom/#idl-attribute-to-css-property
 */
exports.idlAttributeToCSSProperty = (attribute, dashPrefix = false) => {
  let output = dashPrefix ? '-' : '';
  output += attribute.replace(camel_to_dashed, '-$&').toLowerCase();
  return output;
};
