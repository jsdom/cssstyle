'use strict';

module.exports.definition = {
    set: function (v) {
        this._setProperty('flex', v);
    },
    get: function () {
        return this.getPropertyValue('flex');
    },
    enumerable: true,
    configurable: true
};