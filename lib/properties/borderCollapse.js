'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('border-collapse', v);
    },
    get: function () {
        return this.getPropertyValue('border-collapse');
    },
    enumerable: true
};
