'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('bottom', v);
    },
    get: function () {
        return this.getPropertyValue('bottom');
    },
    enumerable: true,
    configurable: true
};
