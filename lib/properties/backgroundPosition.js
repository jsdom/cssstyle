'use strict';

const { parsePosition } = require('../parsers.js');

module.exports.definition = {
  set: function(v) {
    this._setProperty('background-position', parsePosition(v));
  },
  get: function() {
    return this.getPropertyValue('background-position');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parsePosition;
