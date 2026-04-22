using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;

namespace JobPortal.Persistence.Repositories;

public class ApplicationRepository(ApplicationDbContext context) : IApplicationRepository
{
    public async Task<IEnumerable<ApplicationEntity>> GetAllAsync(
        int? jobPostId = null, string? status = null, CancellationToken cancellationToken = default)
        => await context.Applications
            .Include(a => a.User)
            .Include(a => a.JobPost)
            .Include(a => a.Steps).ThenInclude(s => s.JobStep)
            .Include(a => a.Documents).ThenInclude(d => d.Document)
            .Where(a => !a.IsDeleted)
            .Where(a => jobPostId == null || a.JobPostId == jobPostId)
            .Where(a => status == null || a.Status == status)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync(cancellationToken);

    public async Task<ApplicationEntity?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.Applications
            .Include(a => a.User)
            .Include(a => a.JobPost)
            .Include(a => a.Steps).ThenInclude(s => s.JobStep)
            .Include(a => a.Documents).ThenInclude(d => d.Document)
            .Where(a => !a.IsDeleted)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

    public async Task<IEnumerable<ApplicationEntity>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        => await context.Applications
            .Include(a => a.JobPost)
            .Include(a => a.Steps).ThenInclude(s => s.JobStep)
            .Include(a => a.Documents).ThenInclude(d => d.Document)
            .Where(a => !a.IsDeleted && a.UserId == userId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync(cancellationToken);

    public async Task<IEnumerable<ApplicationEntity>> GetByJobPostIdAsync(int jobPostId, CancellationToken cancellationToken = default)
        => await context.Applications
            .Include(a => a.User)
            .Include(a => a.Steps).ThenInclude(s => s.JobStep)
            .Include(a => a.Documents).ThenInclude(d => d.Document)
            .Where(a => !a.IsDeleted && a.JobPostId == jobPostId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync(cancellationToken);

    public async Task<bool> ExistsAsync(int userId, int jobPostId, CancellationToken cancellationToken = default)
        => await context.Applications.AnyAsync(
            a => !a.IsDeleted && a.UserId == userId && a.JobPostId == jobPostId,
            cancellationToken);

    public async Task AddAsync(ApplicationEntity application, CancellationToken cancellationToken = default)
        => await context.Applications.AddAsync(application, cancellationToken);

    public Task UpdateAsync(ApplicationEntity application, CancellationToken cancellationToken = default)
    {
        context.Applications.Update(application);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
