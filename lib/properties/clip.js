'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('clip', v);
    },
    get: function () {
        return this.getPropertyValue('clip');
    },
    enumerable: true
};
