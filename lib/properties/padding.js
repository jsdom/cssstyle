'use strict';

var parsers = require('../parsers.js');
var TYPES = parsers.TYPES;

var isValid = function(v) {
  var type = parsers.valueType(v);
  return (
    type === TYPES.LENGTH ||
    type === TYPES.PERCENT ||
    (type === TYPES.INTEGER && (v === '0' || v === 0))
  );
};

var parser = function(v) {
  return parsers.parseMeasurement(v);
};

var mySetter = parsers.implicitSetter('padding', '', isValid, parser);
var myGlobal = parsers.implicitSetter(
  'padding',
  '',
  function() {
    return true;
  },
  function(v) {
    return v;
  }
);

module.exports.definition = {
  set: function(v) {
    var V = v.toLowerCase();
    switch (V) {
      case 'inherit':
      case 'initial':
      case 'unset':
      case '':
        myGlobal.call(this, V);
        break;

      default:
        mySetter.call(this, v);
        break;
    }
  },
  get: function() {
    return this.getPropertyValue('padding');
  },
  enumerable: true,
  configurable: true,
};

module.exports.isValid = isValid;
module.exports.parser = parser;
module.exports.longhands = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
