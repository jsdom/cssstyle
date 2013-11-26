'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('right', v);
    },
    get: function () {
        return this.getPropertyValue('right');
    },
    enumerable: true,
    configurable: true
};
