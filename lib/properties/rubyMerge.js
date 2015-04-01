/*jshint node: true*/
'use strict';

module.exports.definition = {
    set: function (v) {
        this._setProperty('ruby-merge', v);
    },
    get: function () {
        return this.getPropertyValue('ruby-merge');
    },
    enumerable: true,
    configurable: true
};
