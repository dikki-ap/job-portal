namespace JobPortal.Web.Extensions;

/// <summary>
/// Configures the in-process memory cache used to store branding settings,
/// master data lists (departments, skills, etc.), published job slugs, and
/// version counters for cache-busting.
///
/// Cache sizing strategy:
///   Every data entry calls SetSize(1); version counters call SetSize(0).
///   With SizeLimit = 1000 the cache can hold up to 1 000 sized entries before
///   the runtime triggers compaction. At 25 % compaction, 250 entries are evicted
///   (oldest / lowest priority first) each time the limit is reached.
///
///   Current entry budget:
///     - ~12 master-data lists      → 12 units
///     - Published countries list   → 1 unit
///     - Job slug cache (per slug)  → 1 unit each (bounded by published job count)
///     - Branding settings          → 1 unit
///     - Version counter            → 0 units (NeverRemove, SizeLimit 0)
///   Total for a typical deployment is well under 200 units, leaving 800 units
///   of headroom for slug entries before compaction kicks in.
/// </summary>
public static class MemoryCacheExtensions
{
    /// <summary>
    /// Registers <see cref="Microsoft.Extensions.Caching.Memory.IMemoryCache"/> with a
    /// bounded size limit and a compaction percentage so that memory growth is predictable
    /// in a single-process deployment without Redis or distributed cache.
    /// </summary>
    public static IServiceCollection AddMemoryCacheWithDefaults(this IServiceCollection services)
    {
        services.AddMemoryCache(options =>
        {
            // Maximum number of cache size units before compaction is triggered.
            // Each data entry contributes 1 unit; version counters contribute 0.
            options.SizeLimit = 1000;

            // When the size limit is reached, evict 25 % of entries (250 units)
            // starting with the least-recently-used and lowest-priority items.
            options.CompactionPercentage = 0.25;
        });

        return services;
    }
}
