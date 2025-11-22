"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const camelize = require("../scripts/camelize");

describe("dashedToCamelCase", () => {
  it("should not camelize custom property", () => {
    const input = "--foo-bar-baz";
    const output = camelize.dashedToCamelCase(input);

    assert.strictEqual(output, "--foo-bar-baz");
  });

  it("should camelize value", () => {
    const input = "foo-bar-baz";
    const output = camelize.dashedToCamelCase(input);

    assert.strictEqual(output, "fooBarBaz");
  });

  it("should camelize vendor prefixed value", () => {
    const input = "-webkit-foo";
    const output = camelize.dashedToCamelCase(input);

    assert.strictEqual(output, "webkitFoo");
  });

  it("should not camelize snake cased value", () => {
    const input = "foo_bar_baz";
    const output = camelize.dashedToCamelCase(input);

    assert.strictEqual(output, "foo_bar_baz");
  });
});

describe("camelCaseToDashed", () => {
  it("should not convert custom property to dashed", () => {
    const input = "--foo-Bar-baZ";
    const output = camelize.camelCaseToDashed(input);

    assert.strictEqual(output, "--foo-Bar-baZ");
  });

  it("should convert to dashed value", () => {
    const input = "fooBarBaz";
    const output = camelize.camelCaseToDashed(input);

    assert.strictEqual(output, "foo-bar-baz");
  });

  it("should convert to dashed value", () => {
    const input = "FooBarBaz";
    const output = camelize.camelCaseToDashed(input);

    assert.strictEqual(output, "foo-bar-baz");
  });

  it("should convert to dashed value", () => {
    const input = "webkitFooBar";
    const output = camelize.camelCaseToDashed(input);

    assert.strictEqual(output, "-webkit-foo-bar");
  });

  it("should convert to dashed value", () => {
    const input = "WebkitFooBar";
    const output = camelize.camelCaseToDashed(input);

    assert.strictEqual(output, "-webkit-foo-bar");
  });
});
