'use strict';

var CSSStyleDeclaration = require('../index.js');

const { cssPropertyToIDLAttribute } = require('./parsers.js');
const implementedProperties = require('./implementedProperties.js');
const supportedProperties = require('./supportedProperties.js');
const webkitProperties = require('./webkitProperties.js');

if (typeof BigInt === 'undefined') {
  var BigInt = Number;
}

describe('CSSStyleDeclaration', () => {
  test('has only valid properties implemented', () => {
    const invalidProperties = [];
    implementedProperties.forEach(property => {
      if (!supportedProperties.has(property)) {
        invalidProperties.push(property);
      }
    });
    expect(invalidProperties).toEqual([]);
  });

  test('has all properties', () => {
    const style = new CSSStyleDeclaration();
    supportedProperties.forEach(property => {
      expect(style.__lookupGetter__(property)).toBeTruthy();
      expect(style.__lookupSetter__(property)).toBeTruthy();
    });
  });

  test('has all properties as IDL attributes', () => {
    const style = new CSSStyleDeclaration();
    supportedProperties.forEach(property => {
      const attribute = cssPropertyToIDLAttribute(property);
      expect(style.__lookupGetter__(attribute)).toBeTruthy();
      expect(style.__lookupSetter__(attribute)).toBeTruthy();
    });
  });

  test('has all webkit prefixed properties as pascal cased attributes', () => {
    const style = new CSSStyleDeclaration();
    webkitProperties.forEach(property => {
      const attribute = cssPropertyToIDLAttribute(property, true);
      expect(style.__lookupGetter__(attribute)).toBeTruthy();
      expect(style.__lookupSetter__(attribute)).toBeTruthy();
    });
  });

  test('has all functions', () => {
    var style = new CSSStyleDeclaration();

    expect(typeof style.item).toBe('function');
    expect(typeof style.getPropertyValue).toBe('function');
    expect(typeof style.setProperty).toBe('function');
    expect(typeof style.getPropertyPriority).toBe('function');
    expect(typeof style.removeProperty).toBe('function');
  });

  test('has special properties', () => {
    var style = new CSSStyleDeclaration();

    expect(style.__lookupGetter__('cssText')).toBeTruthy();
    expect(style.__lookupSetter__('cssText')).toBeTruthy();
    expect(style.__lookupGetter__('length')).toBeTruthy();
    expect(style.__lookupGetter__('parentRule')).toBeTruthy();
  });

  test('from style string', () => {
    var style = new CSSStyleDeclaration();
    style.cssText = 'color: blue; background-color: red; width: 78%; height: 50vh;';
    expect(style.length).toBe(4);
    expect(style.cssText).toBe('color: blue; background-color: red; width: 78%; height: 50vh;');
    expect(style.getPropertyValue('color')).toBe('blue');
    expect(style.item(0)).toBe('color');
    expect(style[1]).toBe('background-color');
    expect(style.backgroundColor).toBe('red');
    style.cssText = '';
    expect(style.cssText).toBe('');
    expect(style.length).toBe(0);
  });

  test('from properties', () => {
    var style = new CSSStyleDeclaration();
    style.color = 'blue';
    expect(style.length).toBe(1);
    expect(style[0]).toBe('color');
    expect(style.cssText).toBe('color: blue;');
    expect(style.item(0)).toBe('color');
    expect(style.color).toBe('blue');
    style.backgroundColor = 'red';
    expect(style.length).toBe(2);
    expect(style[0]).toBe('color');
    expect(style[1]).toBe('background-color');
    expect(style.cssText).toBe('color: blue; background-color: red;');
    expect(style.backgroundColor).toBe('red');
    style.removeProperty('color');
    expect(style[0]).toBe('background-color');
  });

  test('shorthand properties with embedded spaces', () => {
    var style = new CSSStyleDeclaration();
    style.background = 'rgb(0, 0, 0) url(/something/somewhere.jpg)';
    expect(style.backgroundColor).toBe('rgb(0, 0, 0)');
    expect(style.backgroundImage).toBe('url("/something/somewhere.jpg")');
    expect(style.cssText).toBe('background: rgb(0, 0, 0) url("/something/somewhere.jpg");');
    style = new CSSStyleDeclaration();
    style.border = '  1px  solid   black  ';
    expect(style.border).toBe('1px solid black');
  });

  test('setting shorthand properties to an empty string should clear all dependent properties', () => {
    var style = new CSSStyleDeclaration();
    style.borderWidth = '1px';
    expect(style.cssText).toBe('border-width: 1px;');
    style.border = '';
    expect(style.cssText).toBe('');
  });

  test('setting implicit properties to an empty string should clear all dependent properties', () => {
    var style = new CSSStyleDeclaration();
    style.borderTopWidth = '1px';
    expect(style.cssText).toBe('border-top-width: 1px;');
    style.borderWidth = '';
    expect(style.cssText).toBe('');
  });

  test('setting a shorthand property, whose shorthands are implicit properties, to an empty string should clear all dependent properties', () => {
    var style = new CSSStyleDeclaration();
    style.borderTopWidth = '1px';
    expect(style.cssText).toBe('border-top-width: 1px;');
    style.border = '';
    expect(style.cssText).toBe('');
    style.borderTop = '1px solid black';
    expect(style.cssText).toBe('border-top: 1px solid black;');
    style.border = '';
    expect(style.cssText).toBe('');
  });

  test('setting values implicit and shorthand properties via csstext and setproperty should propagate to dependent properties', () => {
    var style = new CSSStyleDeclaration();
    style.cssText = 'border: 1px solid black;';
    expect(style.cssText).toBe('border: 1px solid black;');
    expect(style.borderTop).toBe('1px solid black');
    style.border = '';
    expect(style.cssText).toBe('');
    style.setProperty('border', '1px solid black');
    expect(style.cssText).toBe('border: 1px solid black;');
  });

  test('setting a property with a value that can not be converted to string should throw an error', () => {
    const style = new CSSStyleDeclaration();

    expect(() => (style.opacity = Symbol('0'))).toThrow(
      "Failed to set the 'opacity' property on 'CSSStyleDeclaration': The provided value is a symbol, which cannot be converted to a string."
    );
    expect(() => (style.opacity = { toString: () => [0] })).toThrow(
      'Cannot convert object to primitive value'
    );
  });

  test('setting a property with a value that can be converted to string should work', () => {
    const style = new CSSStyleDeclaration();

    // Property with custom setter
    style.borderStyle = { toString: () => 'solid' };
    expect(style.borderStyle).toBe('solid');

    // Property with default setter
    style.opacity = 1;
    expect(style.opacity).toBe('1');
    style.opacity = { toString: () => '0' };
    expect(style.opacity).toBe('0');

    style.opacity = { toString: () => 1 };
    expect(style.opacity).toBe('1');

    style.opacity = BigInt(0);
    expect(style.opacity).toBe('0');
    style.opacity = { toString: () => BigInt(1) };
    expect(style.opacity).toBe('1');

    style.setProperty('--custom', [0]);
    expect(style.getPropertyValue('--custom')).toBe('0');

    style.setProperty('--custom', null);
    expect(style.getPropertyValue('--custom')).toBe('');
    style.setProperty('--custom', { toString: () => null });
    expect(style.getPropertyValue('--custom')).toBe('null');

    style.setProperty('--custom', undefined);
    expect(style.getPropertyValue('--custom')).toBe('undefined');
    style.setProperty('--custom', null);
    style.setProperty('--custom', { toString: () => undefined });
    expect(style.getPropertyValue('--custom')).toBe('undefined');

    style.setProperty('--custom', false);
    expect(style.getPropertyValue('--custom')).toBe('false');
    style.setProperty('--custom', { toString: () => true });
    expect(style.getPropertyValue('--custom')).toBe('true');
  });

  test('onchange callback should be called when the csstext changes', () => {
    var style = new CSSStyleDeclaration(function(cssText) {
      expect(cssText).toBe('opacity: 0;');
    });
    style.setProperty('opacity', 0);
  });

  test('setting improper css to csstext should not throw', () => {
    var style = new CSSStyleDeclaration();
    style.cssText = 'color: ';
    expect(style.cssText).toBe('');
    style.color = 'black';
    style.cssText = 'float: ';
    expect(style.cssText).toBe('');
  });

  test('camelcase properties are not assigned with `.setproperty()`', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('fontSize', '12px');
    expect(style.cssText).toBe('');
  });

  test('casing is ignored in `.setproperty()`', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('FoNt-SiZe', '12px');
    expect(style.fontSize).toBe('12px');
    expect(style.getPropertyValue('font-size')).toBe('12px');
  });

  test('getPropertyValue for custom properties in cssText', () => {
    const style = new CSSStyleDeclaration();
    style.cssText = '--foo: red';

    expect(style.getPropertyValue('--foo')).toBe('red');
  });

  test('getPropertyValue for custom properties with setProperty', () => {
    const style = new CSSStyleDeclaration();
    style.setProperty('--bar', 'blue');

    expect(style.getPropertyValue('--bar')).toBe('blue');
  });

  test('getPropertyValue for custom properties with object setter', () => {
    const style = new CSSStyleDeclaration();
    style['--baz'] = 'yellow';

    expect(style.getPropertyValue('--baz')).toBe('');
  });

  test('custom properties are case-sensitive', () => {
    const style = new CSSStyleDeclaration();
    style.cssText = '--fOo: purple';

    expect(style.getPropertyValue('--foo')).toBe('');
    expect(style.getPropertyValue('--fOo')).toBe('purple');
  });

  // Can be removed (already covered by parsers.test.js)

  test('colors', () => {
    var style = new CSSStyleDeclaration();
    style.color = 'rgba(0,0,0,0)';
    expect(style.color).toBe('rgba(0, 0, 0, 0)');
    style.color = 'rgba(5%, 10%, 20%, 0.4)';
    expect(style.color).toBe('rgba(13, 26, 51, 0.4)');
    style.color = 'rgb(33%, 34%, 33%)';
    expect(style.color).toBe('rgb(84, 87, 84)');
    style.color = 'rgba(300, 200, 100, 1.5)';
    expect(style.color).toBe('rgb(255, 200, 100)');
    style.color = 'hsla(0, 1%, 2%, 0.5)';
    expect(style.color).toBe('rgba(5, 5, 5, 0.5)');
    style.color = 'hsl(0, 1%, 2%)';
    expect(style.color).toBe('rgb(5, 5, 5)');
    style.color = 'rebeccapurple';
    expect(style.color).toBe('rebeccapurple');
    style.color = 'transparent';
    expect(style.color).toBe('transparent');
    style.color = 'currentcolor';
    expect(style.color).toBe('currentcolor');
    style.color = '#ffffffff';
    expect(style.color).toBe('rgb(255, 255, 255)');
    style.color = '#fffa';
    expect(style.color).toBe('rgba(255, 255, 255, 0.667)');
    style.color = '#ffffff66';
    expect(style.color).toBe('rgba(255, 255, 255, 0.4)');
  });

  test('setting border to 0 should be okay', () => {
    var style = new CSSStyleDeclaration();
    style.border = 0;
    expect(style.cssText).toBe('border: 0px;');
  });

  test('setting opacity should work', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('opacity', 0.75);
    expect(style.cssText).toBe('opacity: 0.75;');
    style.opacity = '0.50';
    expect(style.cssText).toBe('opacity: 0.5;');
    style.opacity = 1;
    expect(style.cssText).toBe('opacity: 1;');
  });

  test('setting a value to 0 should return the string value', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('fill-opacity', 0);
    expect(style.fillOpacity).toBe('0');
  });

  test('url parsing works with quotes', () => {
    var style = new CSSStyleDeclaration();
    style.backgroundImage = 'url(http://some/url/here1.png)';
    expect(style.backgroundImage).toBe('url("http://some/url/here1.png")');
    style.backgroundImage = "url('http://some/url/here2.png')";
    expect(style.backgroundImage).toBe('url("http://some/url/here2.png")');
    style.backgroundImage = 'url("http://some/url/here3.png")';
    expect(style.backgroundImage).toBe('url("http://some/url/here3.png")');
  });

  test('setting 0 to a padding or margin works', () => {
    var style = new CSSStyleDeclaration();
    style.padding = 0;
    expect(style.cssText).toBe('padding: 0px;');
    style.margin = '1em';
    style.marginTop = '0';
    expect(style.marginTop).toBe('0px');
  });

  test('setting ex units to a padding or margin works', () => {
    var style = new CSSStyleDeclaration();
    style.padding = '1ex';
    expect(style.cssText).toBe('padding: 1ex;');
    style.margin = '1em';
    style.marginTop = '0.5ex';
    expect(style.marginTop).toBe('0.5ex');
  });

  test('setting null to background works', () => {
    var style = new CSSStyleDeclaration();
    style.background = 'red';
    expect(style.cssText).toBe('background: red;');
    style.background = null;
    expect(style.cssText).toBe('');
  });

  test('support non string entries in border-spacing', () => {
    var style = new CSSStyleDeclaration();
    style.borderSpacing = 0;
    expect(style.cssText).toBe('border-spacing: 0px;');
  });
});

describe('properties', () => {
  describe('background', () => {
    test('invalid', () => {
      const style = new CSSStyleDeclaration();
      const invalid = [
        'black / cover', // <any> / <size>
        'left / repeat', // <position> / <any>
        'left / cover cover',
        'left / 100% 100% 100%',
        'left / 100% 100% cover',
        'black black',
        'repeat-x repeat-y',
      ];
      invalid.forEach(value => {
        style.background = value;
        expect(style.background).toBe('');
      });
    });
    test('valid', () => {
      const style = new CSSStyleDeclaration();
      const canonical =
        'red url("bg.jpg") no-repeat fixed left 10% / 100px 100% content-box padding-box';
      style.background = canonical;
      /* Chrome expect(style.background).toBe('url("bg.jpg") left 10% / 100px 100% no-repeat fixed content-box padding-box red)';*/
      /* Firefox */ expect(style.background).toBe(canonical);
      // Non canonical orders
      style.background =
        'url("bg.jpg") red fixed no-repeat content-box left 10% / 100px 100% padding-box';
      expect(style.background).toBe(canonical);
      style.background =
        'content-box padding-box left 10% / 100px 100% fixed no-repeat red url("bg.jpg")';
      expect(style.background).toBe(canonical);
      style.background =
        'left 10% / 100px 100% url("bg.jpg") content-box padding-box red no-repeat fixed';
      expect(style.background).toBe(canonical);
      // Single component
      style.background = 'center';
      /* Chrome */ expect(style.background).toBe('center center');
      /* Firefox expect(style.background).toBe('rgba(0, 0, 0, 0) none repeat scroll center center');*/
      // No whitespace(s) around separator for <position> and <size>
      style.background = 'left/cover';
      /* Chrome */ expect(style.background).toBe('left center / cover');
      style.background = 'center/ contain';
      /* Chrome */ expect(style.background).toBe('center center / contain');
      style.background = 'left /cover';
      /* Chrome */ expect(style.background).toBe('left center / cover');
      style.background = 'center/ 100% 100%';
      /* Chrome */ expect(style.background).toBe('center center / 100% 100%');
      style.background = 'left center /100% 100%';
      /* Chrome */ expect(style.background).toBe('left center / 100% 100%');
    });
    test('shorthand propagates to longhands', () => {
      const style = new CSSStyleDeclaration();
      style.background = 'blue url(http://www.example.com/some_img.jpg)';
      // CSS 3: <color> <image> <repeat>[ <repeat>]? <attachment> <position>[ <position>]? [/ <size>]? <clip> <origin>
      expect(style.length).toBe(8);
      expect(style.background).toBe('blue url("http://www.example.com/some_img.jpg")');
      expect(style.getPropertyValue('background')).toBe(
        'blue url("http://www.example.com/some_img.jpg")'
      );
      expect(style.cssText).toBe('background: blue url("http://www.example.com/some_img.jpg");');
      expect(style.backgroundColor).toBe('blue');
      expect(style.backgroundImage).toBe('url("http://www.example.com/some_img.jpg")');
      expect(style.backgroundRepeat).toBe('initial');
      expect(style.backgroundAttachment).toBe('initial');
      expect(style.backgroundPosition).toBe('initial');
      expect(style.backgroundSize).toBe('initial');
      expect(style.backgroundOrigin).toBe('initial');
      expect(style.backgroundClip).toBe('initial');
      // empty string
      style.background = '';
      expect(style.length).toBe(0);
      expect(style.background).toBe('');
      expect(style.getPropertyValue('background')).toBe('');
      expect(style.cssText).toBe('');
      expect(style.backgroundColor).toBe('');
      expect(style.backgroundImage).toBe('');
      expect(style.backgroundRepeat).toBe('');
      expect(style.backgroundAttachment).toBe('');
      expect(style.backgroundPosition).toBe('');
      expect(style.backgroundSize).toBe('');
      expect(style.backgroundOrigin).toBe('');
      expect(style.backgroundClip).toBe('');
      // CSS wide keywords
      style.background = 'inherit';
      expect(style.background).toBe('inherit');
      expect(style.getPropertyValue('background')).toBe('inherit');
      expect(style.cssText).toBe('background: inherit;');
      expect(style.backgroundColor).toBe('inherit');
      expect(style.backgroundImage).toBe('inherit');
      expect(style.backgroundRepeat).toBe('inherit');
      expect(style.backgroundAttachment).toBe('inherit');
      expect(style.backgroundPosition).toBe('inherit');
      expect(style.backgroundSize).toBe('inherit');
      expect(style.backgroundOrigin).toBe('inherit');
      expect(style.backgroundClip).toBe('inherit');
      style.backgroundColor = 'red';
      style.background = 'initial';
      expect(style.background).toBe('initial');
      expect(style.getPropertyValue('background')).toBe('initial');
      expect(style.cssText).toBe('background: initial;');
      expect(style.backgroundColor).toBe('initial');
      expect(style.backgroundImage).toBe('initial');
      expect(style.backgroundRepeat).toBe('initial');
      expect(style.backgroundAttachment).toBe('initial');
      expect(style.backgroundPosition).toBe('initial');
      expect(style.backgroundSize).toBe('initial');
      expect(style.backgroundOrigin).toBe('initial');
      expect(style.backgroundClip).toBe('initial');
    });
    test('longhand propagates to shorthand', () => {
      const style = new CSSStyleDeclaration();
      style.background = 'blue url(img.jpg)';
      style.backgroundColor = 'black';
      style.backgroundImage = 'url(img.jpg)';
      style.backgroundRepeat = 'repeat-x';
      style.backgroundAttachment = 'fixed';
      style.backgroundPosition = 'center';
      style.backgroundSize = 'cover';
      style.backgroundOrigin = 'content-box';
      style.backgroundClip = 'padding-box';
      expect(style.background).toBe(
        'black url("img.jpg") repeat-x fixed center center / cover content-box padding-box'
      );
    });
  });
  describe('background-color', () => {
    test.todo('invalid');
    test.todo('valid');
  });
  describe('background-image', () => {
    test.todo('invalid');
    test.todo('valid');
  });
  describe('background-position', () => {
    test.todo('invalid');
    test.todo('valid');
  });
  describe('background-size', () => {
    test('invalid', () => {
      const style = new CSSStyleDeclaration();
      const invalid = ['full', '100viewport', '100px cover', 'cover auto', 'cover contain'];
      invalid.forEach(value => {
        style.backgroundSize = value;
        expect(style.backgroundSize).toBe('');
      });
    });
    test('valid', () => {
      const style = new CSSStyleDeclaration();
      const valid = ['100px', '100px 100%', 'auto', 'cover', 'contain'];
      valid.forEach(value => {
        style.backgroundSize = value;
        expect(style.backgroundSize).toBe(value);
      });
    });
  });
  describe('background-repeat', () => {
    test.todo('invalid');
    test.todo('valid');
  });
  describe('background-attachment', () => {
    test.todo('invalid');
    test.todo('valid');
  });
  describe('background-origin and background-clip', () => {
    test('invalid', () => {
      const style = new CSSStyleDeclaration();
      const invalid = ['0', '0px', 'left left', 'margin-box', 'border-box border-box'];
      invalid.forEach(value => {
        style.backgroundOrigin = value;
        expect(style.backgroundOrigin).toBe('');
      });
    });
    test('valid', () => {
      const style = new CSSStyleDeclaration();
      const valid = ['border-box', 'content-box', 'padding-box'];
      valid.forEach(value => {
        style.backgroundOrigin = value;
        expect(style.backgroundOrigin).toBe(value);
      });
    });
  });
  describe('border', () => {
    test('shorthand propagates to longhands', () => {
      const style = new CSSStyleDeclaration();
      style.border = '1px solid black';
      expect(style.length).toBe(12); // longhands of border-image are missing (total should be 17)
      expect(style.border).toBe('1px solid black');
      expect(style.getPropertyValue('border')).toBe('1px solid black');
      expect(style.cssText).toBe('border: 1px solid black;');
      expect(style.borderWidth).toBe('1px');
      expect(style.borderStyle).toBe('solid');
      expect(style.borderColor).toBe('black');
      expect(style.borderRight).toBe('1px solid black');
      expect(style.borderTopWidth).toBe('1px');
      expect(style.borderLeftStyle).toBe('solid');
      expect(style.borderBottomColor).toBe('black');
      // empty string
      style.border = '';
      expect(style.length).toBe(0);
      expect(style.border).toBe('');
      expect(style.getPropertyValue('border')).toBe('');
      expect(style.cssText).toBe('');
      expect(style.borderWidth).toBe('');
      expect(style.borderStyle).toBe('');
      expect(style.borderColor).toBe('');
      expect(style.borderRight).toBe('');
      expect(style.borderTopWidth).toBe('');
      expect(style.borderLeftStyle).toBe('');
      expect(style.borderBottomColor).toBe('');
      // CSS wide keyword
      style.border = 'inherit';
      expect(style.length).toBe(12); // longhands of border-image are missing (total should be 17)
      expect(style.border).toBe('inherit');
      expect(style.getPropertyValue('border')).toBe('inherit');
      expect(style.cssText).toBe('border: inherit;');
      expect(style.borderWidth).toBe('inherit');
      expect(style.borderStyle).toBe('inherit');
      expect(style.borderColor).toBe('inherit');
      expect(style.borderRight).toBe('inherit');
      expect(style.borderTopWidth).toBe('inherit');
      expect(style.borderLeftStyle).toBe('inherit');
      expect(style.borderBottomColor).toBe('inherit');
      style.border = 'initial';
      expect(style.length).toBe(12); // longhands of border-image are missing (total should be 17)
      expect(style.border).toBe('initial');
      expect(style.getPropertyValue('border')).toBe('initial');
      expect(style.cssText).toBe('border: initial;');
      expect(style.borderWidth).toBe('initial');
      expect(style.borderStyle).toBe('initial');
      expect(style.borderColor).toBe('initial');
      expect(style.borderRight).toBe('initial');
      expect(style.borderTopWidth).toBe('initial');
      expect(style.borderLeftStyle).toBe('initial');
      expect(style.borderBottomColor).toBe('initial');
      // none
      style.border = 'none';
      expect(style.length).toBe(12); // longhands of border-image are missing (total should be 17)
      expect(style.border).toBe('none');
      expect(style.cssText).toBe('border: none;');
      expect(style.getPropertyValue('border')).toBe('none');
      expect(style.borderWidth).toBe('initial');
      expect(style.borderStyle).toBe('none');
      expect(style.borderColor).toBe('initial');
      expect(style.borderRight).toBe('none');
      expect(style.borderTopWidth).toBe('initial');
      expect(style.borderLeftStyle).toBe('none');
      expect(style.borderBottomColor).toBe('initial');
    });
    test('longhand propagates to shorthand', () => {
      const style = new CSSStyleDeclaration();
      style.border = '1px solid black';
      // border-width
      style.borderWidth = '2px';
      expect(style.border).toBe('2px solid black');
      expect(style.getPropertyValue('border')).toBe('2px solid black');
      expect(style.cssText).toBe('border: 2px solid black;');
      // border-style
      style.borderStyle = 'inherit';
      expect(style.border).toBe('');
      expect(style.getPropertyValue('border')).toBe('');
      expect(style.cssText).toBe('border-width: 2px; border-style: inherit; border-color: black;'); // + border-image: initial;
      style.border = '1px solid black';
      style.borderStyle = 'none';
      expect(style.border).toBe('1px none black');
      expect(style.getPropertyValue('border')).toBe('1px none black');
      expect(style.cssText).toBe('border: 1px none black;');
      // border-color
      style.border = '1px solid black';
      style.borderColor = 'red';
      expect(style.border).toBe('1px solid red');
      expect(style.getPropertyValue('border')).toBe('1px solid red');
      expect(style.cssText).toBe('border: 1px solid red;');
      // border-bottom, border-left, border-right, border-top
      style.borderTop = '2px';
      expect(style.border).toBe('');
      expect(style.getPropertyValue('border')).toBe('');
      expect(style.cssText).toBe(
        'border-width: 2px 1px 1px; border-top-style: initial; border-right-style: solid; border-bottom-style: solid; border-left-style: solid; border-top-color: initial; border-right-color: red; border-bottom-color: red; border-left-color: red;' // + border-image: initial;
      );
    });
  });
  describe('border-bottom, border-left, border-right, border-top', () => {
    test('shorthand propagates to longhands', () => {
      const style = new CSSStyleDeclaration();
      style.borderTop = '1px solid black';
      expect(style.borderTop).toBe('1px solid black');
      expect(style.getPropertyValue('border-top')).toBe('1px solid black');
      expect(style.cssText).toBe('border-top: 1px solid black;');
      expect(style.borderTopWidth).toBe('1px');
      expect(style.borderTopStyle).toBe('solid');
      expect(style.borderTopColor).toBe('black');
      // empty string
      style.borderTop = '';
      expect(style.borderTop).toBe('');
      expect(style.getPropertyValue('border-top')).toBe('');
      expect(style.cssText).toBe('');
      expect(style.borderTopWidth).toBe('');
      expect(style.borderTopStyle).toBe('');
      expect(style.borderTopColor).toBe('');
      // CSS wide keywords
      style.borderTop = 'inherit';
      expect(style.borderTop).toBe('inherit');
      expect(style.getPropertyValue('border-top')).toBe('inherit');
      expect(style.cssText).toBe('border-top: inherit;');
      expect(style.borderTopWidth).toBe('inherit');
      expect(style.borderTopStyle).toBe('inherit');
      expect(style.borderTopColor).toBe('inherit');
      style.borderTop = 'initial';
      expect(style.borderTop).toBe('initial');
      expect(style.getPropertyValue('border-top')).toBe('initial');
      expect(style.cssText).toBe('border-top: initial;');
      expect(style.borderTopWidth).toBe('initial');
      expect(style.borderTopStyle).toBe('initial');
      expect(style.borderTopColor).toBe('initial');
      // none
      style.borderTop = 'none';
      expect(style.borderTop).toBe('none');
      expect(style.cssText).toBe('border-top: none;');
      expect(style.getPropertyValue('border-top')).toBe('none');
      expect(style.borderTopWidth).toBe('initial');
      expect(style.borderTopStyle).toBe('none');
      expect(style.borderTopColor).toBe('initial');
    });
    test('longhand propagates to shorthand', () => {
      const style = new CSSStyleDeclaration();
      style.borderTop = '1px solid black';
      // border-<side>-width
      style.borderTopWidth = '2px';
      expect(style.borderTop).toBe('2px solid black');
      expect(style.getPropertyValue('border-top')).toBe('2px solid black');
      expect(style.cssText).toBe('border-top: 2px solid black;');
      // border-<side>-style
      style.borderTopStyle = 'inherit';
      expect(style.borderTop).toBe('');
      expect(style.getPropertyValue('border-top')).toBe('');
      expect(style.cssText).toBe(
        'border-top-width: 2px; border-top-style: inherit; border-top-color: black;'
      );
      style.borderTop = '1px solid black';
      style.borderTopStyle = 'none';
      expect(style.borderTop).toBe('1px none black');
      expect(style.getPropertyValue('border-top')).toBe('1px none black');
      expect(style.cssText).toBe('border-top: 1px none black;');
      // border-<side>-color
      style.borderTop = '1px solid black';
      style.borderTopColor = 'red';
      expect(style.borderTop).toBe('1px solid red');
      expect(style.getPropertyValue('border-top')).toBe('1px solid red');
      expect(style.cssText).toBe('border-top: 1px solid red;');
    });
  });
  describe('border-color', () => {
    test('shorthand propagates to longhands', () => {
      const style = new CSSStyleDeclaration();
      style.borderColor = 'black';
      expect(style.borderTopColor).toBe('black');
    });
    test('longhand propagates to shorthand', () => {
      const style = new CSSStyleDeclaration();
      style.borderColor = 'black';
      style.borderTopColor = 'red';
      expect(style.borderColor).toBe('red black black');
    });
  });
  describe('border-radius', () => {
    test('shorthand propagates to longhands', () => {
      const style = new CSSStyleDeclaration();
      style.borderRadius = '1px';
      expect(style.borderRadius).toBe('1px');
      expect(style.borderTopLeftRadius).toBe('1px');
      expect(style.borderTopRightRadius).toBe('1px');
      expect(style.borderBottomRightRadius).toBe('1px');
      expect(style.borderBottomLeftRadius).toBe('1px');
      style.borderRadius = '1px / 2px';
      expect(style.borderRadius).toBe('1px / 2px');
      expect(style.borderTopLeftRadius).toBe('1px 2px');
      expect(style.borderTopRightRadius).toBe('1px 2px');
      expect(style.borderBottomRightRadius).toBe('1px 2px');
      expect(style.borderBottomLeftRadius).toBe('1px 2px');
      style.borderRadius = '1px 2px 3px 4px / 1px 2px';
      expect(style.borderRadius).toBe('1px 2px 3px 4px / 1px 2px');
      expect(style.borderTopLeftRadius).toBe('1px');
      expect(style.borderTopRightRadius).toBe('2px');
      expect(style.borderBottomRightRadius).toBe('3px 1px');
      expect(style.borderBottomLeftRadius).toBe('4px 2px');
    });
    test('longhand propagates to shorthand', () => {
      const style = new CSSStyleDeclaration();
      style.borderRadius = '1px 2px 3px 4px / 1px 2px';
      style.borderBottomLeftRadius = '2px 1px';
      expect(style.borderRadius).toBe('1px 2px 3px / 1px 2px 1px 1px');
    });
  });
  describe('border-style', () => {
    test('shorthand propagates to longhands', () => {
      const style = new CSSStyleDeclaration();
      style.borderStyle = 'dashed';
      expect(style.borderTopStyle).toBe('dashed');
    });
    test('longhand propagates to shorthand', () => {
      const style = new CSSStyleDeclaration();
      style.borderStyle = 'solid';
      style.borderTopStyle = 'dashed';
      expect(style.borderStyle).toBe('dashed solid solid');
    });
  });
  describe('border-width', () => {
    test('shorthand propagates to longhands', () => {
      const style = new CSSStyleDeclaration();
      style.borderWidth = 0;
      expect(style.borderTopWidth).toBe('0px');
    });
    test('longhand propagates to shorthand', () => {
      const style = new CSSStyleDeclaration();
      style.borderWidth = '1px';
      style.borderTopWidth = '2px';
      expect(style.borderWidth).toBe('2px 1px 1px');
    });
  });
  describe('bottom, left, right, top', () => {
    test('valid', () => {
      const style = new CSSStyleDeclaration();
      style.top = 0;
      style.left = '0%';
      style.right = '5em';
      style.bottom = '12pt';
      expect(style.top).toBe('0px');
      expect(style.left).toBe('0%');
      expect(style.right).toBe('5em');
      expect(style.bottom).toBe('12pt');
      expect(style.length).toBe(4);
      expect(style.cssText).toBe('top: 0px; left: 0%; right: 5em; bottom: 12pt;');
    });
  });
  describe('clear', () => {
    test('valid and invalid', () => {
      const style = new CSSStyleDeclaration();
      style.clear = 'none';
      expect(style.clear).toBe('none');
      style.clear = 'lfet';
      expect(style.clear).toBe('none');
      style.clear = 'left';
      expect(style.clear).toBe('left');
      style.clear = 'right';
      expect(style.clear).toBe('right');
      style.clear = 'both';
      expect(style.clear).toBe('both');
      expect(style.length).toBe(1);
      expect(style.cssText).toBe('clear: both;');
    });
  });
  describe('clip', () => {
    test('valid and invalid', () => {
      const style = new CSSStyleDeclaration();
      style.clip = 'elipse(5px, 10px)';
      expect(style.clip).toBe('');
      expect(style.length).toBe(0);
      style.clip = 'rect(0, 3Em, 2pt, 50%)';
      expect(style.clip).toBe('rect(0px, 3em, 2pt, 50%)');
      expect(style.cssText).toBe('clip: rect(0px, 3em, 2pt, 50%);');
      expect(style.length).toBe(1);
    });
    test('calc()', () => {
      const style = new CSSStyleDeclaration();
      style.clip = 'rect(calc(5px + 5px) calc(20px - 10px) calc(5px * 2) calc(20px / 2))';
      expect(style.clip).toBe('rect(calc(10px), calc(10px), calc(10px), calc(10px))');
    });
  });
  describe('clip-path', () => {
    test('basic shape and geometry box in any order', () => {
      const style = new CSSStyleDeclaration();
      const valid = [
        ['fill-box circle()', 'circle(at center center) fill-box'],
        ['circle() fill-box', 'circle(at center center) fill-box'],
      ];
      valid.forEach(([input, expected = input]) => {
        style.clipPath = input;
        expect(style.clipPath).toBe(expected);
      });
    });
  });
  describe('flex', () => {
    test('shorthand propagates to longhands', () => {
      const style = new CSSStyleDeclaration();
      style.setProperty('flex', 'none');
      expect(style.getPropertyValue('flex-grow')).toBe('0');
      expect(style.getPropertyValue('flex-shrink')).toBe('0');
      expect(style.getPropertyValue('flex-basis')).toBe('auto');
      style.removeProperty('flex');
      style.removeProperty('flex-basis');
      style.setProperty('flex', 'auto');
      expect(style.getPropertyValue('flex-grow')).toBe('1');
      expect(style.getPropertyValue('flex-shrink')).toBe('1');
      expect(style.getPropertyValue('flex-basis')).toBe('auto');
      style.removeProperty('flex');
      style.setProperty('flex', '0 1 250px');
      expect(style.getPropertyValue('flex')).toBe('0 1 250px');
      expect(style.getPropertyValue('flex-grow')).toBe('0');
      expect(style.getPropertyValue('flex-shrink')).toBe('1');
      expect(style.getPropertyValue('flex-basis')).toBe('250px');
      style.removeProperty('flex');
      style.setProperty('flex', '2');
      expect(style.getPropertyValue('flex-grow')).toBe('2');
      expect(style.getPropertyValue('flex-shrink')).toBe('1');
      expect(style.getPropertyValue('flex-basis')).toBe('0%');
      style.removeProperty('flex');
      style.setProperty('flex', '20%');
      expect(style.getPropertyValue('flex-grow')).toBe('1');
      expect(style.getPropertyValue('flex-shrink')).toBe('1');
      expect(style.getPropertyValue('flex-basis')).toBe('20%');
      style.removeProperty('flex');
      style.setProperty('flex', '2 2');
      expect(style.getPropertyValue('flex-grow')).toBe('2');
      expect(style.getPropertyValue('flex-shrink')).toBe('2');
      expect(style.getPropertyValue('flex-basis')).toBe('0%');
    });
  });
  describe('flex-basis', () => {
    test('valid', () => {
      const style = new CSSStyleDeclaration();
      style.setProperty('flex-basis', 0);
      expect(style.getPropertyValue('flex-basis')).toBe('0px');
      style.setProperty('flex-basis', '250px');
      expect(style.getPropertyValue('flex-basis')).toBe('250px');
      style.setProperty('flex-basis', '10em');
      expect(style.getPropertyValue('flex-basis')).toBe('10em');
      style.setProperty('flex-basis', '30%');
      expect(style.getPropertyValue('flex-basis')).toBe('30%');
      expect(style.cssText).toBe('flex-basis: 30%;');
    });
  });
  describe('flex-direction', () => {
    test('valid', () => {
      const style = new CSSStyleDeclaration();
      style.flexDirection = 'column';
      expect(style.cssText).toBe('flex-direction: column;');
      style.flexDirection = 'row';
      expect(style.cssText).toBe('flex-direction: row;');
    });
  });
  describe('flex-grow', () => {
    test('valid', () => {
      const style = new CSSStyleDeclaration();
      style.setProperty('flex-grow', 2);
      expect(style.getPropertyValue('flex-grow')).toBe('2');
      expect(style.cssText).toBe('flex-grow: 2;');
    });
  });
  describe('flex-shrink', () => {
    test('valid', () => {
      const style = new CSSStyleDeclaration();
      style.setProperty('flex-shrink', 0);
      expect(style.getPropertyValue('flex-shrink')).toBe('0');
      style.setProperty('flex-shrink', 1);
      expect(style.getPropertyValue('flex-shrink')).toBe('1');
      expect(style.cssText).toBe('flex-shrink: 1;');
    });
  });
  describe('float', () => {
    test('mirrors cssfloat', () => {
      const style = new CSSStyleDeclaration();
      style.float = 'left';
      expect(style.cssFloat).toBe('left');
    });
    test('with setproperty()', () => {
      const style = new CSSStyleDeclaration();
      style.setProperty('float', 'left');
      expect(style.float).toBe('left');
      expect(style.getPropertyValue('float')).toBe('left');
    });
  });
  describe('font', () => {
    test('shorthand propagates to longhands', () => {
      const style = new CSSStyleDeclaration();
      style.font = '12em monospace';
      expect(style.fontSize).toBe('12em');
      expect(style.fontFamily).toBe('monospace');
    });
  });
  describe('font-size', () => {
    test('valid and invalid', () => {
      const style = new CSSStyleDeclaration();
      const invalidValue = '1r5px';
      style.cssText = 'font-size: 15px';
      expect(1).toBe(style.length);
      style.cssText = `font-size: ${invalidValue}`;
      expect(0).toBe(style.length);
      expect(undefined).toBe(style[0]);
    });
  });
  describe('height, width', () => {
    test('valid', () => {
      const style = new CSSStyleDeclaration();
      style.height = 6;
      expect(style.height).toBe('');
      style.width = 0;
      expect(style.width).toBe('0px');
      style.height = '34%';
      expect(style.height).toBe('34%');
      style.height = '100vh';
      expect(style.height).toBe('100vh');
      style.height = '100vw';
      expect(style.height).toBe('100vw');
      style.height = '';
      expect(1).toBe(style.length);
      expect(style.cssText).toBe('width: 0px;');
      style.width = null;
      expect(0).toBe(style.length);
      expect(style.cssText).toBe('');
      style.width = 'auto';
      expect(style.cssText).toBe('width: auto;');
      expect(style.width).toBe('auto');
      style.height = 'auto';
      expect(style.height).toBe('auto');
      expect(style.cssText).toBe('width: auto; height: auto;');
    });
  });
  describe('margin', () => {
    test('shorthand propagates to longhands', () => {
      const style = new CSSStyleDeclaration();
      const parts = ['Top', 'Right', 'Bottom', 'Left'];
      function testParts(v, V) {
        style.margin = v;
        for (let i = 0; i < 4; i++) {
          expect(style['margin' + parts[i]]).toBe(V[i]);
        }
        expect(style.margin).toBe(v);
        style.margin = '';
      }
      testParts('1px', ['1px', '1px', '1px', '1px']);
      testParts('1px auto', ['1px', 'auto', '1px', 'auto']);
      testParts('1px 2% 3px', ['1px', '2%', '3px', '2%']);
      testParts('1px 2px 3px 4px', ['1px', '2px', '3px', '4px']);
      style.marginTop = style.marginRight = style.marginBottom = style.marginLeft = '1px';
      testParts('', ['', '', '', '']);
    });
    test('longhand propagates to shorthand', () => {
      const style = new CSSStyleDeclaration();
      const parts = ['Top', 'Right', 'Bottom', 'Left'];
      function testParts(v, V) {
        let expected;
        for (let i = 0; i < 4; i++) {
          style.margin = v;
          style['margin' + parts[i]] = V;
          expected = v.split(/ /);
          expected[i] = V;
          expected = expected.join(' ');

          expect(style.margin).toBe(expected);
        }
      }
      testParts('1px 2px 3px 4px', '10px');
      testParts('1px 2px 3px 4px', 'auto');
    });
  });
  describe('padding', () => {
    test('shorthand propagates to longhands', () => {
      const style = new CSSStyleDeclaration();
      const parts = ['Top', 'Right', 'Bottom', 'Left'];
      function testParts(v, V) {
        style.padding = v;
        for (let i = 0; i < 4; i++) {
          expect(style['padding' + parts[i]]).toBe(V[i]);
        }
        expect(style.padding).toBe(v);
        style.padding = '';
      }
      testParts('1px', ['1px', '1px', '1px', '1px']);
      testParts('1px 2%', ['1px', '2%', '1px', '2%']);
      testParts('1px 2px 3px', ['1px', '2px', '3px', '2px']);
      testParts('1px 2px 3px 4px', ['1px', '2px', '3px', '4px']);
      style.paddingTop = style.paddingRight = style.paddingBottom = style.paddingLeft = '1px';
      testParts('', ['', '', '', '']);
    });
    test('longhand propagates to shorthand', () => {
      const style = new CSSStyleDeclaration();
      const parts = ['Top', 'Right', 'Bottom', 'Left'];
      function testParts(v, V) {
        let expected;
        for (let i = 0; i < 4; i++) {
          style.padding = v;
          style['padding' + parts[i]] = V;
          expected = v.split(/ /);
          expected[i] = V;
          expected = expected.join(' ');

          expect(style.padding).toBe(expected);
        }
      }
      testParts('1px 2px 3px 4px', '10px');
    });
  });
});
