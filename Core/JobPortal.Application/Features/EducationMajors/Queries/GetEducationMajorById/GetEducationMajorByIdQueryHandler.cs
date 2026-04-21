using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EducationMajors.Queries.GetEducationMajorById;

public class GetEducationMajorByIdQueryHandler(IEducationMajorRepository repository, ILogger<GetEducationMajorByIdQueryHandler> logger)
    : IRequestHandler<GetEducationMajorByIdQuery, EducationMajorDto?>
{
    public async Task<EducationMajorDto?> Handle(GetEducationMajorByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var m = await repository.GetByIdAsync(request.Id, cancellationToken);
            if (m is null) return null;
            return new EducationMajorDto(
                m.Id, m.Name, m.CreatedAt, m.CreatedByUserId,
                m.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                m.UpdatedAt, m.UpdatedByUserId,
                m.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting education major id={Id}", request.Id);
            throw;
        }
    }
}
