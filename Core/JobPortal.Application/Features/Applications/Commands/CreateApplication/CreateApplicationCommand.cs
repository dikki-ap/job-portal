using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.CreateApplication;

public record DocumentInput(int DocumentId, string DocumentTypeName);

public record CreateApplicationCommand(int JobPostId, IReadOnlyList<DocumentInput> Documents) : IRequest<ApplicationDto>;
