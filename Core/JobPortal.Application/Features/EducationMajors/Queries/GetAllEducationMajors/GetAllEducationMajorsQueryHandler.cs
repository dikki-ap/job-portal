using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EducationMajors.Queries.GetAllEducationMajors;

public class GetAllEducationMajorsQueryHandler(IEducationMajorRepository repository, ILogger<GetAllEducationMajorsQueryHandler> logger)
    : IRequestHandler<GetAllEducationMajorsQuery, IEnumerable<EducationMajorDto>>
{
    public async Task<IEnumerable<EducationMajorDto>> Handle(GetAllEducationMajorsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var items = await repository.GetAllAsync(cancellationToken);
            return items.Select(m => new EducationMajorDto(
                m.Id, m.Name, m.CreatedAt, m.CreatedByUserId,
                m.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                m.UpdatedAt, m.UpdatedByUserId,
                m.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all education majors");
            throw;
        }
    }
}
