/*********************************************************************
 * This is a fork from the CSS Style Declaration part of
 * https://github.com/NV/CSSOM
 ********************************************************************/
"use strict";
var CSSOM = require('cssom');

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
            properties.push(name, ': ', value, priority, '; ');
        }
        return properties.join('');
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
        },

        // All the properties in WebKit browsers
        azimuth: {
            set: function (v) {
                this.setProperty('azimuth', v);
            },
            get: function () {
                return this.getPropertyValue('azimuth');
            },
            enumerable: true
        },
        alignmentBaseline: {
            set: function (v) {
                this.setProperty('alignment-baseline', v);
            },
            get: function () {
                return this.getPropertyValue('alignment-baseline');
            },
            enumerable: true
        },
        background: {
            set: function (v) {
                this.setProperty('background', v);
            },
            get: function () {
                return this.getPropertyValue('background');
            },
            enumerable: true
        },
        backgroundAttachment: {
            set: function (v) {
                this.setProperty('background-attachment', v);
            },
            get: function () {
                return this.getPropertyValue('background-attachment');
            },
            enumerable: true
        },
        backgroundClip: {
            set: function (v) {
                this.setProperty('background-clip', v);
            },
            get: function () {
                return this.getPropertyValue('background-clip');
            },
            enumerable: true
        },
        backgroundColor: {
            set: function (v) {
                this.setProperty('background-color', v);
            },
            get: function () {
                return this.getPropertyValue('background-color');
            },
            enumerable: true
        },
        backgroundImage: {
            set: function (v) {
                this.setProperty('background-image', v);
            },
            get: function () {
                return this.getPropertyValue('background-image');
            },
            enumerable: true
        },
        backgroundOrigin: {
            set: function (v) {
                this.setProperty('background-origin', v);
            },
            get: function () {
                return this.getPropertyValue('background-origin');
            },
            enumerable: true
        },
        backgroundPosition: {
            set: function (v) {
                this.setProperty('background-position', v);
            },
            get: function () {
                return this.getPropertyValue('background-position');
            },
            enumerable: true
        },
        backgroundPositionX: {
            set: function (v) {
                this.setProperty('background-position-x', v);
            },
            get: function () {
                return this.getPropertyValue('background-position-x');
            },
            enumerable: true
        },
        backgroundPositionY: {
            set: function (v) {
                this.setProperty('background-position-y', v);
            },
            get: function () {
                return this.getPropertyValue('background-position-y');
            },
            enumerable: true
        },
        backgroundRepeat: {
            set: function (v) {
                this.setProperty('background-repeat', v);
            },
            get: function () {
                return this.getPropertyValue('background-repeat');
            },
            enumerable: true
        },
        backgroundRepeatX: {
            set: function (v) {
                this.setProperty('background-repeat-x', v);
            },
            get: function () {
                return this.getPropertyValue('background-repeat-x');
            },
            enumerable: true
        },
        backgroundRepeatY: {
            set: function (v) {
                this.setProperty('background-repeat-y', v);
            },
            get: function () {
                return this.getPropertyValue('background-repeat-y');
            },
            enumerable: true
        },
        backgroundSize: {
            set: function (v) {
                this.setProperty('background-size', v);
            },
            get: function () {
                return this.getPropertyValue('background-size');
            },
            enumerable: true
        },
        baselineShift: {
            set: function (v) {
                this.setProperty('baseline-shift', v);
            },
            get: function () {
                return this.getPropertyValue('baseline-shift');
            },
            enumerable: true
        },
        border: {
            set: function (v) {
                this.setProperty('border', v);
            },
            get: function () {
                return this.getPropertyValue('border');
            },
            enumerable: true
        },
        borderBottom: {
            set: function (v) {
                this.setProperty('border-bottom', v);
            },
            get: function () {
                return this.getPropertyValue('border-bottom');
            },
            enumerable: true
        },
        borderBottomColor: {
            set: function (v) {
                this.setProperty('border-bottom-color', v);
            },
            get: function () {
                return this.getPropertyValue('border-bottom-color');
            },
            enumerable: true
        },
        borderBottomLeftRadius: {
            set: function (v) {
                this.setProperty('border-bottom-left-radius', v);
            },
            get: function () {
                return this.getPropertyValue('border-bottom-left-radius');
            },
            enumerable: true
        },
        borderBottomRightRadius: {
            set: function (v) {
                this.setProperty('border-bottom-right-radius', v);
            },
            get: function () {
                return this.getPropertyValue('border-bottom-right-radius');
            },
            enumerable: true
        },
        borderBottomStyle: {
            set: function (v) {
                this.setProperty('border-bottom-style', v);
            },
            get: function () {
                return this.getPropertyValue('border-bottom-style');
            },
            enumerable: true
        },
        borderBottomWidth: {
            set: function (v) {
                this.setProperty('border-bottom-width', v);
            },
            get: function () {
                return this.getPropertyValue('border-bottom-width');
            },
            enumerable: true
        },
        borderCollapse: {
            set: function (v) {
                this.setProperty('border-collapse', v);
            },
            get: function () {
                return this.getPropertyValue('border-collapse');
            },
            enumerable: true
        },
        borderColor: {
            set: function (v) {
                this.setProperty('border-color', v);
            },
            get: function () {
                return this.getPropertyValue('border-color');
            },
            enumerable: true
        },
        borderImage: {
            set: function (v) {
                this.setProperty('border-image', v);
            },
            get: function () {
                return this.getPropertyValue('border-image');
            },
            enumerable: true
        },
        borderImageOutset: {
            set: function (v) {
                this.setProperty('border-image-outset', v);
            },
            get: function () {
                return this.getPropertyValue('border-image-outset');
            },
            enumerable: true
        },
        borderImageRepeat: {
            set: function (v) {
                this.setProperty('border-image-repeat', v);
            },
            get: function () {
                return this.getPropertyValue('border-image-repeat');
            },
            enumerable: true
        },
        borderImageSlice: {
            set: function (v) {
                this.setProperty('border-image-slice', v);
            },
            get: function () {
                return this.getPropertyValue('border-image-slice');
            },
            enumerable: true
        },
        borderImageSource: {
            set: function (v) {
                this.setProperty('border-image-source', v);
            },
            get: function () {
                return this.getPropertyValue('border-image-source');
            },
            enumerable: true
        },
        borderImageWidth: {
            set: function (v) {
                this.setProperty('border-image-width', v);
            },
            get: function () {
                return this.getPropertyValue('border-image-width');
            },
            enumerable: true
        },
        borderLeft: {
            set: function (v) {
                this.setProperty('border-left', v);
            },
            get: function () {
                return this.getPropertyValue('border-left');
            },
            enumerable: true
        },
        borderLeftColor: {
            set: function (v) {
                this.setProperty('border-left-color', v);
            },
            get: function () {
                return this.getPropertyValue('border-left-color');
            },
            enumerable: true
        },
        borderLeftStyle: {
            set: function (v) {
                this.setProperty('border-left-style', v);
            },
            get: function () {
                return this.getPropertyValue('border-left-style');
            },
            enumerable: true
        },
        borderLeftWidth: {
            set: function (v) {
                this.setProperty('border-left-width', v);
            },
            get: function () {
                return this.getPropertyValue('border-left-width');
            },
            enumerable: true
        },
        borderRadius: {
            set: function (v) {
                this.setProperty('border-radius', v);
            },
            get: function () {
                return this.getPropertyValue('border-radius');
            },
            enumerable: true
        },
        borderRight: {
            set: function (v) {
                this.setProperty('border-right', v);
            },
            get: function () {
                return this.getPropertyValue('border-right');
            },
            enumerable: true
        },
        borderRightColor: {
            set: function (v) {
                this.setProperty('border-right-color', v);
            },
            get: function () {
                return this.getPropertyValue('border-right-color');
            },
            enumerable: true
        },
        borderRightStyle: {
            set: function (v) {
                this.setProperty('border-right-style', v);
            },
            get: function () {
                return this.getPropertyValue('border-right-style');
            },
            enumerable: true
        },
        borderRightWidth: {
            set: function (v) {
                this.setProperty('border-right-width', v);
            },
            get: function () {
                return this.getPropertyValue('border-right-width');
            },
            enumerable: true
        },
        borderSpacing: {
            set: function (v) {
                this.setProperty('border-spacing', v);
            },
            get: function () {
                return this.getPropertyValue('border-spacing');
            },
            enumerable: true
        },
        borderStyle: {
            set: function (v) {
                this.setProperty('border-style', v);
            },
            get: function () {
                return this.getPropertyValue('border-style');
            },
            enumerable: true
        },
        borderTop: {
            set: function (v) {
                this.setProperty('border-top', v);
            },
            get: function () {
                return this.getPropertyValue('border-top');
            },
            enumerable: true
        },
        borderTopColor: {
            set: function (v) {
                this.setProperty('border-top-color', v);
            },
            get: function () {
                return this.getPropertyValue('border-top-color');
            },
            enumerable: true
        },
        borderTopLeftRadius: {
            set: function (v) {
                this.setProperty('border-top-left-radius', v);
            },
            get: function () {
                return this.getPropertyValue('border-top-left-radius');
            },
            enumerable: true
        },
        borderTopRightRadius: {
            set: function (v) {
                this.setProperty('border-top-right-radius', v);
            },
            get: function () {
                return this.getPropertyValue('border-top-right-radius');
            },
            enumerable: true
        },
        borderTopStyle: {
            set: function (v) {
                this.setProperty('border-top-style', v);
            },
            get: function () {
                return this.getPropertyValue('border-top-style');
            },
            enumerable: true
        },
        borderTopWidth: {
            set: function (v) {
                this.setProperty('border-top-width', v);
            },
            get: function () {
                return this.getPropertyValue('border-top-width');
            },
            enumerable: true
        },
        borderWidth: {
            set: function (v) {
                this.setProperty('border-width', v);
            },
            get: function () {
                return this.getPropertyValue('border-width');
            },
            enumerable: true
        },
        bottom: {
            set: function (v) {
                this.setProperty('bottom', v);
            },
            get: function () {
                return this.getPropertyValue('bottom');
            },
            enumerable: true
        },
        boxShadow: {
            set: function (v) {
                this.setProperty('box-shadow', v);
            },
            get: function () {
                return this.getPropertyValue('box-shadow');
            },
            enumerable: true
        },
        boxSizing: {
            set: function (v) {
                this.setProperty('box-sizing', v);
            },
            get: function () {
                return this.getPropertyValue('box-sizing');
            },
            enumerable: true
        },
        captionSide: {
            set: function (v) {
                this.setProperty('caption-side', v);
            },
            get: function () {
                return this.getPropertyValue('caption-side');
            },
            enumerable: true
        },
        clear: {
            set: function (v) {
                this.setProperty('clear', v);
            },
            get: function () {
                return this.getPropertyValue('clear');
            },
            enumerable: true
        },
        clip: {
            set: function (v) {
                this.setProperty('clip', v);
            },
            get: function () {
                return this.getPropertyValue('clip');
            },
            enumerable: true
        },
        clipPath: {
            set: function (v) {
                this.setProperty('clip-path', v);
            },
            get: function () {
                return this.getPropertyValue('clip-path');
            },
            enumerable: true
        },
        clipRule: {
            set: function (v) {
                this.setProperty('clip-rule', v);
            },
            get: function () {
                return this.getPropertyValue('clip-rule');
            },
            enumerable: true
        },
        color: {
            set: function (v) {
                this.setProperty('color', v);
            },
            get: function () {
                return this.getPropertyValue('color');
            },
            enumerable: true
        },
        colorInterpolation: {
            set: function (v) {
                this.setProperty('color-interpolation', v);
            },
            get: function () {
                return this.getPropertyValue('color-interpolation');
            },
            enumerable: true
        },
        colorInterpolationFilters: {
            set: function (v) {
                this.setProperty('color-interpolation-filters', v);
            },
            get: function () {
                return this.getPropertyValue('color-interpolation-filters');
            },
            enumerable: true
        },
        colorProfile: {
            set: function (v) {
                this.setProperty('color-profile', v);
            },
            get: function () {
                return this.getPropertyValue('color-profile');
            },
            enumerable: true
        },
        colorRendering: {
            set: function (v) {
                this.setProperty('color-rendering', v);
            },
            get: function () {
                return this.getPropertyValue('color-rendering');
            },
            enumerable: true
        },
        content: {
            set: function (v) {
                this.setProperty('content', v);
            },
            get: function () {
                return this.getPropertyValue('content');
            },
            enumerable: true
        },
        counterIncrement: {
            set: function (v) {
                this.setProperty('counter-increment', v);
            },
            get: function () {
                return this.getPropertyValue('counter-increment');
            },
            enumerable: true
        },
        counterReset: {
            set: function (v) {
                this.setProperty('counter-reset', v);
            },
            get: function () {
                return this.getPropertyValue('counter-reset');
            },
            enumerable: true
        },
        cue: {
            set: function (v) {
                this.setProperty('cue', v);
            },
            get: function () {
                return this.getPropertyValue('cue');
            },
            enumerable: true
        },
        cueAfter: {
            set: function (v) {
                this.setProperty('cue-after', v);
            },
            get: function () {
                return this.getPropertyValue('cue-after');
            },
            enumerable: true
        },
        cueBefore: {
            set: function (v) {
                this.setProperty('cue-before', v);
            },
            get: function () {
                return this.getPropertyValue('cue-before');
            },
            enumerable: true
        },
        cursor: {
            set: function (v) {
                this.setProperty('cursor', v);
            },
            get: function () {
                return this.getPropertyValue('cursor');
            },
            enumerable: true
        },
        direction: {
            set: function (v) {
                this.setProperty('direction', v);
            },
            get: function () {
                return this.getPropertyValue('direction');
            },
            enumerable: true
        },
        display: {
            set: function (v) {
                this.setProperty('display', v);
            },
            get: function () {
                return this.getPropertyValue('display');
            },
            enumerable: true
        },
        dominantBaseline: {
            set: function (v) {
                this.setProperty('dominant-baseline', v);
            },
            get: function () {
                return this.getPropertyValue('dominant-baseline');
            },
            enumerable: true
        },
        elevation: {
            set: function (v) {
                this.setProperty('elevation', v);
            },
            get: function () {
                return this.getPropertyValue('elevation');
            },
            enumerable: true
        },
        emptyCells: {
            set: function (v) {
                this.setProperty('empty-cells', v);
            },
            get: function () {
                return this.getPropertyValue('empty-cells');
            },
            enumerable: true
        },
        enableBackground: {
            set: function (v) {
                this.setProperty('enable-background', v);
            },
            get: function () {
                return this.getPropertyValue('enable-background');
            },
            enumerable: true
        },
        fill: {
            set: function (v) {
                this.setProperty('fill', v);
            },
            get: function () {
                return this.getPropertyValue('fill');
            },
            enumerable: true
        },
        fillOpacity: {
            set: function (v) {
                this.setProperty('fill-opacity', v);
            },
            get: function () {
                return this.getPropertyValue('fill-opacity');
            },
            enumerable: true
        },
        fillRule: {
            set: function (v) {
                this.setProperty('fill-rule', v);
            },
            get: function () {
                return this.getPropertyValue('fill-rule');
            },
            enumerable: true
        },
        filter: {
            set: function (v) {
                this.setProperty('filter', v);
            },
            get: function () {
                return this.getPropertyValue('filter');
            },
            enumerable: true
        },
        cssFloat: {
            set: function (v) {
                this.setProperty('float', v);
            },
            get: function () {
                return this.getPropertyValue('float');
            },
            enumerable: true
        },
        floodColor: {
            set: function (v) {
                this.setProperty('flood-color', v);
            },
            get: function () {
                return this.getPropertyValue('flood-color');
            },
            enumerable: true
        },
        floodOpacity: {
            set: function (v) {
                this.setProperty('flood-opacity', v);
            },
            get: function () {
                return this.getPropertyValue('flood-opacity');
            },
            enumerable: true
        },
        font: {
            set: function (v) {
                this.setProperty('font', v);
            },
            get: function () {
                return this.getPropertyValue('font');
            },
            enumerable: true
        },
        fontFamily: {
            set: function (v) {
                this.setProperty('font-family', v);
            },
            get: function () {
                return this.getPropertyValue('font-family');
            },
            enumerable: true
        },
        fontSize: {
            set: function (v) {
                this.setProperty('font-size', v);
            },
            get: function () {
                return this.getPropertyValue('font-size');
            },
            enumerable: true
        },
        fontSizeAdjust: {
            set: function (v) {
                this.setProperty('font-size-adjust', v);
            },
            get: function () {
                return this.getPropertyValue('font-size-adjust');
            },
            enumerable: true
        },
        fontStretch: {
            set: function (v) {
                this.setProperty('font-stretch', v);
            },
            get: function () {
                return this.getPropertyValue('font-stretch');
            },
            enumerable: true
        },
        fontStyle: {
            set: function (v) {
                this.setProperty('font-style', v);
            },
            get: function () {
                return this.getPropertyValue('font-style');
            },
            enumerable: true
        },
        fontVariant: {
            set: function (v) {
                this.setProperty('font-variant', v);
            },
            get: function () {
                return this.getPropertyValue('font-variant');
            },
            enumerable: true
        },
        fontWeight: {
            set: function (v) {
                this.setProperty('font-weight', v);
            },
            get: function () {
                return this.getPropertyValue('font-weight');
            },
            enumerable: true
        },
        glyphOrientationHorizontal: {
            set: function (v) {
                this.setProperty('glyph-orientation-horizontal', v);
            },
            get: function () {
                return this.getPropertyValue('glyph-orientation-horizontal');
            },
            enumerable: true
        },
        glyphOrientationVertical: {
            set: function (v) {
                this.setProperty('glyph-orientation-vertical', v);
            },
            get: function () {
                return this.getPropertyValue('glyph-orientation-vertical');
            },
            enumerable: true
        },
        height: {
            set: function (v) {
                this.setProperty('height', v);
            },
            get: function () {
                return this.getPropertyValue('height');
            },
            enumerable: true
        },
        imageRendering: {
            set: function (v) {
                this.setProperty('image-rendering', v);
            },
            get: function () {
                return this.getPropertyValue('image-rendering');
            },
            enumerable: true
        },
        kerning: {
            set: function (v) {
                this.setProperty('kerning', v);
            },
            get: function () {
                return this.getPropertyValue('kerning');
            },
            enumerable: true
        },
        left: {
            set: function (v) {
                this.setProperty('left', v);
            },
            get: function () {
                return this.getPropertyValue('left');
            },
            enumerable: true
        },
        letterSpacing: {
            set: function (v) {
                this.setProperty('letter-spacing', v);
            },
            get: function () {
                return this.getPropertyValue('letter-spacing');
            },
            enumerable: true
        },
        lightingColor: {
            set: function (v) {
                this.setProperty('lighting-color', v);
            },
            get: function () {
                return this.getPropertyValue('lighting-color');
            },
            enumerable: true
        },
        lineHeight: {
            set: function (v) {
                this.setProperty('line-height', v);
            },
            get: function () {
                return this.getPropertyValue('line-height');
            },
            enumerable: true
        },
        listStyle: {
            set: function (v) {
                this.setProperty('list-style', v);
            },
            get: function () {
                return this.getPropertyValue('list-style');
            },
            enumerable: true
        },
        listStyleImage: {
            set: function (v) {
                this.setProperty('list-style-image', v);
            },
            get: function () {
                return this.getPropertyValue('list-style-image');
            },
            enumerable: true
        },
        listStylePosition: {
            set: function (v) {
                this.setProperty('list-style-position', v);
            },
            get: function () {
                return this.getPropertyValue('list-style-position');
            },
            enumerable: true
        },
        listStyleType: {
            set: function (v) {
                this.setProperty('list-style-type', v);
            },
            get: function () {
                return this.getPropertyValue('list-style-type');
            },
            enumerable: true
        },
        margin: {
            set: function (v) {
                this.setProperty('margin', v);
            },
            get: function () {
                return this.getPropertyValue('margin');
            },
            enumerable: true
        },
        marginBottom: {
            set: function (v) {
                this.setProperty('margin-bottom', v);
            },
            get: function () {
                return this.getPropertyValue('margin-bottom');
            },
            enumerable: true
        },
        marginLeft: {
            set: function (v) {
                this.setProperty('margin-left', v);
            },
            get: function () {
                return this.getPropertyValue('margin-left');
            },
            enumerable: true
        },
        marginRight: {
            set: function (v) {
                this.setProperty('margin-right', v);
            },
            get: function () {
                return this.getPropertyValue('margin-right');
            },
            enumerable: true
        },
        marginTop: {
            set: function (v) {
                this.setProperty('margin-top', v);
            },
            get: function () {
                return this.getPropertyValue('margin-top');
            },
            enumerable: true
        },
        marker: {
            set: function (v) {
                this.setProperty('marker', v);
            },
            get: function () {
                return this.getPropertyValue('marker');
            },
            enumerable: true
        },
        markerEnd: {
            set: function (v) {
                this.setProperty('marker-end', v);
            },
            get: function () {
                return this.getPropertyValue('marker-end');
            },
            enumerable: true
        },
        markerMid: {
            set: function (v) {
                this.setProperty('marker-mid', v);
            },
            get: function () {
                return this.getPropertyValue('marker-mid');
            },
            enumerable: true
        },
        markerOffset: {
            set: function (v) {
                this.setProperty('marker-offset', v);
            },
            get: function () {
                return this.getPropertyValue('marker-offset');
            },
            enumerable: true
        },
        markerStart: {
            set: function (v) {
                this.setProperty('marker-start', v);
            },
            get: function () {
                return this.getPropertyValue('marker-start');
            },
            enumerable: true
        },
        marks: {
            set: function (v) {
                this.setProperty('marks', v);
            },
            get: function () {
                return this.getPropertyValue('marks');
            },
            enumerable: true
        },
        mask: {
            set: function (v) {
                this.setProperty('mask', v);
            },
            get: function () {
                return this.getPropertyValue('mask');
            },
            enumerable: true
        },
        maxHeight: {
            set: function (v) {
                this.setProperty('max-height', v);
            },
            get: function () {
                return this.getPropertyValue('max-height');
            },
            enumerable: true
        },
        maxWidth: {
            set: function (v) {
                this.setProperty('max-width', v);
            },
            get: function () {
                return this.getPropertyValue('max-width');
            },
            enumerable: true
        },
        minHeight: {
            set: function (v) {
                this.setProperty('min-height', v);
            },
            get: function () {
                return this.getPropertyValue('min-height');
            },
            enumerable: true
        },
        minWidth: {
            set: function (v) {
                this.setProperty('min-width', v);
            },
            get: function () {
                return this.getPropertyValue('min-width');
            },
            enumerable: true
        },
        opacity: {
            set: function (v) {
                this.setProperty('opacity', v);
            },
            get: function () {
                return this.getPropertyValue('opacity');
            },
            enumerable: true
        },
        orphans: {
            set: function (v) {
                this.setProperty('orphans', v);
            },
            get: function () {
                return this.getPropertyValue('orphans');
            },
            enumerable: true
        },
        outline: {
            set: function (v) {
                this.setProperty('outline', v);
            },
            get: function () {
                return this.getPropertyValue('outline');
            },
            enumerable: true
        },
        outlineColor: {
            set: function (v) {
                this.setProperty('outline-color', v);
            },
            get: function () {
                return this.getPropertyValue('outline-color');
            },
            enumerable: true
        },
        outlineOffset: {
            set: function (v) {
                this.setProperty('outline-offset', v);
            },
            get: function () {
                return this.getPropertyValue('outline-offset');
            },
            enumerable: true
        },
        outlineStyle: {
            set: function (v) {
                this.setProperty('outline-style', v);
            },
            get: function () {
                return this.getPropertyValue('outline-style');
            },
            enumerable: true
        },
        outlineWidth: {
            set: function (v) {
                this.setProperty('outline-width', v);
            },
            get: function () {
                return this.getPropertyValue('outline-width');
            },
            enumerable: true
        },
        overflow: {
            set: function (v) {
                this.setProperty('overflow', v);
            },
            get: function () {
                return this.getPropertyValue('overflow');
            },
            enumerable: true
        },
        overflowX: {
            set: function (v) {
                this.setProperty('overflow-x', v);
            },
            get: function () {
                return this.getPropertyValue('overflow-x');
            },
            enumerable: true
        },
        overflowY: {
            set: function (v) {
                this.setProperty('overflow-y', v);
            },
            get: function () {
                return this.getPropertyValue('overflow-y');
            },
            enumerable: true
        },
        padding: {
            set: function (v) {
                this.setProperty('padding', v);
            },
            get: function () {
                return this.getPropertyValue('padding');
            },
            enumerable: true
        },
        paddingBottom: {
            set: function (v) {
                this.setProperty('padding-bottom', v);
            },
            get: function () {
                return this.getPropertyValue('padding-bottom');
            },
            enumerable: true
        },
        paddingLeft: {
            set: function (v) {
                this.setProperty('padding-left', v);
            },
            get: function () {
                return this.getPropertyValue('padding-left');
            },
            enumerable: true
        },
        paddingRight: {
            set: function (v) {
                this.setProperty('padding-right', v);
            },
            get: function () {
                return this.getPropertyValue('padding-right');
            },
            enumerable: true
        },
        paddingTop: {
            set: function (v) {
                this.setProperty('padding-top', v);
            },
            get: function () {
                return this.getPropertyValue('padding-top');
            },
            enumerable: true
        },
        page: {
            set: function (v) {
                this.setProperty('page', v);
            },
            get: function () {
                return this.getPropertyValue('page');
            },
            enumerable: true
        },
        pageBreakAfter: {
            set: function (v) {
                this.setProperty('page-break-after', v);
            },
            get: function () {
                return this.getPropertyValue('page-break-after');
            },
            enumerable: true
        },
        pageBreakBefore: {
            set: function (v) {
                this.setProperty('page-break-before', v);
            },
            get: function () {
                return this.getPropertyValue('page-break-before');
            },
            enumerable: true
        },
        pageBreakInside: {
            set: function (v) {
                this.setProperty('page-break-inside', v);
            },
            get: function () {
                return this.getPropertyValue('page-break-inside');
            },
            enumerable: true
        },
        pause: {
            set: function (v) {
                this.setProperty('pause', v);
            },
            get: function () {
                return this.getPropertyValue('pause');
            },
            enumerable: true
        },
        pauseAfter: {
            set: function (v) {
                this.setProperty('pause-after', v);
            },
            get: function () {
                return this.getPropertyValue('pause-after');
            },
            enumerable: true
        },
        pauseBefore: {
            set: function (v) {
                this.setProperty('pause-before', v);
            },
            get: function () {
                return this.getPropertyValue('pause-before');
            },
            enumerable: true
        },
        pitch: {
            set: function (v) {
                this.setProperty('pitch', v);
            },
            get: function () {
                return this.getPropertyValue('pitch');
            },
            enumerable: true
        },
        pitchRange: {
            set: function (v) {
                this.setProperty('pitch-range', v);
            },
            get: function () {
                return this.getPropertyValue('pitch-range');
            },
            enumerable: true
        },
        playDuring: {
            set: function (v) {
                this.setProperty('play-during', v);
            },
            get: function () {
                return this.getPropertyValue('play-during');
            },
            enumerable: true
        },
        pointerEvents: {
            set: function (v) {
                this.setProperty('pointer-events', v);
            },
            get: function () {
                return this.getPropertyValue('pointer-events');
            },
            enumerable: true
        },
        position: {
            set: function (v) {
                this.setProperty('position', v);
            },
            get: function () {
                return this.getPropertyValue('position');
            },
            enumerable: true
        },
        quotes: {
            set: function (v) {
                this.setProperty('quotes', v);
            },
            get: function () {
                return this.getPropertyValue('quotes');
            },
            enumerable: true
        },
        richness: {
            set: function (v) {
                this.setProperty('richness', v);
            },
            get: function () {
                return this.getPropertyValue('richness');
            },
            enumerable: true
        },
        resize: {
            set: function (v) {
                this.setProperty('resize', v);
            },
            get: function () {
                return this.getPropertyValue('resize');
            },
            enumerable: true
        },
        right: {
            set: function (v) {
                this.setProperty('right', v);
            },
            get: function () {
                return this.getPropertyValue('right');
            },
            enumerable: true
        },
        shapeRendering: {
            set: function (v) {
                this.setProperty('shape-rendering', v);
            },
            get: function () {
                return this.getPropertyValue('shape-rendering');
            },
            enumerable: true
        },
        size: {
            set: function (v) {
                this.setProperty('size', v);
            },
            get: function () {
                return this.getPropertyValue('size');
            },
            enumerable: true
        },
        speak: {
            set: function (v) {
                this.setProperty('speak', v);
            },
            get: function () {
                return this.getPropertyValue('speak');
            },
            enumerable: true
        },
        speakHeader: {
            set: function (v) {
                this.setProperty('speak-header', v);
            },
            get: function () {
                return this.getPropertyValue('speak-header');
            },
            enumerable: true
        },
        speakNumeral: {
            set: function (v) {
                this.setProperty('speak-numeral', v);
            },
            get: function () {
                return this.getPropertyValue('speak-numeral');
            },
            enumerable: true
        },
        speakPunctuation: {
            set: function (v) {
                this.setProperty('speak-punctuation', v);
            },
            get: function () {
                return this.getPropertyValue('speak-punctuation');
            },
            enumerable: true
        },
        speechRate: {
            set: function (v) {
                this.setProperty('speech-rate', v);
            },
            get: function () {
                return this.getPropertyValue('speech-rate');
            },
            enumerable: true
        },
        src: {
            set: function (v) {
                this.setProperty('src', v);
            },
            get: function () {
                return this.getPropertyValue('src');
            },
            enumerable: true
        },
        stopColor: {
            set: function (v) {
                this.setProperty('stop-color', v);
            },
            get: function () {
                return this.getPropertyValue('stop-color');
            },
            enumerable: true
        },
        stopOpacity: {
            set: function (v) {
                this.setProperty('stop-opacity', v);
            },
            get: function () {
                return this.getPropertyValue('stop-opacity');
            },
            enumerable: true
        },
        stress: {
            set: function (v) {
                this.setProperty('stress', v);
            },
            get: function () {
                return this.getPropertyValue('stress');
            },
            enumerable: true
        },
        stroke: {
            set: function (v) {
                this.setProperty('stroke', v);
            },
            get: function () {
                return this.getPropertyValue('stroke');
            },
            enumerable: true
        },
        strokeDasharray: {
            set: function (v) {
                this.setProperty('stroke-dasharray', v);
            },
            get: function () {
                return this.getPropertyValue('stroke-dasharray');
            },
            enumerable: true
        },
        strokeDashoffset: {
            set: function (v) {
                this.setProperty('stroke-dashoffset', v);
            },
            get: function () {
                return this.getPropertyValue('stroke-dashoffset');
            },
            enumerable: true
        },
        strokeLinecap: {
            set: function (v) {
                this.setProperty('stroke-linecap', v);
            },
            get: function () {
                return this.getPropertyValue('stroke-linecap');
            },
            enumerable: true
        },
        strokeLinejoin: {
            set: function (v) {
                this.setProperty('stroke-linejoin', v);
            },
            get: function () {
                return this.getPropertyValue('stroke-linejoin');
            },
            enumerable: true
        },
        strokeMiterlimit: {
            set: function (v) {
                this.setProperty('stroke-miterlimit', v);
            },
            get: function () {
                return this.getPropertyValue('stroke-miterlimit');
            },
            enumerable: true
        },
        strokeOpacity: {
            set: function (v) {
                this.setProperty('stroke-opacity', v);
            },
            get: function () {
                return this.getPropertyValue('stroke-opacity');
            },
            enumerable: true
        },
        strokeWidth: {
            set: function (v) {
                this.setProperty('stroke-width', v);
            },
            get: function () {
                return this.getPropertyValue('stroke-width');
            },
            enumerable: true
        },
        tableLayout: {
            set: function (v) {
                this.setProperty('table-layout', v);
            },
            get: function () {
                return this.getPropertyValue('table-layout');
            },
            enumerable: true
        },
        textAlign: {
            set: function (v) {
                this.setProperty('text-align', v);
            },
            get: function () {
                return this.getPropertyValue('text-align');
            },
            enumerable: true
        },
        textAnchor: {
            set: function (v) {
                this.setProperty('text-anchor', v);
            },
            get: function () {
                return this.getPropertyValue('text-anchor');
            },
            enumerable: true
        },
        textDecoration: {
            set: function (v) {
                this.setProperty('text-decoration', v);
            },
            get: function () {
                return this.getPropertyValue('text-decoration');
            },
            enumerable: true
        },
        textIndent: {
            set: function (v) {
                this.setProperty('text-indent', v);
            },
            get: function () {
                return this.getPropertyValue('text-indent');
            },
            enumerable: true
        },
        textLineThrough: {
            set: function (v) {
                this.setProperty('text-line-through', v);
            },
            get: function () {
                return this.getPropertyValue('text-line-through');
            },
            enumerable: true
        },
        textLineThroughColor: {
            set: function (v) {
                this.setProperty('text-line-through-color', v);
            },
            get: function () {
                return this.getPropertyValue('text-line-through-color');
            },
            enumerable: true
        },
        textLineThroughMode: {
            set: function (v) {
                this.setProperty('text-line-through-mode', v);
            },
            get: function () {
                return this.getPropertyValue('text-line-through-mode');
            },
            enumerable: true
        },
        textLineThroughStyle: {
            set: function (v) {
                this.setProperty('text-line-through-style', v);
            },
            get: function () {
                return this.getPropertyValue('text-line-through-style');
            },
            enumerable: true
        },
        textLineThroughWidth: {
            set: function (v) {
                this.setProperty('text-line-through-width', v);
            },
            get: function () {
                return this.getPropertyValue('text-line-through-width');
            },
            enumerable: true
        },
        textOverflow: {
            set: function (v) {
                this.setProperty('text-overflow', v);
            },
            get: function () {
                return this.getPropertyValue('text-overflow');
            },
            enumerable: true
        },
        textOverline: {
            set: function (v) {
                this.setProperty('text-overline', v);
            },
            get: function () {
                return this.getPropertyValue('text-overline');
            },
            enumerable: true
        },
        textOverlineColor: {
            set: function (v) {
                this.setProperty('text-overline-color', v);
            },
            get: function () {
                return this.getPropertyValue('text-overline-color');
            },
            enumerable: true
        },
        textOverlineMode: {
            set: function (v) {
                this.setProperty('text-overline-mode', v);
            },
            get: function () {
                return this.getPropertyValue('text-overline-mode');
            },
            enumerable: true
        },
        textOverlineStyle: {
            set: function (v) {
                this.setProperty('text-overline-style', v);
            },
            get: function () {
                return this.getPropertyValue('text-overline-style');
            },
            enumerable: true
        },
        textOverlineWidth: {
            set: function (v) {
                this.setProperty('text-overline-width', v);
            },
            get: function () {
                return this.getPropertyValue('text-overline-width');
            },
            enumerable: true
        },
        textRendering: {
            set: function (v) {
                this.setProperty('text-rendering', v);
            },
            get: function () {
                return this.getPropertyValue('text-rendering');
            },
            enumerable: true
        },
        textShadow: {
            set: function (v) {
                this.setProperty('text-shadow', v);
            },
            get: function () {
                return this.getPropertyValue('text-shadow');
            },
            enumerable: true
        },
        textTransform: {
            set: function (v) {
                this.setProperty('text-transform', v);
            },
            get: function () {
                return this.getPropertyValue('text-transform');
            },
            enumerable: true
        },
        textUnderline: {
            set: function (v) {
                this.setProperty('text-underline', v);
            },
            get: function () {
                return this.getPropertyValue('text-underline');
            },
            enumerable: true
        },
        textUnderlineColor: {
            set: function (v) {
                this.setProperty('text-underline-color', v);
            },
            get: function () {
                return this.getPropertyValue('text-underline-color');
            },
            enumerable: true
        },
        textUnderlineMode: {
            set: function (v) {
                this.setProperty('text-underline-mode', v);
            },
            get: function () {
                return this.getPropertyValue('text-underline-mode');
            },
            enumerable: true
        },
        textUnderlineStyle: {
            set: function (v) {
                this.setProperty('text-underline-style', v);
            },
            get: function () {
                return this.getPropertyValue('text-underline-style');
            },
            enumerable: true
        },
        textUnderlineWidth: {
            set: function (v) {
                this.setProperty('text-underline-width', v);
            },
            get: function () {
                return this.getPropertyValue('text-underline-width');
            },
            enumerable: true
        },
        top: {
            set: function (v) {
                this.setProperty('top', v);
            },
            get: function () {
                return this.getPropertyValue('top');
            },
            enumerable: true
        },
        unicodeBidi: {
            set: function (v) {
                this.setProperty('unicode-bidi', v);
            },
            get: function () {
                return this.getPropertyValue('unicode-bidi');
            },
            enumerable: true
        },
        unicodeRange: {
            set: function (v) {
                this.setProperty('unicode-range', v);
            },
            get: function () {
                return this.getPropertyValue('unicode-range');
            },
            enumerable: true
        },
        vectorEffect: {
            set: function (v) {
                this.setProperty('vector-effect', v);
            },
            get: function () {
                return this.getPropertyValue('vector-effect');
            },
            enumerable: true
        },
        verticalAlign: {
            set: function (v) {
                this.setProperty('vertical-align', v);
            },
            get: function () {
                return this.getPropertyValue('vertical-align');
            },
            enumerable: true
        },
        visibility: {
            set: function (v) {
                this.setProperty('visibility', v);
            },
            get: function () {
                return this.getPropertyValue('visibility');
            },
            enumerable: true
        },
        voiceFamily: {
            set: function (v) {
                this.setProperty('voic-family', v);
            },
            get: function () {
                return this.getPropertyValue('voice-family');
            },
            enumerable: true
        },
        volume: {
            set: function (v) {
                this.setProperty('volume', v);
            },
            get: function () {
                return this.getPropertyValue('volume');
            },
            enumerable: true
        },
        webkitAnimation: {
            set: function (v) {
                this.setProperty('-webkit-animation', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-animation');
            },
            enumerable: true
        },
        webkitAnimationDelay: {
            set: function (v) {
                this.setProperty('-webkit-animation-delay', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-animation-delay');
            },
            enumerable: true
        },
        webkitAnimationDirection: {
            set: function (v) {
                this.setProperty('-webkit-animation-direction', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-animation-direction');
            },
            enumerable: true
        },
        webkitAnimationDuration: {
            set: function (v) {
                this.setProperty('-webkit-animation-duration', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-animation-duration');
            },
            enumerable: true
        },
        webkitAnimationFillMode: {
            set: function (v) {
                this.setProperty('-webkit-animation-fill-mode', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-animation-fill-mode');
            },
            enumerable: true
        },
        webkitAnimationIterationCount: {
            set: function (v) {
                this.setProperty('-webkit-animation-iteration-count', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-animation-iteration-count');
            },
            enumerable: true
        },
        webkitAnimationName: {
            set: function (v) {
                this.setProperty('-webkit-animation-name', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-animation-name');
            },
            enumerable: true
        },
        webkitAnimationPlayState: {
            set: function (v) {
                this.setProperty('-webkit-animation-play-state', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-animation-play-state');
            },
            enumerable: true
        },
        webkitAnimationTimingFunction: {
            set: function (v) {
                this.setProperty('-webkit-animation-timing-function', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-animation-timing-function');
            },
            enumerable: true
        },
        webkitAppearance: {
            set: function (v) {
                this.setProperty('-webkit-appearance', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-appearance');
            },
            enumerable: true
        },
        webkitAspectRatio: {
            set: function (v) {
                this.setProperty('-webkit-aspect-ratio', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-aspect-ratio');
            },
            enumerable: true
        },
        webkitBackfaceVisibility: {
            set: function (v) {
                this.setProperty('-webkit-backface-visibility', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-backface-visibility');
            },
            enumerable: true
        },
        webkitBackgroundClip: {
            set: function (v) {
                this.setProperty('-webkit-background-clip', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-background-clip');
            },
            enumerable: true
        },
        webkitBackgroundComposite: {
            set: function (v) {
                this.setProperty('-webkit-background-composite', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-background-composite');
            },
            enumerable: true
        },
        webkitBackgroundOrigin: {
            set: function (v) {
                this.setProperty('-webkit-background-origin', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-background-origin');
            },
            enumerable: true
        },
        webkitBackgroundSize: {
            set: function (v) {
                this.setProperty('-webkit-background-size', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-background-size');
            },
            enumerable: true
        },
        webkitBorderAfter: {
            set: function (v) {
                this.setProperty('-webkit-border-after', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-after');
            },
            enumerable: true
        },
        webkitBorderAfterColor: {
            set: function (v) {
                this.setProperty('-webkit-border-after-color', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-after-color');
            },
            enumerable: true
        },
        webkitBorderAfterStyle: {
            set: function (v) {
                this.setProperty('-webkit-border-after-style', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-after-style');
            },
            enumerable: true
        },
        webkitBorderAfterWidth: {
            set: function (v) {
                this.setProperty('-webkit-border-after-width', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-after-width');
            },
            enumerable: true
        },
        webkitBorderBefore: {
            set: function (v) {
                this.setProperty('-webkit-border-before', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-before');
            },
            enumerable: true
        },
        webkitBorderBeforeColor: {
            set: function (v) {
                this.setProperty('-webkit-border-before-color', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-before-color');
            },
            enumerable: true
        },
        webkitBorderBeforeStyle: {
            set: function (v) {
                this.setProperty('-webkit-border-before-style', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-before-style');
            },
            enumerable: true
        },
        webkitBorderBeforeWidth: {
            set: function (v) {
                this.setProperty('-webkit-border-before-width', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-before-width');
            },
            enumerable: true
        },
        webkitBorderEnd: {
            set: function (v) {
                this.setProperty('-webkit-border-end', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-end');
            },
            enumerable: true
        },
        webkitBorderEndColor: {
            set: function (v) {
                this.setProperty('-webkit-border-end-color', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-end-color');
            },
            enumerable: true
        },
        webkitBorderEndStyle: {
            set: function (v) {
                this.setProperty('-webkit-border-end-style', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-end-style');
            },
            enumerable: true
        },
        webkitBorderEndWidth: {
            set: function (v) {
                this.setProperty('-webkit-border-end-width', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-end-width');
            },
            enumerable: true
        },
        webkitBorderFit: {
            set: function (v) {
                this.setProperty('-webkit-border-fit', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-fit');
            },
            enumerable: true
        },
        webkitBorderHorizontalSpacing: {
            set: function (v) {
                this.setProperty('-webkit-border-horizontal-spacing', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-horizontal-spacing');
            },
            enumerable: true
        },
        webkitBorderImage: {
            set: function (v) {
                this.setProperty('-webkit-border-image', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-image');
            },
            enumerable: true
        },
        webkitBorderRadius: {
            set: function (v) {
                this.setProperty('-webkit-border-radius', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-radius');
            },
            enumerable: true
        },
        webkitBorderStart: {
            set: function (v) {
                this.setProperty('-webkit-border-start', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-start');
            },
            enumerable: true
        },
        webkitBorderStartColor: {
            set: function (v) {
                this.setProperty('-webkit-border-start-color', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-start-color');
            },
            enumerable: true
        },
        webkitBorderStartStyle: {
            set: function (v) {
                this.setProperty('-webkit-border-start-style', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-start-style');
            },
            enumerable: true
        },
        webkitBorderStartWidth: {
            set: function (v) {
                this.setProperty('-webkit-border-start-width', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-start-width');
            },
            enumerable: true
        },
        webkitBorderVerticalSpacing: {
            set: function (v) {
                this.setProperty('-webkit-border-vertical-spacing', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-border-vertical-spacing');
            },
            enumerable: true
        },
        webkitBoxAlign: {
            set: function (v) {
                this.setProperty('-webkit-box-align', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-box-align');
            },
            enumerable: true
        },
        webkitBoxDirection: {
            set: function (v) {
                this.setProperty('-webkit-box-direction', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-box-direction');
            },
            enumerable: true
        },
        webkitBoxFlex: {
            set: function (v) {
                this.setProperty('-webkit-box-flex', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-box-flex');
            },
            enumerable: true
        },
        webkitBoxFlexGroup: {
            set: function (v) {
                this.setProperty('-webkit-box-flex-group', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-box-flex-group');
            },
            enumerable: true
        },
        webkitBoxLines: {
            set: function (v) {
                this.setProperty('-webkit-box-lines', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-box-lines');
            },
            enumerable: true
        },
        webkitBoxOrdinalGroup: {
            set: function (v) {
                this.setProperty('-webkit-box-ordinal-group', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-box-ordinal-group');
            },
            enumerable: true
        },
        webkitBoxOrient: {
            set: function (v) {
                this.setProperty('-webkit-box-orient', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-box-orient');
            },
            enumerable: true
        },
        webkitBoxPack: {
            set: function (v) {
                this.setProperty('-webkit-box-pack', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-box-pack');
            },
            enumerable: true
        },
        webkitBoxReflect: {
            set: function (v) {
                this.setProperty('-webkit-box-reflect', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-box-reflect');
            },
            enumerable: true
        },
        webkitBoxShadow: {
            set: function (v) {
                this.setProperty('-webkit-box-shadow', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-box-shadow');
            },
            enumerable: true
        },
        webkitColorCorrection: {
            set: function (v) {
                this.setProperty('-webkit-color-correction', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-color-correction');
            },
            enumerable: true
        },
        webkitColumnAxis: {
            set: function (v) {
                this.setProperty('-webkit-column-axis', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-column-axis');
            },
            enumerable: true
        },
        webkitColumnBreakAfter: {
            set: function (v) {
                this.setProperty('-webkit-column-break-after', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-column-break-after');
            },
            enumerable: true
        },
        webkitColumnBreakBefore: {
            set: function (v) {
                this.setProperty('-webkit-column-break-before', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-column-break-before');
            },
            enumerable: true
        },
        webkitColumnBreakInside: {
            set: function (v) {
                this.setProperty('-webkit-column-break-inside', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-column-break-inside');
            },
            enumerable: true
        },
        webkitColumnCount: {
            set: function (v) {
                this.setProperty('-webkit-column-count', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-column-count');
            },
            enumerable: true
        },
        webkitColumnGap: {
            set: function (v) {
                this.setProperty('-webkit-column-gap', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-column-gap');
            },
            enumerable: true
        },
        webkitColumnRule: {
            set: function (v) {
                this.setProperty('-webkit-column-rule', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-column-rule');
            },
            enumerable: true
        },
        webkitColumnRuleColor: {
            set: function (v) {
                this.setProperty('-webkit-column-rule-color', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-column-rule-color');
            },
            enumerable: true
        },
        webkitColumnRuleStyle: {
            set: function (v) {
                this.setProperty('-webkit-column-rule-style', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-column-rule-style');
            },
            enumerable: true
        },
        webkitColumnRuleWidth: {
            set: function (v) {
                this.setProperty('-webkit-column-rule-width', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-column-rule-width');
            },
            enumerable: true
        },
        webkitColumnSpan: {
            set: function (v) {
                this.setProperty('-webkit-column-span', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-column-span');
            },
            enumerable: true
        },
        webkitColumnWidth: {
            set: function (v) {
                this.setProperty('-webkit-column-width', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-column-width');
            },
            enumerable: true
        },
        webkitColumns: {
            set: function (v) {
                this.setProperty('-webkit-columns', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-columns');
            },
            enumerable: true
        },
        webkitFilter: {
            set: function (v) {
                this.setProperty('-webkit-filter', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-filter');
            },
            enumerable: true
        },
        webkitFlexAlign: {
            set: function (v) {
                this.setProperty('-webkit-flex-align', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-flex-align');
            },
            enumerable: true
        },
        webkitFlexDirection: {
            set: function (v) {
                this.setProperty('-webkit-flex-direction', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-flex-direction');
            },
            enumerable: true
        },
        webkitFlexFlow: {
            set: function (v) {
                this.setProperty('-webkit-flex-flow', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-flex-flow');
            },
            enumerable: true
        },
        webkitFlexItemAlign: {
            set: function (v) {
                this.setProperty('-webkit-flex-item-align', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-flex-item-align');
            },
            enumerable: true
        },
        webkitFlexLinePack: {
            set: function (v) {
                this.setProperty('-webkit-flex-line-pack', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-flex-line-pack');
            },
            enumerable: true
        },
        webkitFlexOrder: {
            set: function (v) {
                this.setProperty('-webkit-flex-order', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-flex-order');
            },
            enumerable: true
        },
        webkitFlexPack: {
            set: function (v) {
                this.setProperty('-webkit-flex-pack', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-flex-pack');
            },
            enumerable: true
        },
        webkitFlexWrap: {
            set: function (v) {
                this.setProperty('-webkit-flex-wrap', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-flex-wrap');
            },
            enumerable: true
        },
        webkitFlowFrom: {
            set: function (v) {
                this.setProperty('-webkit-flow-from', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-flow-from');
            },
            enumerable: true
        },
        webkitFlowInto: {
            set: function (v) {
                this.setProperty('-webkit-flow-into', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-flow-into');
            },
            enumerable: true
        },
        webkitFontFeatureSettings: {
            set: function (v) {
                this.setProperty('-webkit-font-feature-settings', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-font-feature-settings');
            },
            enumerable: true
        },
        webkitFontKerning: {
            set: function (v) {
                this.setProperty('-webkit-font-kerning', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-font-kerning');
            },
            enumerable: true
        },
        webkitFontSizeDelta: {
            set: function (v) {
                this.setProperty('-webkit-font-size-delta', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-font-size-delta');
            },
            enumerable: true
        },
        webkitFontSmoothing: {
            set: function (v) {
                this.setProperty('-webkit-font-smoothing', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-font-smoothing');
            },
            enumerable: true
        },
        webkitFontVariantLigatures: {
            set: function (v) {
                this.setProperty('-webkit-font-variant-ligatures', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-font-variant-ligatures');
            },
            enumerable: true
        },
        webkitHighlight: {
            set: function (v) {
                this.setProperty('-webkit-highlight', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-highlight');
            },
            enumerable: true
        },
        webkitHyphenateCharacter: {
            set: function (v) {
                this.setProperty('-webkit-hyphenate-character', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-hyphenate-character');
            },
            enumerable: true
        },
        webkitHyphenateLimitAfter: {
            set: function (v) {
                this.setProperty('-webkit-hyphenate-limit-after', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-hyphenate-limit-after');
            },
            enumerable: true
        },
        webkitHyphenateLimitBefore: {
            set: function (v) {
                this.setProperty('-webkit-hyphenate-limit-before', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-hyphenate-limit-before');
            },
            enumerable: true
        },
        webkitHyphenateLimitLines: {
            set: function (v) {
                this.setProperty('-webkit-hyphenate-limit-lines', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-hyphenate-limit-lines');
            },
            enumerable: true
        },
        webkitHyphens: {
            set: function (v) {
                this.setProperty('-webkit-hyphens', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-hyphens');
            },
            enumerable: true
        },
        webkitLineAlign: {
            set: function (v) {
                this.setProperty('-webkit-line-align', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-line-align');
            },
            enumerable: true
        },
        webkitLineBoxContain: {
            set: function (v) {
                this.setProperty('-webkit-line-box-contain', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-line-box-contain');
            },
            enumerable: true
        },
        webkitLineBreak: {
            set: function (v) {
                this.setProperty('-webkit-line-break', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-line-break');
            },
            enumerable: true
        },
        webkitLineClamp: {
            set: function (v) {
                this.setProperty('-webkit-line-clamp', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-line-clamp');
            },
            enumerable: true
        },
        webkitLineGrid: {
            set: function (v) {
                this.setProperty('-webkit-line-grid', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-line-grid');
            },
            enumerable: true
        },
        webkitLineSnap: {
            set: function (v) {
                this.setProperty('-webkit-line-snap', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-line-snap');
            },
            enumerable: true
        },
        webkitLocale: {
            set: function (v) {
                this.setProperty('-webkit-locale', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-locale');
            },
            enumerable: true
        },
        webkitLogicalHeight: {
            set: function (v) {
                this.setProperty('-webkit-logical-height', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-logical-height');
            },
            enumerable: true
        },
        webkitLogicalWidth: {
            set: function (v) {
                this.setProperty('-webkit-logical-width', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-logical-width');
            },
            enumerable: true
        },
        webkitMarginAfter: {
            set: function (v) {
                this.setProperty('-webkit-margin-after', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-margin-after');
            },
            enumerable: true
        },
        webkitMarginAfterCollapse: {
            set: function (v) {
                this.setProperty('-webkit-margin-after-collapse', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-margin-after-collapse');
            },
            enumerable: true
        },
        webkitMarginBefore: {
            set: function (v) {
                this.setProperty('-webkit-margin-before', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-margin-before');
            },
            enumerable: true
        },
        webkitMarginBeforeCollapse: {
            set: function (v) {
                this.setProperty('-webkit-margin-before-collapse', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-margin-before-collapse');
            },
            enumerable: true
        },
        webkitMarginBottomCollapse: {
            set: function (v) {
                this.setProperty('-webkit-margin-bottom-collapse', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-margin-bottom-collapse');
            },
            enumerable: true
        },
        webkitMarginCollapse: {
            set: function (v) {
                this.setProperty('-webkit-margin-collapse', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-margin-collapse');
            },
            enumerable: true
        },
        webkitMarginEnd: {
            set: function (v) {
                this.setProperty('-webkit-margin-end', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-margin-end');
            },
            enumerable: true
        },
        webkitMarginStart: {
            set: function (v) {
                this.setProperty('-webkit-margin-start', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-margin-start');
            },
            enumerable: true
        },
        webkitMarginTopCollapse: {
            set: function (v) {
                this.setProperty('-webkit-margin-top-collapse', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-margin-top-collapse');
            },
            enumerable: true
        },
        webkitMarquee: {
            set: function (v) {
                this.setProperty('-webkit-marquee', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-marquee');
            },
            enumerable: true
        },
        webkitMarqueeDirection: {
            set: function (v) {
                this.setProperty('-webkit-marquee-direction', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-marquee-direction');
            },
            enumerable: true
        },
        webkitMarqueeIncrement: {
            set: function (v) {
                this.setProperty('-webkit-marquee-increment', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-marquee-increment');
            },
            enumerable: true
        },
        webkitMarqueeRepetition: {
            set: function (v) {
                this.setProperty('-webkit-marquee-repetition', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-marquee-repetition');
            },
            enumerable: true
        },
        webkitMarqueeSpeed: {
            set: function (v) {
                this.setProperty('-webkit-marquee-speed', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-marquee-speed');
            },
            enumerable: true
        },
        webkitMarqueeStyle: {
            set: function (v) {
                this.setProperty('-webkit-marquee-style', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-marquee-style');
            },
            enumerable: true
        },
        webkitMask: {
            set: function (v) {
                this.setProperty('-webkit-mask', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask');
            },
            enumerable: true
        },
        webkitMaskAttachment: {
            set: function (v) {
                this.setProperty('-webkit-mask-attachment', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-attachment');
            },
            enumerable: true
        },
        webkitMaskBoxImage: {
            set: function (v) {
                this.setProperty('-webkit-mask-box-image', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-box-image');
            },
            enumerable: true
        },
        webkitMaskBoxImageOutset: {
            set: function (v) {
                this.setProperty('-webkit-mask-box-image-outset', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-box-image-outset');
            },
            enumerable: true
        },
        webkitMaskBoxImageRepeat: {
            set: function (v) {
                this.setProperty('-webkit-mask-box-image-repeat', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-box-image-repeat');
            },
            enumerable: true
        },
        webkitMaskBoxImageSlice: {
            set: function (v) {
                this.setProperty('-webkit-mask-box-image-slice', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-box-image-slice');
            },
            enumerable: true
        },
        webkitMaskBoxImageSource: {
            set: function (v) {
                this.setProperty('-webkit-mask-box-image-source', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-box-image-source');
            },
            enumerable: true
        },
        webkitMaskBoxImageWidth: {
            set: function (v) {
                this.setProperty('-webkit-mask-box-image-width', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-box-image-width');
            },
            enumerable: true
        },
        webkitMaskClip: {
            set: function (v) {
                this.setProperty('-webkit-mask-clip', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-clip');
            },
            enumerable: true
        },
        webkitMaskComposite: {
            set: function (v) {
                this.setProperty('-webkit-mask-composite', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-composite');
            },
            enumerable: true
        },
        webkitMaskImage: {
            set: function (v) {
                this.setProperty('-webkit-mask-image', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-image');
            },
            enumerable: true
        },
        webkitMaskOrigin: {
            set: function (v) {
                this.setProperty('-webkit-mask-origin', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-origin');
            },
            enumerable: true
        },
        webkitMaskPosition: {
            set: function (v) {
                this.setProperty('-webkit-mask-position', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-position');
            },
            enumerable: true
        },
        webkitMaskPositionX: {
            set: function (v) {
                this.setProperty('-webkit-mask-position-x', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-position-x');
            },
            enumerable: true
        },
        webkitMaskPositionY: {
            set: function (v) {
                this.setProperty('-webkit-mask-position-y', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-position-y');
            },
            enumerable: true
        },
        webkitMaskRepeat: {
            set: function (v) {
                this.setProperty('-webkit-mask-repeat', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-repeat');
            },
            enumerable: true
        },
        webkitMaskRepeatX: {
            set: function (v) {
                this.setProperty('-webkit-mask-repeat-x', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-repeat-x');
            },
            enumerable: true
        },
        webkitMaskRepeatY: {
            set: function (v) {
                this.setProperty('-webkit-mask-repeat-y', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-repeat-y');
            },
            enumerable: true
        },
        webkitMaskSize: {
            set: function (v) {
                this.setProperty('-webkit-mask-size', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-mask-size');
            },
            enumerable: true
        },
        webkitMatchNearestMailBlockquoteColor: {
            set: function (v) {
                this.setProperty('-webkit-match-nearest-mail-blockquote-color', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-match-nearest-mail-blockquote-color');
            },
            enumerable: true
        },
        webkitMaxLogicalHeight: {
            set: function (v) {
                this.setProperty('-webkit-max-logical-height', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-max-logical-height');
            },
            enumerable: true
        },
        webkitMaxLogicalWidth: {
            set: function (v) {
                this.setProperty('-webkit-max-logical-width', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-max-logical-width');
            },
            enumerable: true
        },
        webkitMinLogicalHeight: {
            set: function (v) {
                this.setProperty('-webkit-min-logical-height', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-min-logical-height');
            },
            enumerable: true
        },
        webkitMinLogicalWidth: {
            set: function (v) {
                this.setProperty('-webkit-min-logical-width', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-min-logical-width');
            },
            enumerable: true
        },
        webkitNbspMode: {
            set: function (v) {
                this.setProperty('-webkit-nbsp-mode', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-nbsp-mode');
            },
            enumerable: true
        },
        webkitOverflowScrolling: {
            set: function (v) {
                this.setProperty('-webkit-overflow-scrolling', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-overflow-scrolling');
            },
            enumerable: true
        },
        webkitPaddingAfter: {
            set: function (v) {
                this.setProperty('-webkit-padding-after', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-padding-after');
            },
            enumerable: true
        },
        webkitPaddingBefore: {
            set: function (v) {
                this.setProperty('-webkit-padding-before', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-padding-before');
            },
            enumerable: true
        },
        webkitPaddingEnd: {
            set: function (v) {
                this.setProperty('-webkit-padding-end', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-padding-end');
            },
            enumerable: true
        },
        webkitPaddingStart: {
            set: function (v) {
                this.setProperty('-webkit-padding-start', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-padding-start');
            },
            enumerable: true
        },
        webkitPerspective: {
            set: function (v) {
                this.setProperty('-webkit-perspective', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-perspective');
            },
            enumerable: true
        },
        webkitPerspectiveOrigin: {
            set: function (v) {
                this.setProperty('-webkit-perspective-origin', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-perspective-origin');
            },
            enumerable: true
        },
        webkitPerspectiveOriginX: {
            set: function (v) {
                this.setProperty('-webkit-perspective-origin-x', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-perspective-origin-x');
            },
            enumerable: true
        },
        webkitPerspectiveOriginY: {
            set: function (v) {
                this.setProperty('-webkit-perspective-origin-y', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-perspective-origin-y');
            },
            enumerable: true
        },
        webkitPrintColorAdjust: {
            set: function (v) {
                this.setProperty('-webkit-print-color-adjust', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-print-color-adjust');
            },
            enumerable: true
        },
        webkitRegionBreakAfter: {
            set: function (v) {
                this.setProperty('-webkit-region-break-after', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-region-break-after');
            },
            enumerable: true
        },
        webkitRegionBreakBefore: {
            set: function (v) {
                this.setProperty('-webkit-region-break-before', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-region-break-before');
            },
            enumerable: true
        },
        webkitRegionBreakInside: {
            set: function (v) {
                this.setProperty('-webkit-region-break-inside', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-region-break-inside');
            },
            enumerable: true
        },
        webkitRegionOverflow: {
            set: function (v) {
                this.setProperty('-webkit-region-overflow', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-region-overflow');
            },
            enumerable: true
        },
        webkitRtlOrdering: {
            set: function (v) {
                this.setProperty('-webkit-rtl-ordering', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-rtl-ordering');
            },
            enumerable: true
        },
        webkitSvgShadow: {
            set: function (v) {
                this.setProperty('-webkit-svg-shadow', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-svg-shadow');
            },
            enumerable: true
        },
        webkitTapHighlightColor: {
            set: function (v) {
                this.setProperty('-webkit-tap-highlight-color', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-tap-highlight-color');
            },
            enumerable: true
        },
        webkitTextCombine: {
            set: function (v) {
                this.setProperty('-webkit-text-combine', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-text-combine');
            },
            enumerable: true
        },
        webkitTextDecorationsInEffect: {
            set: function (v) {
                this.setProperty('-webkit-text-decorations-in-effect', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-text-decorations-in-effect');
            },
            enumerable: true
        },
        webkitTextEmphasis: {
            set: function (v) {
                this.setProperty('-webkit-text-emphasis', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-text-emphasis');
            },
            enumerable: true
        },
        webkitTextEmphasisColor: {
            set: function (v) {
                this.setProperty('-webkit-text-emphasis-color', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-text-emphasis-color');
            },
            enumerable: true
        },
        webkitTextEmphasisPosition: {
            set: function (v) {
                this.setProperty('-webkit-text-emphasis-position', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-text-emphasis-position');
            },
            enumerable: true
        },
        webkitTextEmphasisStyle: {
            set: function (v) {
                this.setProperty('-webkit-text-emphasis-style', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-text-emphasis-style');
            },
            enumerable: true
        },
        webkitTextFillColor: {
            set: function (v) {
                this.setProperty('-webkit-text-fill-color', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-text-fill-color');
            },
            enumerable: true
        },
        webkitTextOrientation: {
            set: function (v) {
                this.setProperty('-webkit-text-orientation', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-text-orientation');
            },
            enumerable: true
        },
        webkitTextSecurity: {
            set: function (v) {
                this.setProperty('-webkit-text-security', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-text-security');
            },
            enumerable: true
        },
        webkitTextSizeAdjust: {
            set: function (v) {
                this.setProperty('-webkit-text-size-adjust', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-text-size-adjust');
            },
            enumerable: true
        },
        webkitTextStroke: {
            set: function (v) {
                this.setProperty('-webkit-text-stroke', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-text-stroke');
            },
            enumerable: true
        },
        webkitTextStrokeColor: {
            set: function (v) {
                this.setProperty('-webkit-text-stroke-color', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-text-stroke-color');
            },
            enumerable: true
        },
        webkitTextStrokeWidth: {
            set: function (v) {
                this.setProperty('-webkit-text-stroke-width', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-text-stroke-width');
            },
            enumerable: true
        },
        webkitTransform: {
            set: function (v) {
                this.setProperty('-webkit-transform', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-transform');
            },
            enumerable: true
        },
        webkitTransformOrigin: {
            set: function (v) {
                this.setProperty('-webkit-transform-origin', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-transform-origin');
            },
            enumerable: true
        },
        webkitTransformOriginX: {
            set: function (v) {
                this.setProperty('-webkit-transform-origin-x', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-transform-origin-x');
            },
            enumerable: true
        },
        webkitTransformOriginY: {
            set: function (v) {
                this.setProperty('-webkit-transform-origin-y', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-transform-origin-y');
            },
            enumerable: true
        },
        webkitTransformOriginZ: {
            set: function (v) {
                this.setProperty('-webkit-transform-origin-z', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-transform-origin-z');
            },
            enumerable: true
        },
        webkitTransformStyle: {
            set: function (v) {
                this.setProperty('-webkit-transform-style', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-transform-style');
            },
            enumerable: true
        },
        webkitTransition: {
            set: function (v) {
                this.setProperty('-webkit-transition', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-transition');
            },
            enumerable: true
        },
        webkitTransitionDelay: {
            set: function (v) {
                this.setProperty('-webkit-transition-delay', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-transition-delay');
            },
            enumerable: true
        },
        webkitTransitionDuration: {
            set: function (v) {
                this.setProperty('-webkit-transition-duration', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-transition-duration');
            },
            enumerable: true
        },
        webkitTransitionProperty: {
            set: function (v) {
                this.setProperty('-webkit-transition-property', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-transition-property');
            },
            enumerable: true
        },
        webkitTransitionTimingFunction: {
            set: function (v) {
                this.setProperty('-webkit-transition-timing-function', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-transition-timing-function');
            },
            enumerable: true
        },
        webkitUserDrag: {
            set: function (v) {
                this.setProperty('-webkit-user-drag', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-user-drag');
            },
            enumerable: true
        },
        webkitUserModify: {
            set: function (v) {
                this.setProperty('-webkit-user-modify', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-user-modify');
            },
            enumerable: true
        },
        webkitUserSelect: {
            set: function (v) {
                this.setProperty('-webkit-user-select', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-user-select');
            },
            enumerable: true
        },
        webkitWrap: {
            set: function (v) {
                this.setProperty('-webkit-wrap', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-wrap');
            },
            enumerable: true
        },
        webkitWrapFlow: {
            set: function (v) {
                this.setProperty('-webkit-wrap-flow', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-wrap-flow');
            },
            enumerable: true
        },
        webkitWrapMargin: {
            set: function (v) {
                this.setProperty('-webkit-wrap-margin', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-wrap-margin');
            },
            enumerable: true
        },
        webkitWrapPadding: {
            set: function (v) {
                this.setProperty('-webkit-wrap-padding', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-wrap-padding');
            },
            enumerable: true
        },
        webkitWrapShapeInside: {
            set: function (v) {
                this.setProperty('-webkit-wrap-shape-inside', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-wrap-shape-inside');
            },
            enumerable: true
        },
        webkitWrapShapeOutside: {
            set: function (v) {
                this.setProperty('-webkit-wrap-shape-outside', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-wrap-shape-outside');
            },
            enumerable: true
        },
        webkitWrapThrough: {
            set: function (v) {
                this.setProperty('-webkit-wrap-through', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-wrap-through');
            },
            enumerable: true
        },
        webkitWritingMode: {
            set: function (v) {
                this.setProperty('-webkit-writing-mode', v);
            },
            get: function () {
                return this.getPropertyValue('-webkit-writing-mode');
            },
            enumerable: true
        },
        whiteSpace: {
            set: function (v) {
                this.setProperty('white-space', v);
            },
            get: function () {
                return this.getPropertyValue('white-space');
            },
            enumerable: true
        },
        widows: {
            set: function (v) {
                this.setProperty('widows', v);
            },
            get: function () {
                return this.getPropertyValue('widows');
            },
            enumerable: true
        },
        width: {
            set: function (v) {
                this.setProperty('width', v);
            },
            get: function () {
                return this.getPropertyValue('width');
            },
            enumerable: true
        },
        wordBreak: {
            set: function (v) {
                this.setProperty('word-break', v);
            },
            get: function () {
                return this.getPropertyValue('word-break');
            },
            enumerable: true
        },
        wordSpacing: {
            set: function (v) {
                this.setProperty('word-spacing', v);
            },
            get: function () {
                return this.getPropertyValue('word-spacing');
            },
            enumerable: true
        },
        wordWrap: {
            set: function (v) {
                this.setProperty('word-wrap', v);
            },
            get: function () {
                return this.getPropertyValue('word-wrap');
            },
            enumerable: true
        },
        writingMode: {
            set: function (v) {
                this.setProperty('writing-mode', v);
            },
            get: function () {
                return this.getPropertyValue('writing-mode');
            },
            enumerable: true
        },
        zIndex: {
            set: function (v) {
                this.setProperty('z-index', v);
            },
            get: function () {
                return this.getPropertyValue('z-index');
            },
            enumerable: true
        },
        zoom: {
            set: function (v) {
                this.setProperty('zoom', v);
            },
            get: function () {
                return this.getPropertyValue('zoom');
            },
            enumerable: true
        }
    });
};

exports.CSSStyleDeclaration = CSSStyleDeclaration;
