/*********************************************************************
 * This is a fork from the CSS Style Declaration part of
 * https://github.com/NV/CSSOM
 ********************************************************************/
"use strict";
var CSSOM = require('cssom');
var fs = require('fs');
var path = require('path');

/**
 * @constructor
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration
 */
var CSSStyleDeclaration = function CSSStyleDeclaration() {
    var values = {};
    var importants = {};
    var length = 0;

    /**
     *
     * @param {string} name
     * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-getPropertyValue
     * @return {string} the value of the property if it has been explicitly set for this declaration block.
     * Returns the empty string if the property has not been set.
     */
    var getPropertyValue = function (name) {
        return values[name] || "";
    };

    /**
     *
     * @param {string} name
     * @param {string} value
     * @param {string} [priority=null] "important" or null
     * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-setProperty
     */
    var setProperty = function (name, value, priority) {
        if (values[name]) {
            // Property already exist. Overwrite it.
            var index = Array.prototype.indexOf.call(this, name);
            if (index < 0) {
                this[length] = name;
                length++;
            }
        } else {
            // New property.
            this[length] = name;
            length++;
        }
        values[name] = value;
        importants[name] = priority;
    };

    /**
     *
     * @param {string} name
     * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-removeProperty
     * @return {string} the value of the property if it has been explicitly set for this declaration block.
     * Returns the empty string if the property has not been set or the property name does not correspond to a known CSS property.
     */
    var removeProperty = function (name) {
        if (!values.hasOwnProperty(name)) {
            return "";
        }
        var index = Array.prototype.indexOf.call(this, name);
        if (index < 0) {
            return "";
        }
        var prevValue = values[name];
        delete values[name];

        // That's what WebKit and Opera do
        Array.prototype.splice.call(this, index, 1);

        // That's what Firefox does
        //this[index] = ""

        return prevValue;
    };


    /**
     *
     * @param {String} name
     */
    var getPropertyPriority = function (name) {
        return importants[name] || "";
    };


    var getPropertyCSSValue = function () {
        //FIXME
    };

    /**
     *   element.style.overflow = "auto"
     *   element.style.getPropertyShorthand("overflow-x")
     *   -> "overflow"
     */
    var getPropertyShorthand = function () {
        //FIXME
    };

    var isPropertyImplicit = function () {
        //FIXME
    };

    /**
     *   http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-item
     */
    var item = function (index) {
        index = parseInt(index, 10);
        if (index < 0 || index >= length) {
            return '';
        }
        return this[index];
    };

    var getCssText = function () {
        var properties = [];
        var i;
        for (i = 0; i < length; i++) {
            var name = this[i];
            var value = getPropertyValue(name);
            var priority = getPropertyPriority(name);
            if (priority !== '') {
                priority = " !" + priority;
            }
            properties.push([name, ': ', value, priority, ';'].join(''));
        }
        return properties.join(' ');
    };

    /**
     * This deletes indices if the new length is less then the current
     * length. If the new length is more, it does nothing, the new indices
     * will be undefined until set.
     **/
    var setLength = function (new_length) {
        var i;
        for (i = new_length; i < length; i++) {
            delete this[i];
        }
        length = new_length;
    };

    Object.defineProperties(this, {
        parentRule: {
            get: function () { return null; },
            enumerable: true
        },
        length: {
            get: function () { return length; },
            set: function (v) { return setLength.apply(this, arguments); },
            enumerable: true
        },
        setProperty: {
            value: function (name, value, priority) { return setProperty.apply(this, arguments); },
            enumerable: true,
            writable: true
        },
        getPropertyValue: {
            value: function (name) { return getPropertyValue.apply(this, arguments); },
            enumerable: true,
            writable: true
        },
        removeProperty: {
            value: function (name) { return removeProperty.apply(this, arguments); },
            enumerable: true,
            writable: true
        },
        getPropertyPriority: {
            value: function (name) { return getPropertyPriority.apply(this, arguments); },
            enumerable: true,
            writable: true
        },
        getPropertyCSSValue: {
            value: function () { return getPropertyCSSValue.apply(this, arguments); },
            enumerable: true,
            writable: true
        },
        getPropertyShorthand: {
            value: function () { return getPropertyShorthand.apply(this, arguments); },
            enumerable: true,
            writable: true
        },
        isPropertyImplicit: {
            value: function () { return isPropertyImplicit.apply(this, arguments); },
            enumerable: true,
            writable: true
        },
        item: {
            value: function (index) { return item.apply(this, arguments); },
            enumerable: true,
            writable: true
        },
        cssText: {
            get: function () { return getCssText.apply(this, arguments); },
            set: function (cssText) {
                var i;
                values = {};
                Array.prototype.splice.call(this, 0, length);
                importants = {};
                var dummyRule = CSSOM.parse('#bogus{' + cssText + '}').cssRules[0].style;
                var rule_length = dummyRule.length;
                var name;
                for (i = 0; i < rule_length; ++i) {
                    name = dummyRule[i];
                    this.setProperty(dummyRule[i], dummyRule.getPropertyValue(name), dummyRule.getPropertyPriority(name));
                }
            },
            enumerable: true
        }
    });

    var property_files = fs.readdirSync(__dirname + '/properties');
    var self = this;
    property_files.forEach(function (property) {
        if (property.substr(-3) === '.js') {
            property = path.basename(property, '.js');
            Object.defineProperty(self, property, require('./properties/' + property));
        }
    });
};

exports.CSSStyleDeclaration = CSSStyleDeclaration;
