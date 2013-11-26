'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('top', v);
    },
    get: function () {
        return this.getPropertyValue('top');
    },
    enumerable: true,
    configurable: true
};
