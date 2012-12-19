'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('font-size', v);
    },
    get: function () {
        return this.getPropertyValue('font-size');
    },
    enumerable: true
};
