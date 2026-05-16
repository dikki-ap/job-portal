using Microsoft.Extensions.Caching.Memory;

namespace JobPortal.Application.Common;

public static class CacheEntry
{
    public static MemoryCacheEntryOptions Default(TimeSpan ttl) =>
        new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(ttl)
            .SetSize(1);

    // Version/counter keys: never evicted, not counted toward SizeLimit.
    public static MemoryCacheEntryOptions Permanent() =>
        new MemoryCacheEntryOptions()
            .SetPriority(CacheItemPriority.NeverRemove)
            .SetSize(0);
}
