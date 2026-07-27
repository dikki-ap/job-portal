using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.RateDepartmentApplication;

public class RateDepartmentApplicationCommandHandler(
    IApplicationRepository repository,
    ICurrentUserService currentUser)
    : IRequestHandler<RateDepartmentApplicationCommand, ApplicationDto>
{
    public async Task<ApplicationDto> Handle(RateDepartmentApplicationCommand request, CancellationToken cancellationToken)
    {
        if (request.Rating is < 1 or > 10)
            throw new InvalidOperationException("Rating must be between 1 and 10.");

        var app = await repository.GetByIdAsync(request.ApplicationId, cancellationToken)
            ?? throw new KeyNotFoundException($"Application {request.ApplicationId} not found.");

        app.DmRating = request.Rating;
        app.DmRatingNote = request.Note?.Trim();
        app.DmRatedAt = DateTime.UtcNow;
        app.DmRatedByUserId = currentUser.GetCurrentUserId();

        await repository.UpdateAsync(app, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return GetAllApplicationsQueryHandler.MapToDto(app);
    }
}
