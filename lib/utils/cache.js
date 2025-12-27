"use strict";

const { LRUCache } = require("lru-cache");

// Instance of the LRU Cache. Stores up to 4096 items.
const lruCache = new LRUCache({
  max: 4096
});

// A sentinel symbol used to store null values, as lru-cache does not support nulls.
const nullSentinel = Symbol("null");

/**
 * Sets a value in the cache for the given key.
 * If the value is null, it is internally stored as `nullSentinel`.
 *
 * @param {string|number} key - The cache key.
 * @param {any} value - The value to be cached.
 * @returns {void}
 */
const setCache = (key, value) => {
  lruCache.set(key, value === null ? nullSentinel : value);
};

/**
 * Retrieves the cached value associated with the given key.
 * If the stored value is `nullSentinel`, it returns null.
 *
 * @param {string|number} key - The cache key.
 * @returns {any|null|undefined} The cached item, undefined if the key does not exist.
 */
const getCache = (key) => {
  const value = lruCache.get(key);
  return value === nullSentinel ? null : value;
};

module.exports = {
  getCache,
  setCache
};
