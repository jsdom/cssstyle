'use strict';

const { implicitSetter, parseMeasurement } = require('../parsers.js');

const mySetter = implicitSetter('padding', '', parseMeasurement);
const myGlobal = implicitSetter('padding', '', function(v) {
  return v;
});

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
module.exports.longhands = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
module.exports.parse = parseMeasurement;
