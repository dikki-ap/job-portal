using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Masters;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EducationMajors.Commands.CreateEducationMajor;

public class CreateEducationMajorCommandHandler(
    IEducationMajorRepository repository,
    ICurrentUserService currentUserService,
    IMemoryCache cache,
    ILogger<CreateEducationMajorCommandHandler> logger)
    : IRequestHandler<CreateEducationMajorCommand, EducationMajorDto>
{
    public async Task<EducationMajorDto> Handle(CreateEducationMajorCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var educationMajor = new EducationMajor
            {
                Name = request.Name,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = currentUserService.GetCurrentUserId() ?? 0,
            };
            await repository.AddAsync(educationMajor, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);
            cache.Remove(CacheKeys.EducationMajors);

            return new EducationMajorDto(
                educationMajor.Id, educationMajor.Name,
                educationMajor.CreatedAt, educationMajor.CreatedByUserId, null,
                null, null, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while creating education major name={Name}", request.Name);
            throw;
        }
    }
}
