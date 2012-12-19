'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('clip-path', v);
    },
    get: function () {
        return this.getPropertyValue('clip-path');
    },
    enumerable: true
};
