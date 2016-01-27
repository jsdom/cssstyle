'use strict';

var padding = require('./margin.js');
var parsers = require('../parsers.js');

module.exports.definition = {
    set: parsers.subImplicitSetter('margin', 'bottom', padding.isValid, padding.parser),
    get: function () {
        return this.getPropertyValue('margin-bottom');
    },
    enumerable: true,
    configurable: true
};
