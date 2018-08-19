/*jshint node: true*/
'use strict';

module.exports.definition = {
    set: function (v) {
        this._setProperty('ruby-position', v);
    },
    get: function () {
        return this.getPropertyValue('ruby-position');
    },
    enumerable: true,
    configurable: true
};
