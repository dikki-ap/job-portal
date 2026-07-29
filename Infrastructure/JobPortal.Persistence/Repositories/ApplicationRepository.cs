using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ApplicationEntity = JobPortal.Domain.Entities.Applications.Application;

namespace JobPortal.Persistence.Repositories;

public class ApplicationRepository(
    ApplicationDbContext context,
    ILogger<ApplicationRepository> logger) : IApplicationRepository
{
    private const int ExportCeiling = 10_000;

    public async Task<IEnumerable<ApplicationEntity>> GetAllAsync(
        int? jobPostId = null, string? status = null, CancellationToken cancellationToken = default)
    {
        var results = await context.Applications
            .Include(a => a.User).ThenInclude(u => u.Profile)
            .Include(a => a.JobPost)
            .Include(a => a.Steps).ThenInclude(s => s.JobStep)
            .Include(a => a.Documents).ThenInclude(d => d.Document)
            .Where(a => !a.IsDeleted)
            .Where(a => jobPostId == null || a.JobPostId == jobPostId)
            .Where(a => status == null || a.Status == status)
            .OrderByDescending(a => a.AppliedAt)
            .Take(ExportCeiling)
            .ToListAsync(cancellationToken);

        if (results.Count == ExportCeiling)
            logger.LogWarning("GetAllAsync hit export ceiling of {Ceiling} rows — some records omitted", ExportCeiling);

        return results;
    }

    public async Task<ApplicationEntity?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await context.Applications
            .Include(a => a.User).ThenInclude(u => u.Profile)
            .Include(a => a.JobPost)
            .Include(a => a.Steps).ThenInclude(s => s.JobStep)
            .Include(a => a.Documents).ThenInclude(d => d.Document)
            .Where(a => !a.IsDeleted)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

    public async Task<ApplicationEntity?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
        => await context.Applications
            .Include(a => a.User).ThenInclude(u => u.Profile).ThenInclude(p => p!.EducationLevel)
            .Include(a => a.User).ThenInclude(u => u.Profile).ThenInclude(p => p!.EducationMajor)
            .Include(a => a.JobPost).ThenInclude(j => j.Department)
            .Include(a => a.JobPost).ThenInclude(j => j.WorkMode)
            .Include(a => a.JobPost).ThenInclude(j => j.EmploymentType)
            .Include(a => a.JobPost).ThenInclude(j => j.JobLevel)
            .Include(a => a.Steps).ThenInclude(s => s.JobStep)
            .Include(a => a.Documents).ThenInclude(d => d.Document)
            .Where(a => !a.IsDeleted)
            .FirstOrDefaultAsync(a => a.Code == code, cancellationToken);

    public async Task<List<ApplicationEntity>> GetByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken = default)
    {
        var idList = ids.ToList();
        return await context.Applications
            .Include(a => a.User).ThenInclude(u => u.Profile)
            .Include(a => a.JobPost)
            .Include(a => a.Steps).ThenInclude(s => s.JobStep)
            .Where(a => !a.IsDeleted && idList.Contains(a.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ApplicationEntity>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        => await context.Applications
            .Include(a => a.JobPost).ThenInclude(j => j.Department)
            .Include(a => a.JobPost).ThenInclude(j => j.WorkMode)
            .Include(a => a.JobPost).ThenInclude(j => j.EmploymentType)
            .Include(a => a.JobPost).ThenInclude(j => j.JobLevel)
            .Include(a => a.Steps).ThenInclude(s => s.JobStep)
            .Include(a => a.Documents).ThenInclude(d => d.Document)
            .Where(a => !a.IsDeleted && a.UserId == userId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync(cancellationToken);

    public async Task<IEnumerable<ApplicationEntity>> GetAllByDepartmentAsync(
        IReadOnlyList<int> departmentIds, int? jobPostId = null, string? status = null, int? departmentId = null, CancellationToken cancellationToken = default)
    {
        var results = await context.Applications
            .Include(a => a.User).ThenInclude(u => u.Profile)
            .Include(a => a.JobPost).ThenInclude(j => j.Department)
            .Include(a => a.JobPost).ThenInclude(j => j.EmploymentType)
            .Include(a => a.JobPost).ThenInclude(j => j.WorkMode)
            .Include(a => a.JobPost).ThenInclude(j => j.JobLevel)
            .Include(a => a.Steps).ThenInclude(s => s.JobStep)
            .Include(a => a.Documents).ThenInclude(d => d.Document)
            .Where(a => !a.IsDeleted && departmentIds.Contains(a.JobPost!.DepartmentId))
            .Where(a => departmentId == null || a.JobPost!.DepartmentId == departmentId)
            .Where(a => jobPostId == null || a.JobPostId == jobPostId)
            .Where(a => status == null || a.Status == status)
            .OrderByDescending(a => a.AppliedAt)
            .Take(ExportCeiling)
            .ToListAsync(cancellationToken);

        if (results.Count == ExportCeiling)
            logger.LogWarning("GetAllByDepartmentAsync hit export ceiling of {Ceiling} rows — some records omitted", ExportCeiling);

        return results;
    }

    public async Task<IEnumerable<ApplicationEntity>> GetByJobPostIdAsync(int jobPostId, CancellationToken cancellationToken = default)
        => await context.Applications
            .Include(a => a.User)
            .Include(a => a.Steps).ThenInclude(s => s.JobStep)
            .Include(a => a.Documents).ThenInclude(d => d.Document)
            .Where(a => !a.IsDeleted && a.JobPostId == jobPostId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync(cancellationToken);

    public async Task<(IEnumerable<ApplicationEntity> Items, int TotalCount)> GetPagedAsync(
        int? jobPostId, string? status, string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = context.Applications
            .Include(a => a.User).ThenInclude(u => u.Profile)
            .Include(a => a.JobPost).ThenInclude(j => j.Department)
            .Include(a => a.Steps).ThenInclude(s => s.JobStep)
            .Where(a => !a.IsDeleted)
            .Where(a => jobPostId == null || a.JobPostId == jobPostId)
            .Where(a => status == null || a.Status == status)
            .Where(a => search == null ||
                (a.User.FirstName + " " + a.User.LastName).Contains(search) ||
                a.User.Email.Contains(search))
            .OrderByDescending(a => a.AppliedAt);

        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return (items, total);
    }

    public async Task<(IEnumerable<ApplicationEntity> Items, int TotalCount)> GetPagedByDepartmentAsync(
        IReadOnlyList<int> departmentIds, int? jobPostId, string? status, string? search, int page, int pageSize, int? departmentId = null, CancellationToken cancellationToken = default)
    {
        var query = context.Applications
            .Include(a => a.User).ThenInclude(u => u.Profile)
            .Include(a => a.JobPost).ThenInclude(j => j.Department)
            .Include(a => a.JobPost).ThenInclude(j => j.EmploymentType)
            .Include(a => a.JobPost).ThenInclude(j => j.WorkMode)
            .Include(a => a.JobPost).ThenInclude(j => j.JobLevel)
            .Include(a => a.Steps).ThenInclude(s => s.JobStep)
            .Where(a => !a.IsDeleted && departmentIds.Contains(a.JobPost!.DepartmentId))
            .Where(a => departmentId == null || a.JobPost!.DepartmentId == departmentId)
            .Where(a => jobPostId == null || a.JobPostId == jobPostId)
            .Where(a => status == null || a.Status == status)
            .Where(a => search == null ||
                (a.User.FirstName + " " + a.User.LastName).Contains(search) ||
                a.User.Email.Contains(search))
            .OrderByDescending(a => a.AppliedAt);

        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return (items, total);
    }

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

    // --- Bulk operations ---

    public async Task<int> BulkRejectAsync(IEnumerable<int> appIds, DateTime updatedAt, CancellationToken cancellationToken = default)
    {
        var ids = appIds.ToList();
        return await context.Applications
            .Where(a => ids.Contains(a.Id) && !a.IsDeleted
                     && a.Status != ApplicationStatus.Accepted
                     && a.Status != ApplicationStatus.Rejected)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Status, ApplicationStatus.Rejected)
                .SetProperty(x => x.UpdatedAt, updatedAt),
                cancellationToken);
    }

    public async Task<int> BulkAcceptAsync(IEnumerable<int> appIds, DateTime updatedAt, CancellationToken cancellationToken = default)
    {
        var ids = appIds.ToList();
        return await context.Applications
            .Where(a => ids.Contains(a.Id) && !a.IsDeleted
                     && a.Status != ApplicationStatus.Accepted
                     && a.Status != ApplicationStatus.Rejected)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Status, ApplicationStatus.Accepted)
                .SetProperty(x => x.UpdatedAt, updatedAt),
                cancellationToken);
    }

    public async Task BulkSetInReviewAsync(IEnumerable<int> appIds, DateTime updatedAt, CancellationToken cancellationToken = default)
    {
        var ids = appIds.ToList();
        await context.Applications
            .Where(a => ids.Contains(a.Id) && !a.IsDeleted && a.Status == ApplicationStatus.Pending)
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Status, ApplicationStatus.InReview)
                .SetProperty(x => x.UpdatedAt, updatedAt),
                cancellationToken);
    }

    public async Task BulkPassStepsAsync(IEnumerable<int> stepIds, DateTime completedAt, int? completedByUserId, string? completedByName, CancellationToken cancellationToken = default)
    {
        var ids = stepIds.ToList();
        await context.ApplicationSteps
            .Where(s => ids.Contains(s.Id))
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Status, ApplicationStepStatus.Passed)
                .SetProperty(x => x.CompletedAt, completedAt)
                .SetProperty(x => x.CompletedByUserId, completedByUserId)
                .SetProperty(x => x.CompletedByName, completedByName),
                cancellationToken);
    }

    public async Task BulkFailStepsAsync(IEnumerable<int> stepIds, DateTime completedAt, int? completedByUserId, string? completedByName, CancellationToken cancellationToken = default)
    {
        var ids = stepIds.ToList();
        await context.ApplicationSteps
            .Where(s => ids.Contains(s.Id))
            .ExecuteUpdateAsync(s => s
                .SetProperty(x => x.Status, ApplicationStepStatus.Failed)
                .SetProperty(x => x.CompletedAt, completedAt)
                .SetProperty(x => x.CompletedByUserId, completedByUserId)
                .SetProperty(x => x.CompletedByName, completedByName),
                cancellationToken);
    }

    public async Task ExecuteInTransactionAsync(Func<Task> action, CancellationToken cancellationToken = default)
    {
        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await action();
            await tx.CommitAsync(cancellationToken);
        }
        catch
        {
            await tx.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<IEnumerable<ApplicationAnalyticsDto>> GetForAnalyticsAsync(CancellationToken ct = default)
        => await context.Applications
            .Where(a => !a.IsDeleted)
            .Select(a => new ApplicationAnalyticsDto(
                a.AppliedAt.ToString("o"),
                a.UpdatedAt.ToString("o"),
                a.Status,
                a.Source,
                a.JobPost!.Title,
                a.Steps.Select(s => new StepAnalyticsDto(s.StepName, s.StepOrder, s.Status)).ToList()
            ))
            .ToListAsync(ct);

    public async Task<bool> IsInDepartmentScopeAsync(
        int applicationId, IReadOnlyList<int> departmentIds, CancellationToken ct = default)
        => await context.Applications
            .Where(a => a.Id == applicationId && !a.IsDeleted)
            .Where(a => departmentIds.Contains(a.JobPost!.DepartmentId))
            .AnyAsync(ct);

    public async Task<bool> AreDocumentsOwnedByUserAsync(
        IReadOnlyList<int> documentIds, int userId, CancellationToken ct = default)
        => await context.Documents
            .Where(d => documentIds.Contains(d.Id))
            .AllAsync(d => d.CreatedByUserId == userId, ct);

    public Task<bool> CodeExistsAsync(string code, CancellationToken ct = default)
        => context.Applications.IgnoreQueryFilters().AnyAsync(a => a.Code == code, ct);
}
