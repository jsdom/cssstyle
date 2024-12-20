'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const parsers = require('../lib/parsers');

describe('valueType', () => {
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

  it('returns length for 100ch', () => {
    let input = '100ch';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.LENGTH);
  });

  it('returns calc from calc(100px * 2)', () => {
    let input = 'calc(100px * 2)';
    let output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.CALC);
  });
});
describe('parseInteger', () => {
  it.todo('test');
});
describe('parseNumber', () => {
  it.todo('test');
});
describe('parseLength', () => {
  it.todo('test');
});
describe('parsePercent', () => {
  it.todo('test');
});
describe('parseMeasurement', () => {
  it.todo('test');
});
describe('parseUrl', () => {
  it.todo('test');
});
describe('parseString', () => {
  it.todo('test');
});
describe('parseColor', () => {
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

  it.todo('Add more tests');
});
describe('parseAngle', () => {
  it.todo('test');
});
describe('parseKeyword', () => {
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
