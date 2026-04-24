const cache = require('../src/services/cacheService');

beforeEach(() => cache.flush());

describe('CacheService', () => {
  it('should store and retrieve a value', () => {
    cache.set('test:1', { foo: 'bar' });
    expect(cache.get('test:1')).toEqual({ foo: 'bar' });
  });

  it('should return null for missing key', () => {
    expect(cache.get('missing')).toBeNull();
  });

  it('should expire entries after TTL', async () => {
    cache.set('test:ttl', 'expire-me', 50); // 50ms TTL
    await new Promise((r) => setTimeout(r, 100));
    expect(cache.get('test:ttl')).toBeNull();
  });

  it('should invalidate by prefix', () => {
    cache.set('summary:user1:all', { a: 1 });
    cache.set('summary:user1:filtered', { b: 2 });
    cache.set('summary:user2:all', { c: 3 });

    cache.invalidatePrefix('summary:user1');

    expect(cache.get('summary:user1:all')).toBeNull();
    expect(cache.get('summary:user1:filtered')).toBeNull();
    expect(cache.get('summary:user2:all')).toEqual({ c: 3 });
  });

  it('should flush all entries', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.flush();
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
  });
});
