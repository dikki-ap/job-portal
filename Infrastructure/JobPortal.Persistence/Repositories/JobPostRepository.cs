using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Jobs;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class JobPostRepository(ApplicationDbContext context, ICurrentUserService currentUserService) : IJobPostRepository
{
    private static IQueryable<JobPost> WithFullIncludes(IQueryable<JobPost> query)
        => query
            .Include(j => j.JobSteps)
            .Include(j => j.RequiredSkills).ThenInclude(s => s.Skill)
            .Include(j => j.RequiredDocuments).ThenInclude(d => d.DocumentType)
            .Include(j => j.PreferredEducationMajors).ThenInclude(m => m.EducationMajor)
            .Include(j => j.Department)
            .Include(j => j.JobCategory)
            .Include(j => j.JobLevel)
            .Include(j => j.EmploymentType)
            .Include(j => j.WorkMode)
            .Include(j => j.MinEducationLevel)
            .Include(j => j.CurrencyType);

    public async Task<IEnumerable<JobPost>> GetAllAsync(CancellationToken cancellationToken = default)
        => await WithFullIncludes(context.JobPosts)
            .Include(j => j.CreatedByUser)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<JobPost?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await WithFullIncludes(context.JobPosts)
            .Include(j => j.CreatedByUser)
            .FirstOrDefaultAsync(j => j.Id == id, cancellationToken);

    public async Task<JobPost?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
        => await WithFullIncludes(context.JobPosts)
            .FirstOrDefaultAsync(j => j.Slug == slug, cancellationToken);

    public async Task<IEnumerable<JobPost>> GetAllPublishedAsync(CancellationToken cancellationToken = default)
        => await WithFullIncludes(context.JobPosts)
            .Where(j => j.Status == "Published" && (j.PublishDate == null || j.PublishDate <= DateTime.UtcNow))
            .OrderByDescending(j => j.PublishDate)
            .ToListAsync(cancellationToken);

    public async Task<(IEnumerable<JobPost> Items, int TotalCount)> GetPublishedPagedAsync(
        string? search, IReadOnlyList<int>? categoryIds, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var query = WithFullIncludes(context.JobPosts)
            .Where(j => j.Status == "Published" && (j.PublishDate == null || j.PublishDate <= now))
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(j => j.Title.Contains(search) || j.Location.Contains(search));

        if (categoryIds is { Count: > 0 })
            query = query.Where(j => categoryIds.Contains(j.JobCategoryId));

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(j => j.PublishDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<bool> ExistsBySlugAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default)
        => await context.JobPosts.AnyAsync(
            j => j.Slug == slug && (excludeId == null || j.Id != excludeId),
            cancellationToken);

    public async Task<HashSet<int>> GetReferencedJobStepIdsAsync(IEnumerable<int> stepIds, CancellationToken cancellationToken = default)
    {
        var ids = stepIds.ToList();
        if (ids.Count == 0) return [];
        return await context.ApplicationSteps
            .Where(s => ids.Contains(s.JobStepId))
            .Select(s => s.JobStepId)
            .Distinct()
            .ToHashSetAsync(cancellationToken);
    }

    public async Task AddAsync(JobPost jobPost, CancellationToken cancellationToken = default)
        => await context.JobPosts.AddAsync(jobPost, cancellationToken);

    public Task UpdateAsync(JobPost jobPost, CancellationToken cancellationToken = default)
    {
        context.JobPosts.Update(jobPost);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(JobPost jobPost, CancellationToken cancellationToken = default)
    {
        jobPost.IsDeleted = true;
        jobPost.DeletedAt = DateTime.UtcNow;
        jobPost.DeletedByUserId = currentUserService.GetCurrentUserId();
        context.JobPosts.Update(jobPost);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
