'use strict';

const { parseImage, parseKeyword } = require('../parsers.js');

function parse(v) {
  return parseImage(v) || parseKeyword(v, ['none']);
}

module.exports.definition = {
  set: function(v) {
    this._setProperty('background-image', parse(v));
  },
  get: function() {
    return this.getPropertyValue('background-image');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
