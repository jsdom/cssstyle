'use strict';

var parseWidthOrHeight = require('../parsers').parseWidthOrHeight;

module.exports.definition = {
    set: function (v) {
        this._setProperty('width', parseWidthOrHeight(v));
    },
    get: function () {
        return this.getPropertyValue('width');
    },
    enumerable: true,
    configurable: true
};
