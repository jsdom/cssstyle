'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('clear', v);
    },
    get: function () {
        return this.getPropertyValue('clear');
    },
    enumerable: true,
    configurable: true
};
