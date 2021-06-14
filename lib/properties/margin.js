'use strict';

const { implicitSetter, parseKeyword, parseMeasurement } = require('../parsers.js');

function parse(v) {
  return parseKeyword(v, ['auto']) || parseMeasurement(v);
}

module.exports.definition = {
  set: implicitSetter('margin', '', parse),
  get() {
    return this.getPropertyValue('margin');
  },
  enumerable: true,
  configurable: true,
};
module.exports.longhands = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'];
module.exports.parse = parse;
