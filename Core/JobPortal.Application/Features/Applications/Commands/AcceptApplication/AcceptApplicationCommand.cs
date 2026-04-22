using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.AcceptApplication;

public record AcceptApplicationCommand(int Id) : IRequest<ApplicationDto>;
