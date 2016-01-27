'use strict';

var padding = require('./margin.js');
var parsers = require('../parsers.js');

module.exports.definition = {
    set: parsers.subImplicitSetter('margin', 'left', padding.isValid, padding.parser),
    get: function () {
        return this.getPropertyValue('margin-left');
    },
    enumerable: true,
    configurable: true
};
