const NodeCache = require('node-cache');

// Cache with 5 minute default TTL
const cache = new NodeCache({
    stdTTL: 300,        // 5 minutes
    checkperiod: 60,    // Check for expired keys every 60s
    useClones: false,   // Better performance
});

cache.on('expired', (key) => {
    console.log(`Cache expired: ${key}`);
});

// ─── Cache Helpers ────────────────────────────────────────────

/**
 * Get from cache
 * @param {string} key
 * @returns {any|null}
 */
const getCache = (key) => {
    const value = cache.get(key);
    if (value !== undefined) {
        console.log(`Cache HIT: ${key}`);
        return value;
    }
    console.log(`Cache MISS: ${key}`);
    return null;
};

/**
 * Set cache
 * @param {string} key
 * @param {any} value
 * @param {number} ttl - seconds (optional, uses default if not provided)
 */
const setCache = (key, value, ttl) => {
    if (ttl !== undefined) {
        cache.set(key, value, ttl);
    } else {
        cache.set(key, value);
    }
};

/**
 * Delete specific cache key
 * @param {string} key
 */
const deleteCache = (key) => {
    cache.del(key);
    console.log(`Cache deleted: ${key}`);
};

/**
 * Delete all cache keys matching a pattern (prefix)
 * @param {string} prefix
 */
const deleteCacheByPrefix = (prefix) => {
    const keys = cache.keys();
    const matchingKeys = keys.filter((key) => key.startsWith(prefix));
    if (matchingKeys.length > 0) {
        cache.del(matchingKeys);
        console.log(`Cache deleted (prefix: ${prefix}):`, matchingKeys);
    }
};

/**
 * Flush all cache
 */
const flushCache = () => {
    cache.flushAll();
    console.log('Cache flushed');
};

/**
 * Get cache stats
 */
const getCacheStats = () => cache.getStats();

module.exports = {
    getCache,
    setCache,
    deleteCache,
    deleteCacheByPrefix,
    flushCache,
    getCacheStats,
};