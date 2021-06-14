'use strict';

const { implicitSetter, parseKeyword, parseLength } = require('../parsers.js');

function parse(v) {
  return parseLength(v) || parseKeyword(v, ['medium', 'thick', 'thin']);
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
