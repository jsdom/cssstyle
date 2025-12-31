"use strict";

const { LRUCache } = require("lru-cache");

// Instance of the LRU Cache. Stores up to 4096 items.
const lruCache = new LRUCache({
  max: 4096
});

/**
 * Sets a value in the cache for the given key.
 *
 * @param {string|number} key - The cache key.
 * @param {any} value - The value to be cached.
 * @returns {void}
 */
const setCache = (key, value) => {
  lruCache.set(key, value);
};

/**
 * Retrieves the cached value associated with the given key.
 * If the stored value is `nullSentinel`, it returns null.
 *
 * @param {string|number} key - The cache key.
 * @returns {any|undefined} The cached item, undefined if the key does not exist.
 */
const getCache = (key) => {
  return lruCache.get(key);
};

module.exports = {
  getCache,
  setCache
};
