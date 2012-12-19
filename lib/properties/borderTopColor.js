'use strict';

var parseColor = require('../parsers').parseColor;

module.exports.definition = {
    set: function (v) {
        this.setProperty('border-top-color', parseColor(v));
    },
    get: function () {
        return this.getPropertyValue('border-top-color');
    },
    enumerable: true
};
