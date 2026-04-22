using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.RejectApplication;

public record RejectApplicationCommand(int Id) : IRequest<ApplicationDto>;
