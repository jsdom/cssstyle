'use strict';

var parsers = require('../parsers');

var shorthand_for = {
    backgroundColor: 'background-color',
    backgroundImage: 'background-image',
    backgroundRepeat: 'background-repeat',
    backgroundAttachment: 'background-attachment',
    backgroundPosition: 'background-position'
};

/*
 * this either returns undefined meaning that it isn't valid
 * or returns an object where the keys are dashed short
 * hand properties and the values are the values to set
 * on them
 */
var parse = function parse(v) {
    if (v.toLowerCase() === 'inherit') {
        return {};
    }
    var parts = v.split(/\s+/);
    var valid = true;
    var obj = {};
    parts.forEach(function (part) {
        var part_valid = false;
        Object.keys(shorthand_for).forEach(function (property) {
            if (require('./' + property).isValid(part)) {
                part_valid = true;
                obj[shorthand_for[property]] = part;
            }
        });
        valid = valid && part_valid;
    });
    if (!valid) {
        return undefined;
    }
    return obj;
};

module.exports.isValid = function isValid(v) {
    return parse(v) !== undefined;
};

module.exports.definition = {
    set: function (v) {
        var parsed = parse(v);
        if (parsed === undefined) {
            return;
        }
        this.setProperty('background', v);
        // these don't get set
        Object.keys(parsed).forEach(function (property) {
            this._values[property] = parsed[property];
        }, this);
    },
    get: function () {
        return this.getPropertyValue('background');
    },
    enumerable: true
};
