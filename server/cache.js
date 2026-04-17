import NodeCache from "node-cache";

// Cache with 15-minute default TTL
const cache = new NodeCache({
  stdTTL: 900, // 15 minutes
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false,
});

/**
 * Get data from cache or fetch it using the provided function
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Async function to fetch data if not cached
 * @param {number} ttl - Optional custom TTL in seconds
 */
export async function cachedFetch(key, fetchFn, ttl = null) {
  const cached = cache.get(key);
  if (cached) {
    console.log(`📦 Cache hit: ${key}`);
    return cached;
  }

  console.log(`🔄 Cache miss: ${key}`);
  const data = await fetchFn();

  if (ttl) {
    cache.set(key, data, ttl);
  } else {
    cache.set(key, data);
  }

  return data;
}

/**
 * Invalidate a specific cache key
 */
export function invalidateCache(key) {
  cache.del(key);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return cache.getStats();
}
