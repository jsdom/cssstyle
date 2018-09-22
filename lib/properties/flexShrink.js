'use strict';

var parseNumber = require('../parsers').parseNumber;

module.exports.isValid = function isValid(v) {
    return parseNumber(v) !== undefined;
};

module.exports.definition = {
    set: function (v) {
        this._setProperty('flex-shrink', parseNumber(v));
    },
    get: function () {
        return this.getPropertyValue('flex-shrink');
    },
    enumerable: true,
    configurable: true
};
