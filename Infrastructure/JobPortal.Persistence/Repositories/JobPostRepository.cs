using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Jobs;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class JobPostRepository(ApplicationDbContext context, ICurrentUserService currentUserService) : IJobPostRepository
{
    public async Task<IEnumerable<JobPost>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.JobPosts
            .Include(j => j.JobSteps)
            .Include(j => j.RequiredSkills)
            .Include(j => j.Department)
            .Include(j => j.JobCategory)
            .Include(j => j.JobLevel)
            .Include(j => j.EmploymentType)
            .Include(j => j.WorkMode)
            .Include(j => j.MinEducationLevel)
            .Include(j => j.CurrencyType)
            .Include(j => j.CreatedByUser)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<JobPost?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.JobPosts
            .Include(j => j.JobSteps)
            .Include(j => j.RequiredSkills)
            .Include(j => j.Department)
            .Include(j => j.JobCategory)
            .Include(j => j.JobLevel)
            .Include(j => j.EmploymentType)
            .Include(j => j.WorkMode)
            .Include(j => j.MinEducationLevel)
            .Include(j => j.CurrencyType)
            .Include(j => j.CreatedByUser)
            .FirstOrDefaultAsync(j => j.Id == id, cancellationToken);

    public async Task<JobPost?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
        => await context.JobPosts
            .Include(j => j.JobSteps)
            .Include(j => j.RequiredSkills)
            .Include(j => j.Department)
            .Include(j => j.JobCategory)
            .Include(j => j.JobLevel)
            .Include(j => j.EmploymentType)
            .Include(j => j.WorkMode)
            .Include(j => j.MinEducationLevel)
            .Include(j => j.CurrencyType)
            .FirstOrDefaultAsync(j => j.Slug == slug, cancellationToken);

    public async Task<IEnumerable<JobPost>> GetAllPublishedAsync(CancellationToken cancellationToken = default)
        => await context.JobPosts
            .Include(j => j.JobSteps)
            .Include(j => j.RequiredSkills)
            .Include(j => j.Department)
            .Include(j => j.JobCategory)
            .Include(j => j.JobLevel)
            .Include(j => j.EmploymentType)
            .Include(j => j.WorkMode)
            .Include(j => j.MinEducationLevel)
            .Include(j => j.CurrencyType)
            .Where(j => j.Status == "Published")
            .OrderByDescending(j => j.PublishDate)
            .ToListAsync(cancellationToken);

    public async Task<bool> ExistsBySlugAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default)
        => await context.JobPosts.AnyAsync(
            j => j.Slug == slug && (excludeId == null || j.Id != excludeId),
            cancellationToken);

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
