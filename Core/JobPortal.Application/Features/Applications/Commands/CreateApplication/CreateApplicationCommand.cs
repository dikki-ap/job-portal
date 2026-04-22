using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.CreateApplication;

public record CreateApplicationCommand(int JobPostId, IReadOnlyList<int> DocumentIds) : IRequest<ApplicationDto>;
