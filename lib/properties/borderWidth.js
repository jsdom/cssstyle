'use strict';

var parsers = require('../parsers');
var implicitSetter = require('../parsers').implicitSetter;

// the valid border-widths:
var widths = ['thin', 'medium', 'thick'];

function parse(v) {
  var length = parsers.parseLength(v);
  if (length !== undefined) {
    return length;
  }
  v = v.toLowerCase();
  if (widths.indexOf(v) === -1) {
    return undefined;
  }
  return v;
}

module.exports.definition = {
  set: implicitSetter('border', 'width', parse),
  get() {
    return this.getPropertyValue('border-width');
  },
  enumerable: true,
  configurable: true,
};
module.exports.longhands = [
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
];
module.exports.parse = parse;
