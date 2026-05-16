using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Masters;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EmploymentTypes.Commands.CreateEmploymentType;

public class CreateEmploymentTypeCommandHandler(
    IEmploymentTypeRepository repository,
    ICurrentUserService currentUserService,
    IMemoryCache cache,
    ILogger<CreateEmploymentTypeCommandHandler> logger)
    : IRequestHandler<CreateEmploymentTypeCommand, EmploymentTypeDto>
{
    public async Task<EmploymentTypeDto> Handle(CreateEmploymentTypeCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var employmentType = new EmploymentType
            {
                Name = request.Name,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserService.GetCurrentUserId() ?? 0,
            };
            await repository.AddAsync(employmentType, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            cache.Remove(CacheKeys.EmploymentTypes);
            return new EmploymentTypeDto(employmentType.Id, employmentType.Name, employmentType.CreatedAt, employmentType.CreatedByUserId, null, null, null, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while creating employment type name={Name}", request.Name);
            throw;
        }
    }
}
