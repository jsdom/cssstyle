'use strict';

var padding = require('./margin.js');
var parsers = require('../parsers.js');

module.exports.definition = {
    set: parsers.subImplicitSetter('margin', 'right', padding.isValid, padding.parser),
    get: function () {
        return this.getPropertyValue('margin-right');
    },
    enumerable: true,
    configurable: true
};
