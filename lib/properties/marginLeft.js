var margin = require('./margin.js');
var parsers = require('../parsers.ts');

module.exports.definition = {
  set: parsers.subImplicitSetter('margin', 'left', margin.isValid, margin.parser),
  get: function () {
    return this.getPropertyValue('margin-left');
  },
  enumerable: true,
  configurable: true,
};
