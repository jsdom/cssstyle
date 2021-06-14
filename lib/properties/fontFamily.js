'use strict';

var TYPES = require('../parsers').TYPES;
var valueType = require('../parsers').valueType;

var partsRegEx = /\s*,\s*/;
function parse(v) {
  var parts = v.split(partsRegEx);
  var len = parts.length;
  var i;
  var type;
  const families = [];
  for (i = 0; i < len; i++) {
    type = valueType(parts[i]);
    if (!(type === TYPES.STRING || type === TYPES.KEYWORD)) {
      return undefined;
    }
    families.push(parts[i]);
  }
  return families.join(', ');
}

module.exports.definition = {
  set(v) {
    this._setProperty('font-family', parse(v));
  },
  get() {
    return this.getPropertyValue('font-family');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
