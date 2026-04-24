using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobPosts.Queries.IsApprover;

public class IsApproverQueryHandler(
    IApprovalLevelRepository approvalLevelRepository,
    ICurrentUserService currentUserService,
    ILogger<IsApproverQueryHandler> logger)
    : IRequestHandler<IsApproverQuery, bool>
{
    public async Task<bool> Handle(IsApproverQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var email = currentUserService.GetCurrentUserEmail() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(email)) return false;
            return await approvalLevelRepository.AnyActiveForEmailAsync(email, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error checking approver status");
            throw;
        }
    }
}
