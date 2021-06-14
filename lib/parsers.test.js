'use strict';

const parsers = require('./parsers');

describe('parseInteger', () => {
  it('parses integer with exponent', () => {
    expect(parsers.parseInteger('1e1')).toBe('10');
    expect(parsers.parseInteger('1e+1')).toBe('10');
  });
  it('works with calc', () => {
    expect(parsers.parseInteger('calc(1 + 1)')).toBe('2');
  });
  it('works with custom variable', () => {
    expect(parsers.parseInteger('var(--integer)')).toBe('var(--integer)');
  });
  it.todo('more tests');
});
describe('parseNumber', () => {
  it('parses number with exponent', () => {
    expect(parsers.parseNumber('1e1')).toBe('10');
    expect(parsers.parseNumber('1e+1')).toBe('10');
    expect(parsers.parseNumber('1e-1')).toBe('0.1');
  });
  it('parses number with missing leading 0', () => {
    expect(parsers.parseNumber('.1')).toBe('0.1');
  });
  it('returns number without trailing 0 in decimals', () => {
    expect(parsers.parseNumber('0.10')).toBe('0.1');
  });
  it('works with calc', () => {
    expect(parsers.parseNumber('calc(1.5 + 1.5)')).toBe('3');
  });
  it('works with custom variable', () => {
    expect(parsers.parseNumber('var(--number)')).toBe('var(--number)');
  });
  it.todo('more tests');
});
describe('parseLength', () => {
  it('parses 0 to 0px', () => {
    expect(parsers.parseLength('0')).toBe('0px');
  });
  it('parses length with exponent', () => {
    expect(parsers.parseLength('1e1px')).toBe('10px');
    expect(parsers.parseLength('1e+1px')).toBe('10px');
    expect(parsers.parseLength('1e-1px')).toBe('0.1px');
  });
  it('parses length with missing leading 0', () => {
    expect(parsers.parseLength('.1px')).toBe('0.1px');
  });
  it('returns length without trailing 0 in decimals', () => {
    expect(parsers.parseLength('0.10px')).toBe('0.1px');
  });
  it('returns length with lowercased unit', () => {
    expect(parsers.parseLength('1Px')).toBe('1px');
    expect(parsers.parseLength('1Q')).toBe('1q');
  });
  it('resolves length to px', () => {
    expect(parsers.parseLength('1cm', true)).toBe('37.7953px');
    expect(parsers.parseLength('1mm', true)).toBe('3.77953px');
    expect(parsers.parseLength('1Q', true)).toBe('0.944882px');
    expect(parsers.parseLength('1in', true)).toBe('96px');
    expect(parsers.parseLength('1pc', true)).toBe('16px');
    expect(parsers.parseLength('1pt', true)).toBe('1.33333px');
  });
  it('works with calc', () => {
    expect(parsers.parseLength('calc(1px + 1px)')).toBe('calc(2px)');
  });
  it('works with custom variable', () => {
    expect(parsers.parseLength('var(--length)')).toBe('var(--length)');
  });
  it.todo('more tests');
});
describe('parsePercentage', () => {
  it('parses percentage with exponent', () => {
    expect(parsers.parsePercentage('1e1%')).toBe('10%');
    expect(parsers.parsePercentage('1e+1%')).toBe('10%');
    expect(parsers.parsePercentage('1e-1%')).toBe('0.1%');
  });
  it('parses percentage with missing leading 0', () => {
    expect(parsers.parsePercentage('.1%')).toBe('0.1%');
  });
  it('returns percentage without trailing 0 in decimals', () => {
    expect(parsers.parsePercentage('0.10%')).toBe('0.1%');
  });
  it('works with calc', () => {
    expect(parsers.parsePercentage('calc(1% + 1%)')).toBe('calc(2%)');
  });
  it('works with custom variable', () => {
    expect(parsers.parsePercentage('var(--percentage)')).toBe('var(--percentage)');
  });
  it.todo('more tests');
});
describe('parseLengthOrPercentage', () => {
  it.todo('test');
});
describe('parseAngle', () => {
  it('parses 0 to 0deg', () => {
    expect(parsers.parseAngle('0')).toBe('0deg');
  });
  it('parses angle with exponent', () => {
    expect(parsers.parseAngle('1e1deg')).toBe('10deg');
    expect(parsers.parseAngle('1e+1deg')).toBe('10deg');
    expect(parsers.parseAngle('1e-1deg')).toBe('0.1deg');
  });
  it('parses angle with missing leading 0', () => {
    expect(parsers.parseAngle('.1deg')).toBe('0.1deg');
  });
  it('returns angle without trailing 0 in decimals', () => {
    expect(parsers.parseAngle('0.10deg')).toBe('0.1deg');
  });
  it('returns angle with lowercased unit', () => {
    expect(parsers.parseAngle('1DEg')).toBe('1deg');
  });
  it('resolves angle to deg', () => {
    expect(parsers.parseAngle('200grad', true)).toBe('180deg');
    expect(parsers.parseAngle('200grad')).toBe('200grad');
    expect(parsers.parseAngle(`${Math.PI.toString()}rad`, true)).toBe('180deg');
    expect(parsers.parseAngle(`${Math.PI.toString()}rad`)).toBe('3.14159rad');
    expect(parsers.parseAngle('0.5turn', true)).toBe('180deg');
    expect(parsers.parseAngle('0.5turn')).toBe('0.5turn');
  });
  it('works with calc', () => {
    expect(parsers.parseAngle('calc(1deg + 1deg)')).toBe('calc(2deg)');
  });
  it('works with custom variable', () => {
    expect(parsers.parseAngle('var(--angle)')).toBe('var(--angle)');
  });
  it.todo('test');
});
describe('parseTime', () => {
  it('parses time with exponent', () => {
    expect(parsers.parseTime('1e1s')).toBe('10s');
    expect(parsers.parseTime('1e+1s')).toBe('10s');
    expect(parsers.parseTime('1e-1s')).toBe('0.1s');
  });
  it('parses time with missing leading 0', () => {
    expect(parsers.parseTime('.1s')).toBe('0.1s');
  });
  it('returns time without trailing 0 in decimals', () => {
    expect(parsers.parseTime('0.10s')).toBe('0.1s');
  });
  it('resolves time with lowercased unit', () => {
    expect(parsers.parseTime('1Ms')).toBe('1ms');
  });
  it('resolves time to ms', () => {
    expect(parsers.parseTime('1s', true)).toBe('1000ms');
  });
  it('works with calc', () => {
    expect(parsers.parseTime('calc(1s + 1s)')).toBe('calc(2s)');
  });
  it('works with custom variable', () => {
    expect(parsers.parseTime('var(--time)')).toBe('var(--time)');
  });
  it.todo('more tests');
});
describe('parseCalc', () => {
  const resolveAngle = v => parsers.parseAngle(v, true);
  const resolveLengthOrPercentage = v => parsers.parseLengthOrPercentage(v, true);
  const resolveTime = v => parsers.parseTime(v, true);
  it('returns null with 0 and <dimension-percentage> as operands', () => {
    expect(parsers.parseCalc('calc(0 + 1px)', resolveLengthOrPercentage)).toBeNull();
    expect(parsers.parseCalc('calc(1% * 1px)', resolveLengthOrPercentage)).toBeNull();
  });
  it('parses a single operand', () => {
    expect(parsers.parseCalc('calc(1)')).toBe('1');
    expect(parsers.parseCalc('calc(1px)', resolveLengthOrPercentage)).toBe('calc(1px)');
  });
  it('resolves numbers', () => {
    expect(parsers.parseCalc('calc(1 - 2)')).toBe('-1');
    expect(parsers.parseCalc('calc(1 + 2)')).toBe('3');
    expect(parsers.parseCalc('calc(1 * 2)')).toBe('2');
    expect(parsers.parseCalc('calc(1 / 2)')).toBe('0.5');
    expect(parsers.parseCalc('calc(1.5 + 2.5 * 3)')).toBe('9');
    expect(parsers.parseCalc('calc((1 + 2) * 3)')).toBe('9');
    expect(parsers.parseCalc('calc(1 + 2 * (3 + 4))')).toBe('15');
    expect(parsers.parseCalc('calc(calc(1 + 2) * 3 * calc(2 - 1))')).toBe('9');
    expect(parsers.parseCalc('CALc(1 - 2)')).toBe('-1');
  });
  it('resolves numerics of the same type', () => {
    expect(parsers.parseCalc('calc(1% + 2 * 1%)', resolveLengthOrPercentage)).toBe('calc(3%)');
    expect(parsers.parseCalc('calc(1px + 2px * 1)', resolveLengthOrPercentage)).toBe('calc(3px)');
    expect(parsers.parseCalc('calc(1px + 2em * 2)', resolveLengthOrPercentage)).toBe(
      'calc(1px + 4em)'
    );
    expect(parsers.parseCalc('calc(1px + 1pc)', resolveLengthOrPercentage)).toBe('calc(17px)');
    expect(parsers.parseCalc('calc(1turn + 180deg)', resolveAngle)).toBe('calc(180deg)');
    expect(parsers.parseCalc('calc(1s + 1000ms)', resolveTime)).toBe('calc(2000ms)');
    expect(parsers.parseCalc('CALc(1px + 1em)', resolveLengthOrPercentage)).toBe('calc(1px + 1em)');
  });
  it('works with custom variable', () => {
    expect(parsers.parseCalc('calc(var(--integer) + 1)')).toBe('calc(var(--integer) + 1)');
  });
});
describe('parseKeyword', () => {
  it('returns null for invalid values', () => {
    const invalid = ['ninitial', 'initiall', '--initial', 'liquid'];
    const valid = ['solid'];
    invalid.forEach(input => expect(parsers.parseKeyword(input, valid)).toBeNull());
  });
  it('parses CSS wide keywords', () => {
    expect(parsers.parseKeyword('INItial')).toBe('initial');
    expect(parsers.parseKeyword('initial', ['initial'])).toBe('initial');
    expect(parsers.parseKeyword('inherit')).toBe('inherit');
    expect(parsers.parseKeyword('revert')).toBe('revert');
    expect(parsers.parseKeyword('unset')).toBe('unset');
  });
  it('parses predefined keywords', () => {
    expect(parsers.parseKeyword('SOLId', ['solid'])).toBe('solid');
  });
  it('works with custom variable', () => {
    expect(parsers.parseKeyword('var(--keyword)')).toBe('var(--keyword)');
  });
});
describe('parseCustomIdentifier', () => {
  it('returns null for invalid values', () => {
    const invalid = [
      'initial',
      'inherit',
      'unset',
      'default',
      '1identifier',
      '#identifier',
      'ident ifier',
      '\\\nidentifier', // ie. not a valid escape sequence
    ];
    invalid.forEach(input => expect(parsers.parseCustomIdentifier(input)).toBeNull());
  });
  it('parses valid values', () => {
    const valid = [
      '_',
      '\\0 \\g', // ie. valid escape sequences
      'camelIdentifier',
      'snake_identifier',
      'kebab-identifier',
      '--',
      '--dashed-camelIdentifier',
      '--dashed-kebab-identifier',
      '--kebab-snake_identifier',
      '--\\0 \\g', // ie. valid escape sequences
    ];
    valid.forEach(value => expect(parsers.parseCustomIdentifier(value)).toBe(value));
  });
  it('works with custom variable', () => {
    expect(parsers.parseCustomIdentifier('var(--identifier)')).toBe('var(--identifier)');
  });
});
describe('parseDashedIdentifier', () => {
  it('returns null for invalid values', () => {
    expect(parsers.parseDashedIdentifier('identifier')).toBeNull();
  });
  it('works with custom variable', () => {
    expect(parsers.parseDashedIdentifier('var(--dashed-ident)')).toBe('var(--dashed-ident)');
  });
});
describe('parseUrl', () => {
  it('works with custom variable', () => {
    expect(parsers.parseUrl('var(--url)')).toBe('var(--url)');
  });
  it.todo('more tests');
});
describe('parseString', () => {
  it('works with custom variable', () => {
    expect(parsers.parseString('var(--string)')).toBe('var(--string)');
  });
  it.todo('more tests');
});
describe('parseColor', () => {
  it('should convert hsl to rgb values', () => {
    let input = 'hsla(0, 1%, 2%)';
    let output = parsers.parseColor(input);

    expect(output).toBe('rgb(5, 5, 5)');
  });
  it('should convert hsla to rgba values', () => {
    let input = 'hsla(0, 1%, 2%, 0.5)';
    let output = parsers.parseColor(input);

    expect(output).toBe('rgba(5, 5, 5, 0.5)');
  });
  it('works with custom variable', () => {
    expect(parsers.parseColor('rgb(var(--')).toBe('rgb(var(--');
    expect(parsers.parseColor('hsl(var(--')).toBe('hsl(var(--');
    expect(parsers.parseColor('rgb(var(--red), 0, 0, var(--alpha))')).toBe(
      'rgb(var(--red), 0, 0, var(--alpha))'
    );
    expect(parsers.parseColor('hsl(var(--hue), var(--sat), 0, var(--alpha))')).toBe(
      'hsl(var(--hue), var(--sat), 0, var(--alpha))'
    );
  });

  it.todo('Add more tests');
});
describe('parseCustomVariable', () => {
  it('returns null for invalid values', () => {
    const invalid = [
      'var(, --property)',
      'var(1px, --property)',
      'vvar(--property)',
      'varr(--property)',
      'var(--prop erty)',
      'var(--, var(1px))',
    ];
    invalid.forEach(input => expect(parsers.parseCustomVariable(input)).toBeNull());
  });
  it('parses a property with fallback value(s)', () => {
    expect(parsers.parseCustomVariable('var(--foo, 100px)')).toBe('var(--foo, 100px)');
    expect(parsers.parseCustomVariable('var(--foo, var(--bar))')).toBe('var(--foo, var(--bar))');
  });
  it('returns value even when it might be resolved as invalid at user time', () => {
    const invalid = [
      'var(--',
      'var(--, )',
      'var(--)invalid',
      'invalid var(--)',
      'var(--prop) erty',
      'var(--, --prop erty)',
      'calc(var(--',
      'calc(var(--integer) + 1)',
    ];
    invalid.forEach(input => expect(parsers.parseCustomVariable(input)).toBe(input));
  });
  it('returns a case senstive property reference name', () => {
    expect(parsers.parseCustomVariable('VAr(--PROPerty)')).toBe('var(--PROPerty)');
  });
  it('works with calc', () => {
    expect(parsers.parseCustomVariable('var(--foo, calc(1 + 1))')).toBe('var(--foo, calc(1 + 1))');
  });
});
describe('cssPropertyToIDLAttribute', () => {
  it.todo('test');
});
describe('parseShorthand', () => {
  it('returns null with invalid component value(s)', () => {
    const longhands = { component: { parse: parsers.parseNumber } };
    expect(parsers.parseShorthand('1px', longhands)).toBeNull();
  });
  it('parses component values not sorted in canonical order', () => {
    const longhands = {
      component1: { parse: parsers.parseNumber },
      component2: { parse: parsers.parseLength },
    };
    expect(parsers.parseShorthand('1px 1', longhands)).toEqual({
      component1: '1',
      component2: '1px',
    });
  });
  it('replaces unspecified component with the inital keyword', () => {
    const longhands = {
      component1: { parse: parsers.parseNumber },
      component2: { parse: parsers.parseNumber },
    };
    expect(parsers.parseShorthand('1', longhands)).toEqual({
      component1: '1',
      component2: 'initial',
    });
  });
});
describe('parseImplicitShorthand', () => {
  it('returns null if some component value is parsed as invalid', () => {
    const longhands = { component: { parse: parsers.parseNumber } };
    expect(parsers.parseImplicitShorthand('1px', longhands)).toBeNull();
  });
  it('parses an implicit shorthand value with missing component values', () => {
    const component = { parse: parsers.parseNumber };
    const longhands = {
      component1: component,
      component2: component,
      component3: component,
      component4: component,
    };
    expect(parsers.parseImplicitShorthand('1', longhands)).toEqual({
      component1: '1',
      component2: '1',
      component3: '1',
      component4: '1',
    });
    expect(parsers.parseImplicitShorthand('1 2', longhands)).toEqual({
      component1: '1',
      component2: '2',
      component3: '1',
      component4: '2',
    });
    expect(parsers.parseImplicitShorthand('1 2 3', longhands)).toEqual({
      component1: '1',
      component2: '2',
      component3: '3',
      component4: '2',
    });
  });
});
describe('createShorthandSetter', () => {
  it('propagates shorthand component values to longhands', () => {
    const style = { _values: {} };
    const longhands = {
      component1: { parse: parsers.parseNumber },
      component2: { parse: parsers.parseLength },
    };
    const definition = {
      set: parsers.createShorthandSetter(longhands),
      get: parsers.createShorthandGetter(longhands),
    };
    Object.defineProperty(style, 'shorthand', definition);
    style.shorthand = '1px 2';
    expect(style.component1).toBe('2');
    expect(style.component2).toBe('1px');
  });
});
describe('serializeShorthand', () => {
  it('returns CSS wide keyword when all longhands are set with it', () => {
    expect(parsers.serializeShorthand(['initial', 'initial', 'initial'])).toBe('initial');
    expect(parsers.serializeShorthand(['inherit', 'inherit', 'inherit'])).toBe('inherit');
  });
  it('returns empty string if some components are a CSS wide keyword that is not initial but not all component values are set with it', () => {
    expect(parsers.serializeShorthand(['initial', 'inherit', 'initial'])).toBe('');
  });
  it('filters out empty string and initial', () => {
    expect(parsers.serializeShorthand(['red', 'initial', '', 'repeat'])).toBe('red repeat');
  });
});
describe('serializeImplicitShorthand', () => {
  it('returns empty string if some longhand values are not set (empty string)', () => {
    expect(parsers.serializeImplicitShorthand(['1', ''])).toBe('');
  });
  it('returns empty string if some longhand values are a CSS wide keyword', () => {
    expect(parsers.serializeImplicitShorthand(['1', 'initial'])).toBe('');
  });
  it('reduces value to its minimal expression', () => {
    expect(parsers.serializeImplicitShorthand(['1', '1', '1', '1'])).toBe('1');
    expect(parsers.serializeImplicitShorthand(['1', '2', '1', '2'])).toBe('1 2');
    expect(parsers.serializeImplicitShorthand(['1', '2', '3', '1'])).toBe('1 2 3 1');
    expect(parsers.serializeImplicitShorthand(['1', '2', '3', '4'])).toBe('1 2 3 4');
  });
});
describe('createShorthandGetter', () => {
  it('collects and serialize component values of the provided longhands', () => {
    const longhands = { component1: '', component2: '' };
    const style = { component1: '1', component2: '2' };
    const get = parsers.createShorthandGetter(longhands);
    expect(get.call(style)).toBe('1 2');
  });
});
describe('idlAttributeToCSSProperty', () => {
  it.todo('test');
});
describe('splitTokens', () => {
  it('should split value components separated by space', () => {
    expect(parsers.splitTokens('1px solid red')).toEqual([['1px', 'solid', 'red'], [' ', ' ']]);
  });
  it('should split value components separated by space and forward slash', () => {
    expect(parsers.splitTokens('url(bg.jpq) center / 50%', /[ /]/)).toEqual([
      ['url(bg.jpq)', 'center', '50%'],
      [' ', ' / '],
    ]);
  });
  it('should split a list of values', () => {
    expect(parsers.splitTokens('1px 1px black, 2px 2px silver', /,/)).toEqual([
      ['1px 1px black', '2px 2px silver'],
      [', '],
    ]);
  });
  it('should split color function arguments', () => {
    const separators = /[,/ ]/;
    expect(parsers.splitTokens('0,0,0', separators)).toEqual([['0', '0', '0'], [',', ',']]);
    expect(parsers.splitTokens('0,1%,2%', separators)).toEqual([['0', '1%', '2%'], [',', ',']]);
    expect(parsers.splitTokens('0   ,   0   , 0', separators)).toEqual([
      ['0', '0', '0'],
      [' , ', ' , '],
    ]);
    expect(parsers.splitTokens('0deg, 1%, 2%', separators)).toEqual([
      ['0deg', '1%', '2%'],
      [', ', ', '],
    ]);
    expect(parsers.splitTokens('0deg 1%   /   2%', separators)).toEqual([
      ['0deg', '1%', '2%'],
      [' ', ' / '],
    ]);
  });
  it('should split nested function arguments', () => {
    expect(parsers.splitTokens('calc(45deg * 2) to left, rgb(255, 0, 0), cyan', /,/)).toEqual([
      ['calc(45deg * 2) to left', 'rgb(255, 0, 0)', 'cyan'],
      [', ', ', '],
    ]);
    expect(parsers.splitTokens('calc(1 + 1) + var(--number, calc(1 + 1)) * 1', /[+*]/)).toEqual([
      ['calc(1 + 1)', 'var(--number, calc(1 + 1))', '1'],
      [' + ', ' * '],
    ]);
  });
  it('should split function with empty arguments', () => {
    expect(parsers.splitTokens(', ,   ,, 1%,', /,/)).toEqual([
      ['', '', '', '', '1%', ''],
      [', ', ',   ', ',', ', ', ','],
    ]);
  });
});
