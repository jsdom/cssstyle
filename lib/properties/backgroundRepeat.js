'use strict';

const { parseKeyword } = require('../parsers.js');

function parse(v) {
  return parseKeyword(v, ['no-repeat', 'repeat', 'repeat-x', 'repeat-y', 'round', 'space']);
}

module.exports.definition = {
  set: function(v) {
    this._setProperty('background-repeat', parse(v));
  },
  get: function() {
    return this.getPropertyValue('background-repeat');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
