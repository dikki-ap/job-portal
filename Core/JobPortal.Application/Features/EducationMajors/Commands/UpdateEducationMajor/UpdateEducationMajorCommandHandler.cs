using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EducationMajors.Commands.UpdateEducationMajor;

public class UpdateEducationMajorCommandHandler(
    IEducationMajorRepository repository,
    ICurrentUserService currentUserService,
    IMemoryCache cache,
    ILogger<UpdateEducationMajorCommandHandler> logger)
    : IRequestHandler<UpdateEducationMajorCommand, EducationMajorDto>
{
    public async Task<EducationMajorDto> Handle(UpdateEducationMajorCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var educationMajor = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"Education major with ID {request.Id} not found.");

            educationMajor.Name = request.Name;
            educationMajor.UpdatedAt = DateTime.UtcNow;
            educationMajor.UpdatedByUserId = currentUserService.GetCurrentUserId();
            await repository.UpdateAsync(educationMajor, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            cache.Remove(CacheKeys.EducationMajors);

            return new EducationMajorDto(
                educationMajor.Id, educationMajor.Name,
                educationMajor.CreatedAt, educationMajor.CreatedByUserId,
                educationMajor.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                educationMajor.UpdatedAt, educationMajor.UpdatedByUserId,
                educationMajor.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while updating education major id={Id}", request.Id);
            throw;
        }
    }
}
