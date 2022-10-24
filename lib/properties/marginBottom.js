var margin = require('./margin.js');
var parsers = require('../parsers.ts');

module.exports.definition = {
  set: parsers.subImplicitSetter('margin', 'bottom', margin.isValid, margin.parser),
  get: function () {
    return this.getPropertyValue('margin-bottom');
  },
  enumerable: true,
  configurable: true,
};
