using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.RateApplication;

public record RateApplicationCommand(int ApplicationId, int Rating, string? Note) : IRequest<ApplicationDto>;
