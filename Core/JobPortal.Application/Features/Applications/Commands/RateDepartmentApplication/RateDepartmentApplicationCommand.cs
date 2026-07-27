using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.RateDepartmentApplication;

public record RateDepartmentApplicationCommand(int ApplicationId, int Rating, string? Note) : IRequest<ApplicationDto>;
