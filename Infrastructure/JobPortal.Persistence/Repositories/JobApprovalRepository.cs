using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Jobs;
using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Persistence.Repositories;

public class JobApprovalRepository(ApplicationDbContext context) : IJobApprovalRepository
{
    public async Task<JobApprovalInstance?> GetActiveInstanceByJobPostIdAsync(int jobPostId, CancellationToken cancellationToken = default)
        => await context.JobApprovalInstances
            .Include(i => i.Steps)
            .Include(i => i.JobPost)
                .ThenInclude(j => j.Department)
            .Include(i => i.JobPost)
                .ThenInclude(j => j.JobLevel)
            .Include(i => i.JobPost)
                .ThenInclude(j => j.JobCategory)
            .Include(i => i.JobPost)
                .ThenInclude(j => j.WorkMode)
            .Include(i => i.JobPost)
                .ThenInclude(j => j.EmploymentType)
            .Include(i => i.JobPost)
                .ThenInclude(j => j.MinEducationLevel)
            .Include(i => i.JobPost)
                .ThenInclude(j => j.CurrencyType)
            .Where(i => i.JobPostId == jobPostId && i.Status == "InProgress")
            .OrderByDescending(i => i.StartedAt)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<JobApprovalInstance?> GetLatestInstanceByJobPostIdAsync(int jobPostId, CancellationToken cancellationToken = default)
        => await context.JobApprovalInstances
            .Include(i => i.Steps)
            .Where(i => i.JobPostId == jobPostId)
            .OrderByDescending(i => i.StartedAt)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IEnumerable<JobApprovalInstance>> GetPendingInstancesForApproverAsync(string approverEmail, CancellationToken cancellationToken = default)
        => await context.JobApprovalInstances
            .Include(i => i.Steps)
            .Include(i => i.JobPost)
                .ThenInclude(j => j.Department)
            .Where(i => i.Status == "InProgress"
                && i.Steps.Any(s => s.StepOrder == i.CurrentStepOrder
                    && s.Status == "Pending"
                    && s.ApproverEmail == approverEmail))
            .OrderByDescending(i => i.StartedAt)
            .ToListAsync(cancellationToken);

    public async Task AddInstanceAsync(JobApprovalInstance instance, CancellationToken cancellationToken = default)
        => await context.JobApprovalInstances.AddAsync(instance, cancellationToken);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);
}
