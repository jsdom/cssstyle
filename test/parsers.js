'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const parsers = require('../lib/parsers');

describe('valueType', () => {
  it('returns null or empty string for null', () => {
    let input = null;
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.NULL_OR_EMPTY_STR);
  });

  it('returns null or empty string for empty string', () => {
    let input = '';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.NULL_OR_EMPTY_STR);
  });

  it('returns undefined for undefined', () => {
    let input = undefined;
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNDEFINED);
  });

  it('returns number for 1', () => {
    let input = 1;
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.NUMBER);
  });

  it('returns number for 1.1', () => {
    let input = 1.1;
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.NUMBER);
  });

  it('returns number for ".1"', () => {
    let input = '.1';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.NUMBER);
  });

  it('returns length for 100ch', () => {
    let input = '100ch';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.LENGTH);
  });

  it('returns percent for 10%', () => {
    let input = '10%';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.PERCENT);
  });

  it('returns unidentified for url(https://example.com)', () => {
    let input = 'url(https://example.com)';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNIDENT);
  });

  it('returns unidentified for url("https://example.com")', () => {
    let input = 'url("https://example.com")';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNIDENT);
  });

  it('returns unidentified for url(foo.png)', () => {
    let input = 'url(foo.png)';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNIDENT);
  });

  it('returns unidentified for url("foo.png")', () => {
    let input = 'url("foo.png")';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNIDENT);
  });

  it('returns var for url(var(--foo))', () => {
    let input = 'url(var(--foo))';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.VAR);
  });

  it('returns var from calc(100px *  var(--foo))', () => {
    let input = 'calc(100px *  var(--foo))';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.VAR);
  });

  it('returns var from var(--foo)', () => {
    let input = 'var(--foo)';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.VAR);
  });

  it('returns var from var(--foo, var(--bar))', () => {
    let input = 'var(--foo, var(--bar))';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.VAR);
  });

  it('returns var from var(--foo, calc(var(--bar) * 2))', () => {
    let input = 'var(--foo, calc(var(--bar) * 2))';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.VAR);
  });

  it('returns calc from calc(100px * 2)', () => {
    let input = 'calc(100px * 2)';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.CALC);
  });

  it('returns calc from calc(100px *  calc(2 * 1))', () => {
    let input = 'calc(100px * calc(2 * 1))';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.CALC);
  });

  it('returns string from "foo"', () => {
    let input = '"foo"';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.STRING);
  });

  it("returns string from 'foo'", () => {
    let input = "'foo'";
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.STRING);
  });

  it('returns angle for 90deg', () => {
    let input = '90deg';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.ANGLE);
  });

  it('returns color for red', () => {
    let input = 'red';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it('returns color for #nnnnnn', () => {
    let input = '#fefefe';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it('returns color for rgb(n, n, n)', () => {
    let input = 'rgb(10, 10, 10)';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it('returns color for rgb(p, p, p)', () => {
    let input = 'rgb(10%, 10%, 10%)';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it('returns color for rgba(n, n, n, n)', () => {
    let input = 'rgba(10, 10, 10, 1)';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it('returns color for rgba(n, n, n, n) with decimal alpha', () => {
    let input = 'rgba(10, 10, 10, 0.5)';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it('returns color for rgba(p, p, p, n)', () => {
    let input = 'rgba(10%, 10%, 10%, 1)';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it('returns color for rgba(p, p, p, n) with decimal alpha', () => {
    let input = 'rgba(10%, 10%, 10%, 0.5)';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it('returns color for transparent keyword', () => {
    let input = 'transparent';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it('returns unidentified for linear-gradient(red, blue)', () => {
    let input = 'linear-gradient(red, blue)';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNIDENT);
  });

  it('returns color for accentcolor', () => {
    let input = 'AccentColor';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it('returns color for legacy activeborder', () => {
    let input = 'ActiveBorder';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it('returns keyword for foo', () => {
    let input = 'foo';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.KEYWORD);
  });

  it('returns keyword for foo-bar', () => {
    let input = 'foo-bar';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.KEYWORD);
  });

  it('returns unidentified for foo(bar)', () => {
    let input = 'foo(bar)';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNIDENT);
  });
});

describe('parseNumber', () => {
  it('should return null', () => {
    let input = null;
    let output = parsers.parseNumber(input);

    assert.strictEqual(output, null);
  });

  it('should return empty string', () => {
    let input = '';
    let output = parsers.parseNumber(input);

    assert.strictEqual(output, '');
  });

  it('should return undefined', () => {
    let input = 'foo';
    let output = parsers.parseNumber(input);

    assert.strictEqual(output, undefined);
  });

  it('should return undefined', () => {
    let input = undefined;
    let output = parsers.parseNumber(input);

    assert.strictEqual(output, undefined);
  });

  it('should return "1"', () => {
    let input = 1;
    let output = parsers.parseNumber(input);

    assert.strictEqual(output, '1');
  });

  it('should return "1"', () => {
    let input = '1';
    let output = parsers.parseNumber(input);

    assert.strictEqual(output, '1');
  });

  it('should return "0.5"', () => {
    let input = 0.5;
    let output = parsers.parseNumber(input);

    assert.strictEqual(output, '0.5');
  });

  it('should return "0.5"', () => {
    let input = '0.5';
    let output = parsers.parseNumber(input);

    assert.strictEqual(output, '0.5');
  });

  it('should return "0.5"', () => {
    let input = '.5';
    let output = parsers.parseNumber(input);

    assert.strictEqual(output, '0.5');
  });

  it('should return calculated value', () => {
    let input = 'calc(2 / 3)';
    let output = parsers.parseLength(input);

    assert.strictEqual(output, 'calc(0.666667)');
  });
});

describe('parseLength', () => {
  it('should return null', () => {
    let input = null;
    let output = parsers.parseLength(input);

    assert.strictEqual(output, null);
  });

  it('should return empty string', () => {
    let input = '';
    let output = parsers.parseLength(input);

    assert.strictEqual(output, '');
  });

  it('should return value as is', () => {
    let input = 'var(/* comment */ --foo)';
    let output = parsers.parseLength(input);

    assert.strictEqual(output, 'var(/* comment */ --foo)');
  });

  it('should return calculated value', () => {
    let input = 'calc(2em / 3)';
    let output = parsers.parseLength(input);

    assert.strictEqual(output, 'calc(0.666667em)');
  });

  it('should return serialized value', () => {
    let input = 'calc(10px + 20%)';
    let output = parsers.parseLength(input);

    assert.strictEqual(output, 'calc(20% + 10px)');
  });

  it('should return serialized value', () => {
    let input = 'calc(100vh + 10px)';
    let output = parsers.parseLength(input);

    assert.strictEqual(output, 'calc(10px + 100vh)');
  });
});

describe('parsePercent', () => {
  it('should return null', () => {
    let input = null;
    let output = parsers.parsePercent(input);

    assert.strictEqual(output, null);
  });

  it('should return empty string', () => {
    let input = '';
    let output = parsers.parsePercent(input);

    assert.strictEqual(output, '');
  });

  it('should return value as is', () => {
    let input = 'var(/* comment */ --foo)';
    let output = parsers.parsePercent(input);

    assert.strictEqual(output, 'var(/* comment */ --foo)');
  });

  it('should return calculated value', () => {
    let input = 'calc(100% / 3)';
    let output = parsers.parsePercent(input);

    assert.strictEqual(output, 'calc(33.3333%)');
  });

  it('should return serialized value', () => {
    let input = 'calc(10px + 20%)';
    let output = parsers.parsePercent(input);

    assert.strictEqual(output, 'calc(20% + 10px)');
  });
});

describe('parseMeasurement', () => {
  it('should return null', () => {
    let input = null;
    let output = parsers.parseMeasurement(input);

    assert.strictEqual(output, null);
  });

  it('should return empty string', () => {
    let input = '';
    let output = parsers.parseMeasurement(input);

    assert.strictEqual(output, '');
  });

  it('should return value with em unit', () => {
    let input = '1em';
    let output = parsers.parseMeasurement(input);

    assert.strictEqual(output, '1em');
  });

  it('should return value with percent', () => {
    let input = '100%';
    let output = parsers.parseMeasurement(input);

    assert.strictEqual(output, '100%');
  });

  it('should return value as is', () => {
    let input = 'var(/* comment */ --foo)';
    let output = parsers.parseMeasurement(input);

    assert.strictEqual(output, 'var(/* comment */ --foo)');
  });

  it('should return calculated value', () => {
    let input = 'calc(2em / 3)';
    let output = parsers.parseMeasurement(input);

    assert.strictEqual(output, 'calc(0.666667em)');
  });

  it('should return calculated value', () => {
    let input = 'calc(100% / 3)';
    let output = parsers.parseMeasurement(input);

    assert.strictEqual(output, 'calc(33.3333%)');
  });

  it('should return serialized value', () => {
    let input = 'calc(10px + 20%)';
    let output = parsers.parseMeasurement(input);

    assert.strictEqual(output, 'calc(20% + 10px)');
  });

  it('should return serialized value', () => {
    let input = 'calc(100vh + 10px)';
    let output = parsers.parseMeasurement(input);

    assert.strictEqual(output, 'calc(10px + 100vh)');
  });

  it('should return 0px for 0', () => {
    let input = 0;
    let output = parsers.parseMeasurement(input);

    assert.strictEqual(output, '0px');
  });

  it('should return 0px for "0"', () => {
    let input = '0';
    let output = parsers.parseMeasurement(input);

    assert.strictEqual(output, '0px');
  });
});

describe('parseInheritingMeasurement', () => {
  it('should return auto', () => {
    let input = 'auto';
    let output = parsers.parseInheritingMeasurement(input);

    assert.strictEqual(output, 'auto');
  });

  it('should return auto', () => {
    let input = 'AUTO';
    let output = parsers.parseInheritingMeasurement(input);

    assert.strictEqual(output, 'auto');
  });

  it('should return inherit', () => {
    let input = 'inherit';
    let output = parsers.parseInheritingMeasurement(input);

    assert.strictEqual(output, 'inherit');
  });

  it('should return inherit', () => {
    let input = 'INHERIT';
    let output = parsers.parseInheritingMeasurement(input);

    assert.strictEqual(output, 'inherit');
  });

  it('should return value with em unit', () => {
    let input = '1em';
    let output = parsers.parseInheritingMeasurement(input);

    assert.strictEqual(output, '1em');
  });

  it('should return value with percent', () => {
    let input = '100%';
    let output = parsers.parseInheritingMeasurement(input);

    assert.strictEqual(output, '100%');
  });
});

describe('parseUrl', () => {
  it('should return null', () => {
    let input = null;
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, null);
  });

  it('should return empty string', () => {
    let input = '';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, '');
  });

  it('should return undefined', () => {
    let input = 'url(var(--foo))';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it('should return undefined', () => {
    let input = undefined;
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it('should return quoted url string', () => {
    let input = 'url(sample.png)';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample.png")');
  });

  it('should return quoted url string', () => {
    let input = "url('sample.png')";
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample.png")');
  });

  it('should return quoted url string', () => {
    let input = 'url("sample.png")';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample.png")');
  });

  it('should return quoted url string without escape', () => {
    let input = 'url(sample\\-escaped.png)';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample-escaped.png")');
  });

  it('should return quoted url string with escape', () => {
    let input = 'url(sample\\\\-escaped.png)';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample\\\\-escaped.png")');
  });

  it('should return undefined', () => {
    let input = 'url(sample unescaped -space.png)';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it('should return quoted url string without escape', () => {
    let input = 'url(sample\\ escaped\\ -space.png)';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample escaped -space.png")');
  });

  it('should return undefined', () => {
    let input = 'url(sample\tunescaped\t-tab.png)';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it('should return quoted url string without escape', () => {
    let input = 'url(sample\\\tescaped\\\t-tab.png)';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample\tescaped\t-tab.png")');
  });

  it('should return undefined', () => {
    let input = 'url(sample\nunescaped\n-lf.png)';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it('should return quoted url string without escape', () => {
    let input = 'url(sample\\\nescaped\\\n-lf.png)';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample\nescaped\n-lf.png")');
  });

  it('should return undefined', () => {
    let input = "url(sample'unescaped'-quote.png)";
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it('should return quoted url string without escape', () => {
    let input = "url(sample\\'escaped\\'-quote.png)";
    let output = parsers.parseUrl(input);

    // prettier-ignore
    assert.strictEqual(output, "url(\"sample'escaped'-quote.png\")");
  });

  it('should return undefined', () => {
    let input = 'url(sample"unescaped"-double-quote.png)';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it('should return quoted url string with escape', () => {
    let input = 'url(sample\\"escaped\\"-double-quote.png)';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample\\"escaped\\"-double-quote.png")');
  });

  it('should return quoted empty url string', () => {
    let input = 'url()';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("")');
  });

  it('should return quoted empty url string', () => {
    let input = 'url("")';
    let output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("")');
  });
});

describe('parseString', () => {
  it.todo('test');
});

describe('parseColor', () => {
  it('should return null', () => {
    let input = null;
    let output = parsers.parseColor(input);

    assert.strictEqual(output, null);
  });

  it('should return empty string', () => {
    let input = '';
    let output = parsers.parseColor(input);

    assert.strictEqual(output, '');
  });

  it('should return undefined', () => {
    let input = undefined;
    let output = parsers.parseColor(input);

    assert.strictEqual(output, undefined);
  });

  it('should convert hsl to rgb values', () => {
    let input = 'hsla(0, 1%, 2%)';
    let output = parsers.parseColor(input);

    assert.strictEqual(output, 'rgb(5, 5, 5)');
  });

  it('should convert hsla to rgba values', () => {
    let input = 'hsla(0, 1%, 2%, 0.5)';
    let output = parsers.parseColor(input);

    assert.strictEqual(output, 'rgba(5, 5, 5, 0.5)');
  });

  it('should convert not zero hsl with non zero hue 120 to rgb(0, 255, 0)', () => {
    let input = 'hsl(120, 100%, 50%)';
    let output = parsers.parseColor(input);

    assert.strictEqual(output, 'rgb(0, 255, 0)');
  });

  it('should convert not zero hsl with non zero hue 240 to rgb(0, 0, 255)', () => {
    let input = 'hsl(240, 100%, 50%)';
    let output = parsers.parseColor(input);

    assert.strictEqual(output, 'rgb(0, 0, 255)');
  });

  it('should convert modern rgb to rgb values', () => {
    let input = 'rgb(128 0 128 / 1)';
    let output = parsers.parseColor(input);

    assert.strictEqual(output, 'rgb(128, 0, 128)');
  });

  it('should convert modern rgb with none values to rgb values', () => {
    let input = 'rgb(128 0 none)';
    let output = parsers.parseColor(input);

    assert.strictEqual(output, 'rgb(128, 0, 0)');
  });

  it('should convert modern rgba to rgba values', () => {
    let input = 'rgba(127.5 0 127.5 / .5)';
    let output = parsers.parseColor(input);

    assert.strictEqual(output, 'rgba(128, 0, 128, 0.5)');
  });

  it('should normalize lab values', () => {
    let input = 'lab(46.2775% -47.5621 48.5837 / 1.0)'; // green
    let output = parsers.parseColor(input);

    assert.strictEqual(output, 'lab(46.2775 -47.5621 48.5837)');
  });

  it('should normalize color function values', () => {
    let input = 'color(srgb 0 .5 0 / 1.0)';
    let output = parsers.parseColor(input);

    assert.strictEqual(output, 'color(srgb 0 0.5 0)');
  });

  it('should normalize color-mix values', () => {
    let input = 'color-mix(in srgb, rgb(255 0 0), #0000ff 40%)';
    let output = parsers.parseColor(input);

    assert.strictEqual(output, 'color-mix(in srgb, rgb(255, 0, 0) 60%, rgb(0, 0, 255))');
  });

  it('should not remove comments, trim or lower case letters if var() is used', () => {
    let input = 'var( --custom-Color /* comment */)';
    let output = parsers.parseColor(input);

    assert.strictEqual(output, 'var( --custom-Color /* comment */)');
  });

  it('should output transparent keyword', () => {
    let input = 'transparent';
    let output = parsers.parseColor(input);

    assert.strictEqual(output, 'transparent');
  });
});

describe('parseAngle', () => {
  it.todo('test');
});

describe('parseKeyword', () => {
  it.todo('test');
});

describe('parseImage', () => {
  it('should return value', () => {
    let input = 'none';
    let output = parsers.parseImage(input);

    assert.strictEqual(output, 'none');
  });

  it('should return value', () => {
    let input = 'inherit';
    let output = parsers.parseImage(input);

    assert.strictEqual(output, 'inherit');
  });

  it('should return empty string', () => {
    let input = '';
    let output = parsers.parseImage(input);

    assert.strictEqual(output, '');
  });

  it('should return null', () => {
    let input = null;
    let output = parsers.parseImage(input);

    assert.strictEqual(output, null);
  });

  it('should return undefined', () => {
    let input = 'foo';
    let output = parsers.parseImage(input);

    assert.strictEqual(output, undefined);
  });

  it('should return undefined for negative radii', () => {
    let input = 'radial-gradient(circle -10px at center, red, blue)';
    let output = parsers.parseImage(input);

    assert.strictEqual(output, undefined);
  });

  it('should return value', () => {
    let input = 'url(example.png)';
    let output = parsers.parseImage(input);

    assert.strictEqual(output, 'url("example.png")');
  });

  it('should return value', () => {
    let input = 'url(example.png), url("example2.png")';
    let output = parsers.parseImage(input);

    assert.strictEqual(output, 'url("example.png"), url("example2.png")');
  });

  it('should return value', () => {
    let input = 'none, url(example.png)';
    let output = parsers.parseImage(input);

    assert.strictEqual(output, 'none, url("example.png")');
  });

  it('should return value', () => {
    let input = 'linear-gradient(green, blue), url(example.png)';
    let output = parsers.parseImage(input);

    assert.strictEqual(output, 'linear-gradient(green, blue), url("example.png")');
  });

  it('should return value as is if var() is included', () => {
    let input = 'radial-gradient(transparent, /* comment */ var(--custom-color)), url(example.png)';
    let output = parsers.parseImage(input);

    assert.strictEqual(
      output,
      'radial-gradient(transparent, /* comment */ var(--custom-color)), url(example.png)'
    );
  });

  it('should return value as is if var() is included and even if invalid image type is included', () => {
    let input = 'radial-gradient(transparent, var(--custom-color)), red';
    let output = parsers.parseImage(input);

    assert.strictEqual(output, 'radial-gradient(transparent, var(--custom-color)), red');
  });

  it.todo('test');
});
describe('dashedToCamelCase', () => {
  it.todo('test');
});
describe('shorthandParser', () => {
  it.todo('test');
});
describe('shorthandSetter', () => {
  it.todo('test');
});
describe('shorthandGetter', () => {
  it.todo('test');
});
describe('implicitSetter', () => {
  it.todo('test');
});
describe('subImplicitSetter', () => {
  it.todo('test');
});
describe('camelToDashed', () => {
  it.todo('test');
});
