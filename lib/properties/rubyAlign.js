/*jshint node: true*/
'use strict';

module.exports.definition = {
    set: function (v) {
        this._setProperty('ruby-align', v);
    },
    get: function () {
        return this.getPropertyValue('ruby-align');
    },
    enumerable: true,
    configurable: true
};
