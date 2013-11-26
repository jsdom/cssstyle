'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('font-style', v);
    },
    get: function () {
        return this.getPropertyValue('font-style');
    },
    enumerable: true,
    configurable: true
};
