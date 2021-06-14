'use strict';

const parsers = require('../parsers.js');

function parse(v) {
  var V = v.toLowerCase();
  if (V === 'auto') {
    return V;
  }
  return parsers.parseMeasurement(v);
}

const mySetter = parsers.implicitSetter('margin', '', parse);
const myGlobal = parsers.implicitSetter('margin', '', function(v) {
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
    return this.getPropertyValue('margin');
  },
  enumerable: true,
  configurable: true,
};
module.exports.longhands = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'];
module.exports.parse = parse;
