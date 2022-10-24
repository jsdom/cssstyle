var margin = require('./margin.js');
var parsers = require('../parsers.ts');

module.exports.definition = {
  set: parsers.subImplicitSetter('margin', 'top', margin.isValid, margin.parser),
  get: function () {
    return this.getPropertyValue('margin-top');
  },
  enumerable: true,
  configurable: true,
};
