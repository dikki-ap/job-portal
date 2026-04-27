using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.RateApplication;

public class RateApplicationCommandHandler(
    IApplicationRepository repository,
    ICurrentUserService currentUser)
    : IRequestHandler<RateApplicationCommand, ApplicationDto>
{
    public async Task<ApplicationDto> Handle(RateApplicationCommand request, CancellationToken cancellationToken)
    {
        if (request.Rating is < 1 or > 10)
            throw new InvalidOperationException("Rating must be between 1 and 10.");

        var app = await repository.GetByIdAsync(request.ApplicationId, cancellationToken)
            ?? throw new KeyNotFoundException($"Application {request.ApplicationId} not found.");

        app.Rating = request.Rating;
        app.RatingNote = request.Note?.Trim();
        app.RatedAt = DateTime.UtcNow;
        app.RatedByUserId = currentUser.GetCurrentUserId();

        await repository.UpdateAsync(app, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return GetAllApplicationsQueryHandler.MapToDto(app);
    }
}
