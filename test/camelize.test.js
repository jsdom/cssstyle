'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const camelize = require('../lib/utils/camelize');

describe('dashedToCamelCase', () => {
  it('should not camelize custom property', () => {
    let input = '--foo-bar-baz';
    let output = camelize.dashedToCamelCase(input);

    assert.strictEqual(output, '--foo-bar-baz');
  });

  it('should camelize value', () => {
    let input = 'foo-bar-baz';
    let output = camelize.dashedToCamelCase(input);

    assert.strictEqual(output, 'fooBarBaz');
  });

  it('should camelize vendor prefixed value', () => {
    let input = '-webkit-foo';
    let output = camelize.dashedToCamelCase(input);

    assert.strictEqual(output, 'webkitFoo');
  });

  it('should not camelize snake cased value', () => {
    let input = 'foo_bar_baz';
    let output = camelize.dashedToCamelCase(input);

    assert.strictEqual(output, 'foo_bar_baz');
  });
});

describe('camelCaseToDashed', () => {
  it('should return dashed value', () => {
    let input = 'fooBarBaz';
    let output = camelize.camelCaseToDashed(input);

    assert.strictEqual(output, 'foo-bar-baz');
  });

  it('should return dashed value', () => {
    let input = 'FooBarBaz';
    let output = camelize.camelCaseToDashed(input);

    assert.strictEqual(output, 'foo-bar-baz');
  });

  it('should return dashed value', () => {
    let input = 'webkitFooBar';
    let output = camelize.camelCaseToDashed(input);

    assert.strictEqual(output, '-webkit-foo-bar');
  });

  it('should return dashed value', () => {
    let input = 'WebkitFooBar';
    let output = camelize.camelCaseToDashed(input);

    assert.strictEqual(output, '-webkit-foo-bar');
  });
});
