'use strict';

var parseColor = require('../parsers').parseColor;

module.exports.definition = {
    set: function (v) {
        this.setProperty('border-color', parseColor(v));
    },
    get: function () {
        return this.getPropertyValue('border-color');
    },
    enumerable: true
};
