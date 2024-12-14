'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
var { CSSStyleDeclaration } = require('../lib/CSSStyleDeclaration');

var allProperties = require('../lib/allProperties');
var allExtraProperties = require('../lib/allExtraProperties');
var implementedProperties = require('../lib/implementedProperties');
var parsers = require('../lib/parsers');

var dashedProperties = [...allProperties, ...allExtraProperties];
var allowedProperties = dashedProperties.map(parsers.dashedToCamelCase);
implementedProperties = Array.from(implementedProperties).map(parsers.dashedToCamelCase);
var invalidProperties = implementedProperties.filter((prop) => !allowedProperties.includes(prop));

describe('CSSStyleDeclaration', () => {
  it('has only valid properties implemented', () => {
    assert.strictEqual(invalidProperties.length, 0);
  });

  it('has all properties', () => {
    var style = new CSSStyleDeclaration();
    allProperties.forEach((property) => {
      assert.ok(style.__lookupGetter__(property));
      assert.ok(style.__lookupSetter__(property));
    });
  });

  it('has dashed properties', () => {
    var style = new CSSStyleDeclaration();
    dashedProperties.forEach((property) => {
      assert.ok(style.__lookupGetter__(property));
      assert.ok(style.__lookupSetter__(property));
    });
  });

  it('has all functions', () => {
    var style = new CSSStyleDeclaration();

    assert.strictEqual(typeof style.item, 'function');
    assert.strictEqual(typeof style.getPropertyValue, 'function');
    assert.strictEqual(typeof style.setProperty, 'function');
    assert.strictEqual(typeof style.getPropertyPriority, 'function');
    assert.strictEqual(typeof style.removeProperty, 'function');

    // TODO - deprecated according to MDN and not implemented at all, can we remove?
    assert.strictEqual(typeof style.getPropertyCSSValue, 'function');
  });

  it('has special properties', () => {
    var style = new CSSStyleDeclaration();

    assert.ok(style.__lookupGetter__('cssText'));
    assert.ok(style.__lookupSetter__('cssText'));
    assert.ok(style.__lookupGetter__('length'));
    assert.ok(style.__lookupSetter__('length'));
    assert.ok(style.__lookupGetter__('parentRule'));
  });

  it('from style string', () => {
    var style = new CSSStyleDeclaration();
    style.cssText = 'color: blue; background-color: red; width: 78%; height: 50vh;';
    assert.strictEqual(style.length, 4);
    assert.strictEqual(
      style.cssText,
      'color: blue; background-color: red; width: 78%; height: 50vh;'
    );
    assert.strictEqual(style.getPropertyValue('color'), 'blue');
    assert.strictEqual(style.item(0), 'color');
    assert.strictEqual(style[1], 'background-color');
    assert.strictEqual(style.backgroundColor, 'red');
    style.cssText = '';
    assert.strictEqual(style.cssText, '');
    assert.strictEqual(style.length, 0);
  });

  it('from properties', () => {
    var style = new CSSStyleDeclaration();
    style.color = 'blue';
    assert.strictEqual(style.length, 1);
    assert.strictEqual(style[0], 'color');
    assert.strictEqual(style.cssText, 'color: blue;');
    assert.strictEqual(style.item(0), 'color');
    assert.strictEqual(style.color, 'blue');
    style.backgroundColor = 'red';
    assert.strictEqual(style.length, 2);
    assert.strictEqual(style[0], 'color');
    assert.strictEqual(style[1], 'background-color');
    assert.strictEqual(style.cssText, 'color: blue; background-color: red;');
    assert.strictEqual(style.backgroundColor, 'red');
    style.removeProperty('color');
    assert.strictEqual(style[0], 'background-color');
  });

  it('shorthand properties', () => {
    var style = new CSSStyleDeclaration();
    style.background = 'blue url(http://www.example.com/some_img.jpg)';
    assert.strictEqual(style.backgroundColor, 'blue');
    assert.strictEqual(style.backgroundImage, 'url(http://www.example.com/some_img.jpg)');
    assert.strictEqual(style.background, 'blue url(http://www.example.com/some_img.jpg)');
    style.border = '0 solid black';
    assert.strictEqual(style.borderWidth, '0px');
    assert.strictEqual(style.borderStyle, 'solid');
    assert.strictEqual(style.borderColor, 'black');
    assert.strictEqual(style.borderTopWidth, '0px');
    assert.strictEqual(style.borderLeftStyle, 'solid');
    assert.strictEqual(style.borderBottomColor, 'black');
    style.font = '12em monospace';
    assert.strictEqual(style.fontSize, '12em');
    assert.strictEqual(style.fontFamily, 'monospace');
  });

  it('width and height properties and null and empty strings', () => {
    var style = new CSSStyleDeclaration();
    style.height = 6;
    assert.strictEqual(style.height, '');
    style.width = 0;
    assert.strictEqual(style.width, '0px');
    style.height = '34%';
    assert.strictEqual(style.height, '34%');
    style.height = '100vh';
    assert.strictEqual(style.height, '100vh');
    style.height = '100vw';
    assert.strictEqual(style.height, '100vw');
    style.height = '';
    assert.strictEqual(style.length, 1);
    assert.strictEqual(style.cssText, 'width: 0px;');
    style.width = null;
    assert.strictEqual(style.length, 0);
    assert.strictEqual(style.cssText, '');
  });

  it('implicit properties', () => {
    var style = new CSSStyleDeclaration();
    style.borderWidth = 0;
    assert.strictEqual(style.length, 1);
    assert.strictEqual(style.borderWidth, '0px');
    assert.strictEqual(style.borderTopWidth, '0px');
    assert.strictEqual(style.borderBottomWidth, '0px');
    assert.strictEqual(style.borderLeftWidth, '0px');
    assert.strictEqual(style.borderRightWidth, '0px');
    assert.strictEqual(style.cssText, 'border-width: 0px;');
  });

  it('top, left, right, bottom properties', () => {
    var style = new CSSStyleDeclaration();
    style.top = 0;
    style.left = '0%';
    style.right = '5em';
    style.bottom = '12pt';
    assert.strictEqual(style.top, '0px');
    assert.strictEqual(style.left, '0%');
    assert.strictEqual(style.right, '5em');
    assert.strictEqual(style.bottom, '12pt');
    assert.strictEqual(style.length, 4);
    assert.strictEqual(style.cssText, 'top: 0px; left: 0%; right: 5em; bottom: 12pt;');
  });

  it('clear and clip properties', () => {
    var style = new CSSStyleDeclaration();
    style.clear = 'none';
    assert.strictEqual(style.clear, 'none');
    style.clear = 'lfet';
    assert.strictEqual(style.clear, 'none');
    style.clear = 'left';
    assert.strictEqual(style.clear, 'left');
    style.clear = 'right';
    assert.strictEqual(style.clear, 'right');
    style.clear = 'both';
    assert.strictEqual(style.clear, 'both');
    style.clip = 'elipse(5px, 10px)';
    assert.strictEqual(style.clip, '');
    assert.strictEqual(style.length, 1);
    style.clip = 'rect(0, 3Em, 2pt, 50%)';
    assert.strictEqual(style.clip, 'rect(0px, 3em, 2pt, 50%)');
    assert.strictEqual(style.length, 2);
    assert.strictEqual(style.cssText, 'clear: both; clip: rect(0px, 3em, 2pt, 50%);');
  });

  it('colors', () => {
    var style = new CSSStyleDeclaration();
    style.color = 'rgba(0,0,0,0)';
    assert.strictEqual(style.color, 'rgba(0, 0, 0, 0)');
    style.color = 'rgba(5%, 10%, 20%, 0.4)';
    assert.strictEqual(style.color, 'rgba(13, 26, 51, 0.4)');
    style.color = 'rgb(33%, 34%, 33%)';
    assert.strictEqual(style.color, 'rgb(84, 87, 84)');
    style.color = 'rgba(300, 200, 100, 1.5)';
    assert.strictEqual(style.color, 'rgb(255, 200, 100)');
    style.color = 'hsla(0, 1%, 2%, 0.5)';
    assert.strictEqual(style.color, 'rgba(5, 5, 5, 0.5)');
    style.color = 'hsl(0, 1%, 2%)';
    assert.strictEqual(style.color, 'rgb(5, 5, 5)');
    style.color = 'rebeccapurple';
    assert.strictEqual(style.color, 'rebeccapurple');
    style.color = 'transparent';
    assert.strictEqual(style.color, 'transparent');
    style.color = 'currentcolor';
    assert.strictEqual(style.color, 'currentcolor');
    style.color = '#ffffffff';
    assert.strictEqual(style.color, 'rgb(255, 255, 255)');
    style.color = '#fffa';
    assert.strictEqual(style.color, 'rgba(255, 255, 255, 0.667)');
    style.color = '#ffffff66';
    assert.strictEqual(style.color, 'rgba(255, 255, 255, 0.4)');
  });

  it('invalid hex color value', () => {
    var style = new CSSStyleDeclaration();
    style.color = '#1234567';
    assert.strictEqual(style.color, '');
  });

  it('short hand properties with embedded spaces', () => {
    var style = new CSSStyleDeclaration();
    style.background = 'rgb(0, 0, 0) url(/something/somewhere.jpg)';
    assert.strictEqual(style.backgroundColor, 'rgb(0, 0, 0)');
    assert.strictEqual(style.backgroundImage, 'url(/something/somewhere.jpg)');
    assert.strictEqual(style.cssText, 'background: rgb(0, 0, 0) url(/something/somewhere.jpg);');
    style = new CSSStyleDeclaration();
    style.border = '  1px  solid   black  ';
    assert.strictEqual(style.border, '1px solid black');
  });

  it('setting shorthand properties to an empty string should clear all dependent properties', () => {
    var style = new CSSStyleDeclaration();
    style.borderWidth = '1px';
    assert.strictEqual(style.cssText, 'border-width: 1px;');
    style.border = '';
    assert.strictEqual(style.cssText, '');
  });

  it('setting implicit properties to an empty string should clear all dependent properties', () => {
    var style = new CSSStyleDeclaration();
    style.borderTopWidth = '1px';
    assert.strictEqual(style.cssText, 'border-top-width: 1px;');
    style.borderWidth = '';
    assert.strictEqual(style.cssText, '');
  });

  it('setting a shorthand property, whose shorthands are implicit properties, to an empty string should clear all dependent properties', () => {
    var style = new CSSStyleDeclaration();
    style.borderTopWidth = '1px';
    assert.strictEqual(style.cssText, 'border-top-width: 1px;');
    style.border = '';
    assert.strictEqual(style.cssText, '');
    style.borderTop = '1px solid black';
    assert.strictEqual(style.cssText, 'border-top: 1px solid black;');
    style.border = '';
    assert.strictEqual(style.cssText, '');
  });

  it('setting border values to "none" should clear dependent values', () => {
    var style = new CSSStyleDeclaration();
    style.borderTopWidth = '1px';
    assert.strictEqual(style.cssText, 'border-top-width: 1px;');
    style.border = 'none';
    assert.strictEqual(style.cssText, '');
    style.borderTopWidth = '1px';
    assert.strictEqual(style.cssText, 'border-top-width: 1px;');
    style.borderTopStyle = 'none';
    assert.strictEqual(style.cssText, '');
    style.borderTopWidth = '1px';
    assert.strictEqual(style.cssText, 'border-top-width: 1px;');
    style.borderTop = 'none';
    assert.strictEqual(style.cssText, '');
    style.borderTopWidth = '1px';
    style.borderLeftWidth = '1px';
    assert.strictEqual(style.cssText, 'border-top-width: 1px; border-left-width: 1px;');
    style.borderTop = 'none';
    assert.strictEqual(style.cssText, 'border-left-width: 1px;');
  });

  it('setting border to 0 should be okay', () => {
    var style = new CSSStyleDeclaration();
    style.border = 0;
    assert.strictEqual(style.cssText, 'border: 0px;');
  });

  it('setting values implicit and shorthand properties via csstext and setproperty should propagate to dependent properties', () => {
    var style = new CSSStyleDeclaration();
    style.cssText = 'border: 1px solid black;';
    assert.strictEqual(style.cssText, 'border: 1px solid black;');
    assert.strictEqual(style.borderTop, '1px solid black');
    style.border = '';
    assert.strictEqual(style.cssText, '');
    style.setProperty('border', '1px solid black');
    assert.strictEqual(style.cssText, 'border: 1px solid black;');
  });

  it('setting opacity should work', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('opacity', 0.75);
    assert.strictEqual(style.cssText, 'opacity: 0.75;');
    style.opacity = '0.50';
    assert.strictEqual(style.cssText, 'opacity: 0.5;');
    style.opacity = 1;
    assert.strictEqual(style.cssText, 'opacity: 1;');
  });

  it('width and height of auto should work', () => {
    var style = new CSSStyleDeclaration();
    style.width = 'auto';
    assert.strictEqual(style.cssText, 'width: auto;');
    assert.strictEqual(style.width, 'auto');
    style = new CSSStyleDeclaration();
    style.height = 'auto';
    assert.strictEqual(style.cssText, 'height: auto;');
    assert.strictEqual(style.height, 'auto');
  });

  it('padding and margin should set/clear shorthand properties', () => {
    var style = new CSSStyleDeclaration();
    var parts = ['Top', 'Right', 'Bottom', 'Left'];
    var testParts = function (name, v, V) {
      style[name] = v;
      for (var i = 0; i < 4; i++) {
        var part = name + parts[i];
        assert.strictEqual(style[part], V[i]);
      }

      assert.strictEqual(style[name], v);
      style[name] = '';
    };
    testParts('padding', '1px', ['1px', '1px', '1px', '1px']);
    testParts('padding', '1px 2%', ['1px', '2%', '1px', '2%']);
    testParts('padding', '1px 2px 3px', ['1px', '2px', '3px', '2px']);
    testParts('padding', '1px 2px 3px 4px', ['1px', '2px', '3px', '4px']);
    style.paddingTop = style.paddingRight = style.paddingBottom = style.paddingLeft = '1px';
    testParts('padding', '', ['', '', '', '']);
    testParts('margin', '1px', ['1px', '1px', '1px', '1px']);
    testParts('margin', '1px auto', ['1px', 'auto', '1px', 'auto']);
    testParts('margin', '1px 2% 3px', ['1px', '2%', '3px', '2%']);
    testParts('margin', '1px 2px 3px 4px', ['1px', '2px', '3px', '4px']);
    style.marginTop = style.marginRight = style.marginBottom = style.marginLeft = '1px';
    testParts('margin', '', ['', '', '', '']);
  });

  it('padding and margin shorthands should set main properties', () => {
    var style = new CSSStyleDeclaration();
    var parts = ['Top', 'Right', 'Bottom', 'Left'];
    var testParts = function (name, v, V) {
      var expected;
      for (var i = 0; i < 4; i++) {
        style[name] = v;
        style[name + parts[i]] = V;
        expected = v.split(/ /);
        expected[i] = V;
        expected = expected.join(' ');

        assert.strictEqual(style[name], expected);
      }
    };
    testParts('padding', '1px 2px 3px 4px', '10px');
    testParts('margin', '1px 2px 3px 4px', '10px');
    testParts('margin', '1px 2px 3px 4px', 'auto');
  });

  it('setting individual padding and margin properties to an empty string should clear them', () => {
    var style = new CSSStyleDeclaration();

    var properties = ['padding', 'margin'];
    var parts = ['Top', 'Right', 'Bottom', 'Left'];
    for (var i = 0; i < properties.length; i++) {
      for (var j = 0; j < parts.length; j++) {
        var property = properties[i] + parts[j];
        style[property] = '12px';
        assert.strictEqual(style[property], '12px');

        style[property] = '';
        assert.strictEqual(style[property], '');
      }
    }
  });

  it('removing and setting individual margin properties updates the combined property accordingly', () => {
    var style = new CSSStyleDeclaration();
    style.margin = '1px 2px 3px 4px';

    style.marginTop = '';
    assert.strictEqual(style.margin, '');
    assert.strictEqual(style.marginRight, '2px');
    assert.strictEqual(style.marginBottom, '3px');
    assert.strictEqual(style.marginLeft, '4px');

    style.marginBottom = '';
    assert.strictEqual(style.margin, '');
    assert.strictEqual(style.marginRight, '2px');
    assert.strictEqual(style.marginLeft, '4px');

    style.marginBottom = '5px';
    assert.strictEqual(style.margin, '');
    assert.strictEqual(style.marginRight, '2px');
    assert.strictEqual(style.marginBottom, '5px');
    assert.strictEqual(style.marginLeft, '4px');

    style.marginTop = '6px';
    assert.strictEqual(style.cssText, 'margin: 6px 2px 5px 4px;');
  });

  for (const property of ['padding', 'margin']) {
    it(`removing an individual ${property} property should remove the combined property and replace it with the remaining individual ones`, () => {
      var style = new CSSStyleDeclaration();
      var parts = ['Top', 'Right', 'Bottom', 'Left'];
      var partValues = ['1px', '2px', '3px', '4px'];

      for (var j = 0; j < parts.length; j++) {
        var partToRemove = parts[j];
        style[property] = partValues.join(' ');
        style[property + partToRemove] = '';

        // Main property should have been removed
        assert.strictEqual(style[property], '');

        // Expect other parts to still be there
        for (var k = 0; k < parts.length; k++) {
          var propertyCss = property + '-' + parts[k].toLowerCase() + ': ' + partValues[k] + ';';
          if (k === j) {
            assert.strictEqual(style[property + parts[k]], '');
            assert.strictEqual(style.cssText.includes(propertyCss), false);
          } else {
            assert.strictEqual(style[property + parts[k]], partValues[k]);
            assert.strictEqual(style.cssText.includes(propertyCss), true);
          }
        }
      }
    });

    it(`setting additional ${property} properties keeps important status of others`, () => {
      var style = new CSSStyleDeclaration();
      var importantProperty = property + '-top: 3px !important;';
      style.cssText = importantProperty;
      assert.strictEqual(style.cssText.includes(importantProperty), true);

      style[property + 'Right'] = '4px';
      style[property + 'Bottom'] = '5px';
      style[property + 'Left'] = '6px';

      assert.strictEqual(style.cssText.includes(importantProperty), true);
      assert.strictEqual(style.cssText.includes(property + '-right: 4px;'), true);
      assert.strictEqual(style.cssText.includes(property + '-bottom: 5px;'), true);
      assert.strictEqual(style.cssText.includes(property + '-left: 6px;'), true);
      assert.strictEqual(style.cssText.includes('margin:'), false);
    });

    it(`setting individual ${property} keeps important status of others`, () => {
      var style = new CSSStyleDeclaration();
      style.cssText = `${property}: 3px !important;`;

      style[property + 'Top'] = '4px';

      assert.strictEqual(style.cssText.includes(`${property}-top: 4px;`), true);
      assert.strictEqual(style.cssText.includes(`${property}-right: 3px !important;`), true);
      assert.strictEqual(style.cssText.includes(`${property}-bottom: 3px !important;`), true);
      assert.strictEqual(style.cssText.includes(`${property}-left: 3px !important;`), true);
      assert.strictEqual(style.cssText.includes('margin:'), false);
    });
  }

  it('setting a value to 0 should return the string value', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('fill-opacity', 0);
    assert.strictEqual(style.fillOpacity, '0');
  });

  it('onchange callback should be called when the csstext changes', () => {
    var called = 0;
    var style = new CSSStyleDeclaration(function (cssText) {
      called++;
      assert.strictEqual(cssText, 'opacity: 0;');
    });
    style.cssText = 'opacity: 0;';
    assert.strictEqual(called, 1);
    style.cssText = 'opacity: 0;';
    assert.strictEqual(called, 2);
  });

  it('onchange callback should be called only once when multiple properties were added', () => {
    var called = 0;
    var style = new CSSStyleDeclaration(function (cssText) {
      called++;
      assert.strictEqual(cssText, 'width: 100px; height: 100px;');
    });
    style.cssText = 'width: 100px;height:100px;';
    assert.strictEqual(called, 1);
  });

  it('onchange callback should not be called when property is set to the same value', () => {
    var called = 0;
    var style = new CSSStyleDeclaration(function () {
      called++;
    });

    style.setProperty('opacity', 0);
    assert.strictEqual(called, 1);
    style.setProperty('opacity', 0);
    assert.strictEqual(called, 1);
  });

  it('onchange callback should not be called when removeProperty was called on non-existing property', () => {
    var called = 0;
    var style = new CSSStyleDeclaration(function () {
      called++;
    });
    style.removeProperty('opacity');
    assert.strictEqual(called, 0);
  });

  it('setting float should work the same as cssfloat', () => {
    var style = new CSSStyleDeclaration();
    style.float = 'left';
    assert.strictEqual(style.cssFloat, 'left');
  });

  it('setting improper css to csstext should not throw', () => {
    var style = new CSSStyleDeclaration();
    style.cssText = 'color: ';
    assert.strictEqual(style.cssText, '');
    style.color = 'black';
    style.cssText = 'float: ';
    assert.strictEqual(style.cssText, '');
  });

  it('url parsing works with quotes', () => {
    var style = new CSSStyleDeclaration();
    style.backgroundImage = 'url(http://some/url/here1.png)';
    assert.strictEqual(style.backgroundImage, 'url(http://some/url/here1.png)');
    style.backgroundImage = "url('http://some/url/here2.png')";
    assert.strictEqual(style.backgroundImage, 'url(http://some/url/here2.png)');
    style.backgroundImage = 'url("http://some/url/here3.png")';
    assert.strictEqual(style.backgroundImage, 'url(http://some/url/here3.png)');
  });

  it('setting 0 to a padding or margin works', () => {
    var style = new CSSStyleDeclaration();
    style.padding = 0;
    assert.strictEqual(style.cssText, 'padding: 0px;');
    style.margin = '1em';
    style.marginTop = '0';
    assert.strictEqual(style.marginTop, '0px');
  });

  it('setting ex units to a padding or margin works', () => {
    var style = new CSSStyleDeclaration();
    style.padding = '1ex';
    assert.strictEqual(style.cssText, 'padding: 1ex;');
    style.margin = '1em';
    style.marginTop = '0.5ex';
    assert.strictEqual(style.marginTop, '0.5ex');
  });

  it('setting empty string and null to a padding or margin works', () => {
    var style = new CSSStyleDeclaration();
    var parts = ['Top', 'Right', 'Bottom', 'Left'];
    function testParts(base, nullValue) {
      var props = [base].concat(parts.map((part) => base + part));
      for (let prop of props) {
        assert.strictEqual(style[prop], '');
        style[prop] = '10px';
        assert.strictEqual(style[prop], '10px');
        style[prop] = nullValue;
        assert.strictEqual(style[prop], '');
      }
    }

    testParts('margin', '');
    testParts('margin', null);
    testParts('padding', '');
    testParts('padding', null);
  });

  it('setting undefined to a padding or margin does nothing', () => {
    var style = new CSSStyleDeclaration();
    var parts = ['Top', 'Right', 'Bottom', 'Left'];
    function testParts(base) {
      var props = [base].concat(parts.map((part) => base + part));
      for (let prop of props) {
        style[prop] = '10px';
        assert.strictEqual(style[prop], '10px');
        style[prop] = undefined;
        assert.strictEqual(style[prop], '10px');
      }
    }

    testParts('margin');
    testParts('padding');
  });

  it('setting null to background works', () => {
    var style = new CSSStyleDeclaration();
    style.background = 'red';
    assert.strictEqual(style.cssText, 'background: red;');
    style.background = null;
    assert.strictEqual(style.cssText, '');
  });

  it('flex properties should keep their values', () => {
    var style = new CSSStyleDeclaration();
    style.flexDirection = 'column';
    assert.strictEqual(style.cssText, 'flex-direction: column;');
    style.flexDirection = 'row';
    assert.strictEqual(style.cssText, 'flex-direction: row;');
  });

  it('camelcase properties are not assigned with `.setproperty()`', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('fontSize', '12px');
    assert.strictEqual(style.cssText, '');
  });

  it('casing is ignored in `.setproperty()`', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('FoNt-SiZe', '12px');
    assert.strictEqual(style.fontSize, '12px');
    assert.strictEqual(style.getPropertyValue('font-size'), '12px');
  });

  it('support non string entries in border-spacing', () => {
    var style = new CSSStyleDeclaration();
    style.borderSpacing = 0;
    assert.strictEqual(style.cssText, 'border-spacing: 0px;');
  });

  it('float should be valid property for `.setproperty()`', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('float', 'left');
    assert.strictEqual(style.float, 'left');
    assert.strictEqual(style.getPropertyValue('float'), 'left');
  });

  it('flex-shrink works', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('flex-shrink', 0);
    assert.strictEqual(style.getPropertyValue('flex-shrink'), '0');
    style.setProperty('flex-shrink', 1);
    assert.strictEqual(style.getPropertyValue('flex-shrink'), '1');
    assert.strictEqual(style.cssText, 'flex-shrink: 1;');
  });

  it('flex-grow works', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('flex-grow', 2);
    assert.strictEqual(style.getPropertyValue('flex-grow'), '2');
    assert.strictEqual(style.cssText, 'flex-grow: 2;');
  });

  it('flex-basis works', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('flex-basis', 0);
    assert.strictEqual(style.getPropertyValue('flex-basis'), '0px');
    style.setProperty('flex-basis', '250px');
    assert.strictEqual(style.getPropertyValue('flex-basis'), '250px');
    style.setProperty('flex-basis', '10em');
    assert.strictEqual(style.getPropertyValue('flex-basis'), '10em');
    style.setProperty('flex-basis', '30%');
    assert.strictEqual(style.getPropertyValue('flex-basis'), '30%');
    assert.strictEqual(style.cssText, 'flex-basis: 30%;');
  });

  it('shorthand flex works', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('flex', 'none');
    assert.strictEqual(style.getPropertyValue('flex-grow'), '0');
    assert.strictEqual(style.getPropertyValue('flex-shrink'), '0');
    assert.strictEqual(style.getPropertyValue('flex-basis'), 'auto');
    style.removeProperty('flex');
    style.removeProperty('flex-basis');
    style.setProperty('flex', 'auto');
    assert.strictEqual(style.getPropertyValue('flex-grow'), '');
    assert.strictEqual(style.getPropertyValue('flex-shrink'), '');
    assert.strictEqual(style.getPropertyValue('flex-basis'), 'auto');
    style.removeProperty('flex');
    style.setProperty('flex', '0 1 250px');
    assert.strictEqual(style.getPropertyValue('flex'), '0 1 250px');
    assert.strictEqual(style.getPropertyValue('flex-grow'), '0');
    assert.strictEqual(style.getPropertyValue('flex-shrink'), '1');
    assert.strictEqual(style.getPropertyValue('flex-basis'), '250px');
    style.removeProperty('flex');
    style.setProperty('flex', '2');
    assert.strictEqual(style.getPropertyValue('flex-grow'), '2');
    assert.strictEqual(style.getPropertyValue('flex-shrink'), '');
    assert.strictEqual(style.getPropertyValue('flex-basis'), '');
    style.removeProperty('flex');
    style.setProperty('flex', '20%');
    assert.strictEqual(style.getPropertyValue('flex-grow'), '');
    assert.strictEqual(style.getPropertyValue('flex-shrink'), '');
    assert.strictEqual(style.getPropertyValue('flex-basis'), '20%');
    style.removeProperty('flex');
    style.setProperty('flex', '2 2');
    assert.strictEqual(style.getPropertyValue('flex-grow'), '2');
    assert.strictEqual(style.getPropertyValue('flex-shrink'), '2');
    assert.strictEqual(style.getPropertyValue('flex-basis'), '');
    style.removeProperty('flex');
  });

  it('font-size get a valid value', () => {
    var style = new CSSStyleDeclaration();
    const invalidValue = '1r5px';
    style.cssText = 'font-size: 15px';
    assert.strictEqual(1, style.length);
    style.cssText = `font-size: ${invalidValue}`;
    assert.strictEqual(0, style.length);
    assert.strictEqual(undefined, style[0]);
  });

  it('getPropertyValue for custom properties in cssText', () => {
    const style = new CSSStyleDeclaration();
    style.cssText = '--foo: red';

    assert.strictEqual(style.getPropertyValue('--foo'), 'red');
  });

  it('getPropertyValue for custom properties with setProperty', () => {
    const style = new CSSStyleDeclaration();
    style.setProperty('--bar', 'blue');

    assert.strictEqual(style.getPropertyValue('--bar'), 'blue');
  });

  it('getPropertyValue for custom properties with object setter', () => {
    const style = new CSSStyleDeclaration();
    style['--baz'] = 'yellow';

    assert.strictEqual(style.getPropertyValue('--baz'), '');
  });

  it('custom properties are case-sensitive', () => {
    const style = new CSSStyleDeclaration();
    style.cssText = '--fOo: purple';

    assert.strictEqual(style.getPropertyValue('--foo'), '');
    assert.strictEqual(style.getPropertyValue('--fOo'), 'purple');
  });

  for (const property of [
    'width',
    'height',
    'margin',
    'margin-top',
    'bottom',
    'right',
    'padding',
  ]) {
    it(`supports calc for ${property}`, () => {
      const style = new CSSStyleDeclaration();
      style.setProperty(property, 'calc(100% - 100px)');
      assert.strictEqual(style.getPropertyValue(property), 'calc(100% - 100px)');
    });
  }
});
