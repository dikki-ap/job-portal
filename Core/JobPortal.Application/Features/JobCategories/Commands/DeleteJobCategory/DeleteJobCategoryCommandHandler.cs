using JobPortal.Application.Common;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.JobCategories.Commands.DeleteJobCategory;

public class DeleteJobCategoryCommandHandler(
    IJobCategoryRepository repository,
    IMemoryCache cache,
    ILogger<DeleteJobCategoryCommandHandler> logger)
    : IRequestHandler<DeleteJobCategoryCommand, Unit>
{
    public async Task<Unit> Handle(DeleteJobCategoryCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var jobCategory = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Job category with ID {request.Id} not found.");
            await repository.DeleteAsync(jobCategory, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            cache.Remove(CacheKeys.JobCategories);
            return Unit.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while deleting job category id={Id}", request.Id);
            throw;
        }
    }
}
