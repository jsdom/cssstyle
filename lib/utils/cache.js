"use strict";

const { LRUCache } = require("lru-cache");

// The lru-cache instance.
const lruCache = new LRUCache({
  max: 4096
});

// The lru-cache requires non-null values, so substitute in this sentinel when we are given one.
const nullSentinel = Symbol("null");

/**
 * @param key - Cache key.
 * @param value - Value to cache.
 * @returns void.
 */
const setCache = (key, value) => {
  lruCache.set(key, value === null ? nullSentinel : value);
};

/**
 * @param key - Cache key.
 * @returns Cached item or false otherwise.
 */
const getCache = (key) => {
  const value = lruCache.get(key);
  return value === nullSentinel ? null : value;
};

module.exports = {
  getCache,
  setCache
};
