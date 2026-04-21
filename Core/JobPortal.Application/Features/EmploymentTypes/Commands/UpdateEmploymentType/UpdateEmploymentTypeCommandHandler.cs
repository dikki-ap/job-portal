using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EmploymentTypes.Commands.UpdateEmploymentType;

public class UpdateEmploymentTypeCommandHandler(
    IEmploymentTypeRepository repository,
    ICurrentUserService currentUserService,
    ILogger<UpdateEmploymentTypeCommandHandler> logger)
    : IRequestHandler<UpdateEmploymentTypeCommand, EmploymentTypeDto>
{
    public async Task<EmploymentTypeDto> Handle(UpdateEmploymentTypeCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var employmentType = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Employment type with ID {request.Id} not found.");

            employmentType.Name = request.Name;
            employmentType.UpdatedAt = DateTime.UtcNow;
            employmentType.UpdatedByUserId = currentUserService.GetCurrentUserId();
            await repository.UpdateAsync(employmentType, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return new EmploymentTypeDto(
                employmentType.Id, employmentType.Name, employmentType.CreatedAt, employmentType.CreatedByUserId,
                employmentType.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                employmentType.UpdatedAt, employmentType.UpdatedByUserId,
                employmentType.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while updating employment type id={Id}", request.Id);
            throw;
        }
    }
}
