'use strict';

const parsers = require('./parsers');

describe('parseInteger', () => {
  it('returns null for invalid values', () => {
    const invalid = ['string', '1px', '#1', '1.1', '.1', '1e-1', 'calc(1 / 2)'];
    invalid.forEach(input => expect(parsers.parseInteger(input)).toBeNull());
  });
  it('returns null for negative values when positive is required', () => {
    expect(parsers.parseInteger(-1, true)).toBeNull();
  });
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
});
describe('parseNumber', () => {
  it('returns null for invalid values', () => {
    const invalid = ['string', '1px', '#1', 'calc(1 * 1px)'];
    invalid.forEach(input => expect(parsers.parseNumber(input)).toBeNull());
  });
  it('returns null for negative values when positive is required', () => {
    expect(parsers.parseNumber(-1, true)).toBeNull();
  });
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
});
describe('parseLength', () => {
  it('returns null for invalid values', () => {
    const invalid = ['string', '1', 'px', '1%', '#1px', '1px%', 'calc(1 + 1)', 'calc(1 * 1%)'];
    invalid.forEach(input => expect(parsers.parseLength(input)).toBeNull());
  });
  it('returns null for negative values when positive is required', () => {
    expect(parsers.parseLength('-1px', false, true)).toBeNull();
    expect(parsers.parseLength('calc(-1px)', true, true)).toBeNull();
  });
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
});
describe('parsePercentage', () => {
  it('returns null for invalid values', () => {
    const invalid = ['string', '1', '%', '1px', '#1%', '1%%', 'calc(1 + 1)', 'calc(1 * 1px)'];
    invalid.forEach(input => expect(parsers.parsePercentage(input)).toBeNull());
  });
  it('returns null for negative values when positive is required', () => {
    expect(parsers.parsePercentage('-1%', false, true)).toBeNull();
    expect(parsers.parsePercentage('calc(-1%)', true, true)).toBeNull();
  });
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
});
describe('parseLengthOrPercentage', () => {
  it.todo('test');
});
describe('parseAlpha', () => {
  it('returns null for invalid values', () => {
    const invalid = ['string', '%', '1px', '#1', '1%%', 'calc(1 * 1px)'];
    invalid.forEach(input => expect(parsers.parseAlpha(input)).toBeNull());
  });
  it('parses alpha with exponent', () => {
    expect(parsers.parseAlpha('1e0')).toBe('1');
    expect(parsers.parseAlpha('1e+0')).toBe('1');
    expect(parsers.parseAlpha('1e-1')).toBe('0.1');
  });
  it('parses alpha with missing leading 0', () => {
    expect(parsers.parseAlpha('.1')).toBe('0.1');
  });
  it('returns alpha without trailing 0 in decimals', () => {
    expect(parsers.parseAlpha('0.10')).toBe('0.1');
  });
  it('resolves percentage to number', () => {
    expect(parsers.parseAlpha('50%')).toBe('0.5');
  });
  it('clamps alpha between 0 and 1', () => {
    expect(parsers.parseAlpha('-100%')).toBe('0');
    expect(parsers.parseAlpha('150%')).toBe('1');
    expect(parsers.parseAlpha('-1')).toBe('0');
    expect(parsers.parseAlpha('1.5')).toBe('1');
  });
  it('rounds alpha depending on the stored type', () => {
    expect(parsers.parseAlpha('0.499')).toBe('0.499');
    expect(parsers.parseAlpha('49.9%')).toBe('0.499');
    expect(parsers.parseAlpha('0.499', true)).toBe('0.499');
    expect(parsers.parseAlpha('49.9%', true)).toBe('0.498');
    expect(parsers.parseAlpha('0.501')).toBe('0.501');
    expect(parsers.parseAlpha('50.1%')).toBe('0.501');
    expect(parsers.parseAlpha('0.501', true)).toBe('0.501');
    expect(parsers.parseAlpha('50.1%', true)).toBe('0.5');
  });
  it('works with calc', () => {
    expect(parsers.parseAlpha('calc(0.5 + 0.5)')).toBe('1');
  });
  it('works with custom variable', () => {
    expect(parsers.parseAlpha('var(--alpha)')).toBe('var(--alpha)');
  });
});
describe('parseAngle', () => {
  it('returns null for invalid values', () => {
    const invalid = ['string', '1', 'deg', '1px', '#1deg', '1degg', 'calc(1 + 1)', 'calc(1 * 1px)'];
    invalid.forEach(input => expect(parsers.parseAngle(input)).toBeNull());
  });
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
});
describe('parseTime', () => {
  it('returns null for invalid values', () => {
    const invalid = ['string', '1', 's', '1px', '#1s', '1ss', 'calc(1 + 1)', 'calc(1 * 1px)'];
    invalid.forEach(input => expect(parsers.parseTime(input)).toBeNull());
  });
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
describe('parseBox', () => {
  it('returns null for invalid values', () => {
    const invalid = ['invalid-box', 'margin-box', 'fill-box'];
    invalid.forEach(input => expect(parsers.parseBox(input)).toBeNull());
  });
  it('works with custom variable', () => {
    expect(parsers.parseBox('var(--box)')).toBe('var(--box)');
  });
});
describe('parseShapeBox', () => {
  it('returns null for invalid values', () => {
    const invalid = ['invalid-box', 'fill-box'];
    invalid.forEach(input => expect(parsers.parseShapeBox(input)).toBeNull());
  });
  it('works with custom variable', () => {
    expect(parsers.parseShapeBox('var(--shape-box)')).toBe('var(--shape-box)');
  });
});
describe('parseGeometryBox', () => {
  it('returns null for invalid values', () => {
    expect(parsers.parseGeometryBox('invalid-box')).toBeNull();
  });
  it('works with custom variable', () => {
    expect(parsers.parseGeometryBox('var(--geometry-box)')).toBe('var(--geometry-box)');
  });
});
describe('parseBasicShape', () => {
  it('returns null for invalid values', () => {
    const invalid = [
      'ccircle()',
      'circle())',
      'circle(at 50% 50% 50%)',
      'circle(0deg)',
      'circle() invalid-box',
      'circle() ellipse()',
      'eellipse()',
      'ellipse())',
      'ellipse(50%)',
      'ellipse(0deg 0deg)',
      'ellipse(at 50% 50% 50%)',
      'ellipse() invalid-box',
      'ellipse() circle()',
      'inset()',
      'iinset(1px)',
      'inset(1px))',
      'inset(1deg)',
      'inset(1px) invalid-box',
      'inset(1px) circle()',
      'path()',
      'ppath("M0 0")',
      'path("M0 0h1"))',
      'path(nonone, "M0 0h1")',
      'path(nonzero "M0 0h1")',
      'path("M0 0") invalid-box',
      'path("M0 0") circle()',
      'polygon()',
      'ppolygon(10px 10px)',
      'polygon(10px 10px))',
      'polygon(nonone, 10px 10px)',
      'polygon(nozero 10px 10px)',
      'polygon(10px 10px 10px)',
      'polygon(10px 10px) invalid-box',
      'polygon(10px 10px) circle()',
    ];
    invalid.forEach(value => expect(parsers.parseBasicShape(value)).toBeNull());
  });
  it('parses valid values', () => {
    const valid = [
      // [input, expected = input]
      ['circle()', 'circle(at center center)'],
      ['circle(50%)', 'circle(50% at center center)'],
      ['circle(50% at center)', 'circle(50% at center center)'],
      ['circle(50% at center center)'],
      ['circle(50% at left top)'],
      ['circle(50% at 50%)', 'circle(50% at 50% center)'],
      ['circle(50% at 50% 50%)'],
      ['circle(at 50% 50%)'],
      ['ellipse()', 'ellipse(at center center)'],
      ['ellipse(50% 50%)', 'ellipse(50% 50% at center center)'],
      ['ellipse(50% 50% at center)', 'ellipse(50% 50% at center center)'],
      ['ellipse(50% 50% at center center)'],
      ['ellipse(50% 50% at left top)'],
      ['ellipse(50% 50% at 50%)', 'ellipse(50% 50% at 50% center)'],
      ['ellipse(50% 50% at 50% 50%)'],
      ['ellipse(at 50% 50%)'],
      ['inset(10%)'],
      ['inset(10% round 0%)', 'inset(10%)'],
      ['inset(10% 10% 10% 10% round 10% 10% 10% 10% / 10% 10% 10% 10%)', 'inset(10% round 10%)'],
      ['path("M0 0")', 'path("M0 0")'],
      ['path(nonzero, "M0 0")', 'path(nonzero, "M0 0")'],
      ['polygon(10px 10%)'],
      ['polygon(nonzero, 10px 10px)'],
    ];
    valid.forEach(([input, expected = input]) =>
      expect(parsers.parseBasicShape(input)).toBe(expected)
    );
  });
  it('works with calc', () => {
    const input = [
      // [input, expected = input]
      ['circle(calc(25% * 2) at calc(50% * 2))', 'circle(calc(50%) at calc(100%) center)'],
      [
        'ellipse(calc(25px * 2) calc(25px * 2) at calc(25px * 2))',
        'ellipse(calc(50px) calc(50px) at calc(50px) center)',
      ],
      ['inset(calc(5% * 2) round calc(1% * 2))', 'inset(calc(10%) round calc(2%))'],
      ['polygon(calc(1% + 1%) calc(1px + 1px))', 'polygon(calc(2%) calc(2px))'],
    ];
    input.forEach(([value, expected = value]) =>
      expect(parsers.parseBasicShape(value)).toBe(expected)
    );
  });
  it('works with custom variable', () => {
    const input = [
      'var(--shape)',
      'circle(var(--radius))',
      'circle(var(--radius)) var(--geometry-box)',
      'ellipse(var(--radii))',
      'inset(var(--radii))',
      'path(var(--definition))',
      'polygon(var(--vertices))',
    ];
    input.forEach(value => expect(parsers.parseBasicShape(value)).toBe(value));
  });
});
describe('parseImage', () => {
  it.todo('tests');
});
describe('parseResource', () => {
  it('returns null for invalid values', () => {
    const invalid = [
      // Empty (new in CSS Values 4, still valid in some browsers)
      'url()',
      'url(   )',
      'url("")',
      'src("")',
      'url(', // -> parsed to url("") by browsers
      // Invalid
      'uurl(valid.url)',
      'url(valid.url))',
      'url(")', // TOFIX (valid at computed time): url(")")
      "url(')", // TOFIX (valid at computed time): url(')')
      'url(val"id.url)',
      "url(val'id.url)",
      'url(val(id.url)',
      'url(val)id.url)',
      'url(\\)', // TOFIX (valid at computed time): url(")")
      'url(val\\\nid.url)', // ie. not a valid escape sequence
      'url(var(--url))',
      'src()', // ie. not a string
      'src(unquoted)',
    ];
    invalid.forEach(input => expect(parsers.parseResource(input)).toBeNull());
  });
  it('parses a resource with an escape sequence', () => {
    // \0 is the only valid hexDigit escape sequence in strict mode
    expect(parsers.parseResource('url(file\\0 \\g.jpg)')).toBe('url("file\\0\\g.jpg")');
    expect(parsers.parseResource(`url(${String.fromCharCode(33)})`)).toBe('url("!")');
  });
  it('returns resource wrapped between double quotes', () => {
    expect(parsers.parseResource('url(file.jpg)')).toBe('url("file.jpg")');
    expect(parsers.parseResource("url('file.jpg')")).toBe('url("file.jpg")');
    expect(parsers.parseResource("src('file.jpg')")).toBe('src("file.jpg")');
  });
  it('works with custom variable', () => {
    expect(parsers.parseResource('var(--url)')).toBe('var(--url)');
    expect(parsers.parseResource('src(var(--url))')).toBe('src(var(--url))');
  });
});
describe('parseString', () => {
  it('returns null for invalid values', () => {
    const invalid = ['string', '"""', "'''", '"\\"', '"\n"'];
    invalid.forEach(input => expect(parsers.parseString(input)).toBeNull());
  });
  it('parses an empty string', () => {
    expect(parsers.parseString('""')).toBe('""');
    expect(parsers.parseString('" "')).toBe('" "');
  });
  it('parses a string with an escape sequence', () => {
    // \0 (only valid numeric escape in strict mode) is replaced by "" in stdout
    expect(parsers.parseString(`"\0 "`)).toBe('"\0 "');
    expect(parsers.parseString(`"${String.fromCharCode(33)}"`)).toBe('"!"');
  });
  it('parses a string with an escaped newline', () => {
    expect(parsers.parseString('"\\\n"')).toBe('"\\\n"');
  });
  it('returns string wrapped between double quotes', () => {
    expect(parsers.parseString("'string'")).toBe('"string"');
  });
  it('works with custom variable', () => {
    expect(parsers.parseString('var(--string)')).toBe('var(--string)');
  });
});
describe('parsePosition', () => {
  it('returns null for invalid values', () => {
    const invalid = [
      'side',
      '1',
      'left left',
      'top top',
      'left top center',
      'left top 50%',
      '0% 0% 0%',
      'top 50%',
      '50% left',
    ];
    invalid.forEach(input => expect(parsers.parsePosition(input)).toBeNull());
  });
  it('resolves 0 as 0px', () => {
    expect(parsers.parsePosition('0 0')).toBe('0px 0px');
  });
  it('resolves with center as a default value', () => {
    expect(parsers.parsePosition('0%')).toBe('0% center');
    expect(parsers.parsePosition('left')).toBe('left center');
    expect(parsers.parsePosition('top')).toBe('center top');
    expect(parsers.parsePosition('center')).toBe('center center');
  });
  it('resolves with horizontal position first', () => {
    expect(parsers.parsePosition('top left')).toBe('left top');
  });
  it('resolves with lowercased position', () => {
    expect(parsers.parsePosition('LEFt 0%')).toBe('left 0%');
  });
  it('works with custom variable', () => {
    expect(parsers.parsePosition('var(--position)')).toBe('var(--position)');
    expect(parsers.parsePosition('top var(--position)')).toBe('top var(--position)');
  });
});
describe('parseColor', () => {
  it('returns null for invalid values', () => {
    const invalid = [
      'invalid',
      '#ffz',
      '#1',
      '#12',
      '#12345',
      '#1234567',
      '#123456789',
      'rg(0, 0, 0)',
      'rgbo(0, 0, 0)',
      'rgb(0, 0)',
      'rgb(0, 0 0)',
      'rgb(0%, 0, 0)',
      'rgb(0, 1deg, 1px)',
      'rgba(0, 1deg, 1px, invalid)',
      'rgba(0 0 0 0)',
      'rgba(0, 0, 0 / 0)',
      'hs(0, 0, 0)',
      'hslo(0, 0, 0)',
      'hsl(0, 0)',
      'hsl(0, 0 0)',
      'hsl(0%, 0, 0)',
      'hsl(0, 1deg, 1px)',
      'hsla(0, 1deg, 1px, invalid)',
      'hsla(0 0 0 0)',
      'hsla(0, 0, 0 / 0)',
    ];
    invalid.forEach(input => expect(parsers.parseColor(input)).toBeNull());
  });
  it('resolves with lowercased color name or function name', () => {
    expect(parsers.parseColor('RED')).toBe('red');
    expect(parsers.parseColor('RGb(0, 0, 0)')).toBe('rgb(0, 0, 0)');
  });
  it('should convert hex to rgba values', () => {
    expect(parsers.parseColor('#F00')).toBe('rgb(255, 0, 0)');
    expect(parsers.parseColor('#0f06')).toBe('rgba(0, 255, 0, 0.4)');
    expect(parsers.parseColor('#0000ff')).toBe('rgb(0, 0, 255)');
    expect(parsers.parseColor('#ff00ffff')).toBe('rgb(255, 0, 255)');
    expect(parsers.parseColor('#ff00ff66')).toBe('rgba(255, 0, 255, 0.4)');
  });
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
  it('clamps overflowing rgb values', () => {
    expect(parsers.parseColor('rgb(300, 300, 300, 2)')).toBe('rgb(255, 255, 255)');
    expect(parsers.parseColor('rgb(-1, -1, -1, -1)')).toBe('rgba(0, 0, 0, 0)');
    expect(parsers.parseColor('hsl(540, 100%, 50%)')).toBe('rgb(0, 255, 255)');
    expect(parsers.parseColor('hsla(400, 200%, 200%, 200%)')).toBe('rgb(255, 255, 255)');
    expect(parsers.parseColor('hsla(-20deg, -1%, -1%, -1%)')).toBe('rgba(0, 0, 0, 0)');
  });
  it('preserves precision', () => {
    expect(parsers.parseColor('rgba(245.5, 245.5, 0, 50.1%)')).toBe('rgba(246, 246, 0, 0.5)');
    expect(parsers.parseColor('rgba(245.5, 245.5, 0, 49.9%)')).toBe('rgba(246, 246, 0, 0.498)');
  });
  it('works with calc()', () => {
    expect(parsers.parseColor('rgb(calc(0 + 255), 0, calc(0 + calc(0 + 255)))')).toBe(
      'rgb(255, 0, 255)'
    );
    expect(parsers.parseColor('hsl(calc(0 + 300), 100%, calc(0% + calc(0% + 50%)))')).toBe(
      'rgb(255, 0, 255)'
    );
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
});
describe('parseGradient', () => {
  it('returns null for invalid values', () => {
    const invalid = [
      'string',
      '1',
      'invalid-gradient(red, cyan)',
      'invalid-conic-gradient(red, cyan)',
      'conic-gradient()',
      'conic-gradient( , red, cyan)',
      'conic-gradient(0, cyan)',
      'conic-gradient(from , red, cyan)',
      'conic-gradient(from 1, red, cyan)',
      'conic-gradient(from 90deg 120deg, red, cyan)',
      'conic-gradient(at , red, cyan)',
      'conic-gradient(at 1, red, cyan)',
      'conic-gradient(at left center center, red, cyan)',
      'conic-gradient(red, 0%, 0%, cyan)',
      'conic-gradient(cyan 0deg)',
      'linear-gradient(0, cyan)',
      'linear-gradient(1, red, cyan)',
      'linear-gradient(90deg 120deg, red, cyan)',
      'linear-gradient(at , red, cyan)',
      'linear-gradient(at 1, red, cyan)',
      'linear-gradient(at left center center, red, cyan)',
      'linear-gradient(red, 0%, 0%, cyan)',
      'linear-gradient(cyan 0%)',
      'radial-gradient(0, cyan)',
      'radial-gradient(1, red, cyan)',
      'radial-gradient(circle 50%, red, cyan)',
      'radial-gradient(circle 100px 120px, red, cyan)',
      'radial-gradient(ellipse 50%, red, cyan)',
      'radial-gradient(50% closest-corner, red, cyan)',
      'radial-gradient(closest-corner 50%, red, cyan)',
      'radial-gradient(at , red, cyan)',
      'radial-gradient(at 1, red, cyan)',
      'radial-gradient(at left center center, red, cyan)',
      'radial-gradient(red, 0%, 0%, cyan)',
      'radial-gradient(cyan 0%)',
    ];
    invalid.forEach(input => expect(parsers.parseGradient(input)).toBeNull());
  });
  it('parses a conic gradient', () => {
    [
      // [input, expected]
      ['conic-gradient(red, cyan)', 'conic-gradient(red, cyan)'],
      ['CONIC-gradient(red, cyan)', 'conic-gradient(red, cyan)'],
      ['repeating-conic-gradient(red, cyan)', 'repeating-conic-gradient(red, cyan)'],
      ['conic-gradient(from 0, red, cyan)', 'conic-gradient(from 0deg, red, cyan)'],
      ['conic-gradient(from 2turn, red, cyan)', 'conic-gradient(from 2turn, red, cyan)'],
      ['conic-gradient(at top, red, cyan)', 'conic-gradient(at center top, red, cyan)'],
      ['conic-gradient(at left, red, cyan)', 'conic-gradient(at left center, red, cyan)'],
      ['conic-gradient(at top left, red, cyan)', 'conic-gradient(at left top, red, cyan)'],
      ['conic-gradient(at 0%, red, cyan)', 'conic-gradient(at 0% center, red, cyan)'],
      ['conic-gradient(at -100% 200%, red, cyan)', 'conic-gradient(at -100% 200%, red, cyan)'],
      [
        'conic-gradient(from 0deg at left center, red, cyan)',
        'conic-gradient(from 0deg at left center, red, cyan)',
      ],
      ['conic-gradient(red, 50%, cyan)', 'conic-gradient(red, 50%, cyan)'],
      ['conic-gradient(red 0 0, 0, cyan)', 'conic-gradient(red 0deg, red 0deg, 0deg, cyan)'],
      [
        'conic-gradient(red 0deg 1turn, 50%, cyan)',
        'conic-gradient(red 0deg, red 1turn, 50%, cyan)',
      ],
      [
        'conic-gradient(red -1% 200%, 540deg, cyan)',
        'conic-gradient(red -1%, red 200%, 540deg, cyan)',
      ],
      ['conic-gradient(red 0deg 180deg)', 'conic-gradient(red 0deg, red 180deg)'],
    ].forEach(([input, expected]) => expect(parsers.parseGradient(input)).toBe(expected));
  });
  it('parses a linear gradient', () => {
    [
      // [input, expected]
      ['linear-gradient(red, cyan)', 'linear-gradient(red, cyan)'],
      ['repeating-linear-gradient(red, cyan)', 'repeating-linear-gradient(red, cyan)'],
      ['linear-gradient(0, red, cyan)', 'linear-gradient(0deg, red, cyan)'],
      ['linear-gradient(2turn, red, cyan)', 'linear-gradient(2turn, red, cyan)'],
      ['linear-gradient(to top, red, cyan)', 'linear-gradient(to top, red, cyan)'],
      ['linear-gradient(to left, red, cyan)', 'linear-gradient(to left, red, cyan)'],
      ['linear-gradient(to top left, red, cyan)', 'linear-gradient(to left top, red, cyan)'],
      ['linear-gradient(to bottom, red, cyan)', 'linear-gradient(red, cyan)'],
      ['linear-gradient(to left bottom, red, cyan)', 'linear-gradient(to left bottom, red, cyan)'],
      ['linear-gradient(to -100% 200%, red, cyan)', 'linear-gradient(to -100% 200%, red, cyan)'],
      ['linear-gradient(red, 50%, cyan)', 'linear-gradient(red, 50%, cyan)'],
      ['linear-gradient(red 0 0, 0, cyan)', 'linear-gradient(red 0px, red 0px, 0px, cyan)'],
      [
        'linear-gradient(red 0px 100%, 50px, cyan)',
        'linear-gradient(red 0px, red 100%, 50px, cyan)',
      ],
      [
        'linear-gradient(red -1% 200px, 150%, cyan)',
        'linear-gradient(red -1%, red 200px, 150%, cyan)',
      ],
      ['linear-gradient(red 0% 50%)', 'linear-gradient(red 0%, red 50%)'],
    ].forEach(([input, expected]) => expect(parsers.parseGradient(input)).toBe(expected));
  });
  it('parses a radial gradient', () => {
    [
      // [input, expected]
      ['radial-gradient(red, cyan)', 'radial-gradient(red, cyan)'],
      ['repeating-radial-gradient(red, cyan)', 'repeating-radial-gradient(red, cyan)'],
      ['radial-gradient(circle, red, cyan)', 'radial-gradient(circle, red, cyan)'],
      ['radial-gradient(circle 0, red, cyan)', 'radial-gradient(0px, red, cyan)'],
      ['radial-gradient(circle 50px, red, cyan)', 'radial-gradient(50px, red, cyan)'],
      ['radial-gradient(50px circle, red, cyan)', 'radial-gradient(50px, red, cyan)'],
      ['radial-gradient(circle farthest-corner, red, cyan)', 'radial-gradient(circle, red, cyan)'],
      ['radial-gradient(farthest-corner circle, red, cyan)', 'radial-gradient(circle, red, cyan)'],
      [
        'radial-gradient(circle farthest-side, red, cyan)',
        'radial-gradient(circle farthest-side, red, cyan)',
      ],
      [
        'radial-gradient(farthest-side circle, red, cyan)',
        'radial-gradient(circle farthest-side, red, cyan)',
      ],
      ['radial-gradient(ellipse, red, cyan)', 'radial-gradient(red, cyan)'],
      ['radial-gradient(ellipse 0 120%, red, cyan)', 'radial-gradient(0px 120%, red, cyan)'],
      ['radial-gradient(ellipse 80% 100%, red, cyan)', 'radial-gradient(80% 100%, red, cyan)'],
      ['radial-gradient(80% 100% ellipse, red, cyan)', 'radial-gradient(80% 100%, red, cyan)'],
      ['radial-gradient(ellipse farthest-corner, red, cyan)', 'radial-gradient(red, cyan)'],
      ['radial-gradient(farthest-corner ellipse, red, cyan)', 'radial-gradient(red, cyan)'],
      [
        'radial-gradient(ellipse farthest-side, red, cyan)',
        'radial-gradient(farthest-side, red, cyan)',
      ],
      [
        'radial-gradient(farthest-side ellipse, red, cyan)',
        'radial-gradient(farthest-side, red, cyan)',
      ],
      ['radial-gradient(at top, red, cyan)', 'radial-gradient(at center top, red, cyan)'],
      ['radial-gradient(at left, red, cyan)', 'radial-gradient(at left center, red, cyan)'],
      ['radial-gradient(at top left, red, cyan)', 'radial-gradient(at left top, red, cyan)'],
      ['radial-gradient(at -100% 200%, red, cyan)', 'radial-gradient(at -100% 200%, red, cyan)'],
      [
        'radial-gradient(circle closest-side at center center, red, cyan)',
        'radial-gradient(circle closest-side at center center, red, cyan)',
      ],
      ['radial-gradient(red, 50%, cyan)', 'radial-gradient(red, 50%, cyan)'],
      ['radial-gradient(red 0 0, 0, cyan)', 'radial-gradient(red 0px, red 0px, 0px, cyan)'],
      [
        'radial-gradient(red 0px 100%, 50px, cyan)',
        'radial-gradient(red 0px, red 100%, 50px, cyan)',
      ],
      [
        'radial-gradient(red -1% 200px, 150%, cyan)',
        'radial-gradient(red -1%, red 200px, 150%, cyan)',
      ],
      ['radial-gradient(red 0% 50%)', 'radial-gradient(red 0%, red 50%)'],
    ].forEach(([input, expected]) => expect(parsers.parseGradient(input)).toBe(expected));
  });
  it('works with calc', () => {
    [
      // [input, expected]
      [
        'conic-gradient(from calc(90deg * 2) at calc(25% * 2), red calc(5% * 2) calc(50% * 2), calc(25% * 2), cyan)',
        'conic-gradient(from calc(180deg) at calc(50%) center, red calc(10%), red calc(100%), calc(50%), cyan)',
      ],
      [
        'linear-gradient(calc(90deg * 2), red calc(5% * 2) calc(50% * 2), calc(25% * 2), cyan)',
        'linear-gradient(red calc(10%), red calc(100%), calc(50%), cyan)',
      ],
      [
        'radial-gradient(calc(25px * 2) at calc(25% * 2), red calc(5% * 2) calc(50% * 2), calc(25% * 2), cyan)',
        'radial-gradient(calc(50px) at calc(50%) center, red calc(10%), red calc(100%), calc(50%), cyan)',
      ],
    ].forEach(([input, expected]) => expect(parsers.parseGradient(input)).toBe(expected));
  });
  it('works with custom variable', () => {
    [
      'conic-gradient(var(--',
      'conic-gradient(var(--config), var(--stop1), var(--hint), var(--color) var(--start), var(--color) var(--start) var(--end))',
      'conic-gradient(var(--angle) var(--position), red, cyan)',
      'conic-gradient(from var(--angle) at var(--position), red, cyan)',
      'conic-gradient(at var(--position) var(--position), red, cyan)',
      'conic-gradient(at left var(--position), red, cyan)',
      'linear-gradient(var(--',
      'linear-gradient(var(--config), var(--stop1), var(--hint), var(--color) var(--start), var(--color) var(--start) var(--end))',
      'linear-gradient(var(--angle) var(--position), red, cyan)',
      'linear-gradient(to var(--position), red, cyan)',
      'linear-gradient(to var(--position) var(--position), red, cyan)',
      'linear-gradient(to left var(--position), red, cyan)',
      'radial-gradient(var(--',
      'radial-gradient(var(--config), var(--stop1), var(--hint), var(--color) var(--start), var(--color) var(--start) var(--end))',
      'radial-gradient(var(--size) var(--position), red, cyan)',
      'radial-gradient(var(--shape) var(--r) to var(--position), red, cyan)',
      'radial-gradient(var(--shape) var(--rx) var(--ry) to left var(--position), red, cyan)',
      'radial-gradient(to var(--position) var(--position), red, cyan)',
    ].forEach(input => expect(parsers.parseGradient(input)).toBe(input));
  });
});
describe('parseBorderRadius', () => {
  it('returns null for invalid values', () => {
    const invalid = ['string', '1', '%', '#1%', '1%%', 'calc(1 + 1)'];
    invalid.forEach(value => expect(parsers.parseBorderRadius(value)).toBeNull());
  });
  it('parses valid values', () => {
    const valid = [
      // [input, expected = input]
      ['1px'],
      ['1px 1%'],
      ['1px 1px', '1px'],
      ['1px 1px 1px', '1px'],
      ['1px 1px 1px 1px', '1px'],
      ['1px 1px 1px 1px / 1px 1px 1px 1px', '1px'],
      ['1px 2px'],
      ['1px 2px 2px'],
      ['1px 2px 1px', '1px 2px'],
      ['1px 1px 2px'],
      ['1px 2px 2px 2px', '1px 2px 2px'],
      ['1px 2px 2px 1px'],
      ['1px 2px 1px 2px', '1px 2px'],
      ['1px 2px 1px 1px'],
      ['1px 1px 2px 2px'],
      ['1px 1px 2px 1px', '1px 1px 2px'],
      ['1px 1px 1px 2px'],
      ['1px / 1px', '1px'],
      ['1px 1px / 1px', '1px'],
      ['1px / 1%'],
      ['1px / 2px'],
      ['1px/2px', '1px / 2px'],
      ['1px 1px / 2px 1px', '1px / 2px 1px'],
    ];
    valid.forEach(([value, expected = value]) =>
      expect(parsers.parseBorderRadius(value)).toBe(expected)
    );
  });
  it('works with calc', () => {
    expect(parsers.parseBorderRadius('calc(1px + 1px) 2px')).toBe('calc(2px) 2px');
  });
  it('works with custom variable', () => {
    expect(parsers.parseBorderRadius('var(--border-radius)')).toBe('var(--border-radius)');
    expect(parsers.parseBorderRadius('1px var(--border-horizontal-radius)')).toBe(
      '1px var(--border-horizontal-radius)'
    );
  });
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
