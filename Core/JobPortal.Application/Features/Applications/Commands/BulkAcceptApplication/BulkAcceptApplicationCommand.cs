using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.BulkAcceptApplication;

public record BulkAcceptApplicationCommand(List<int> ApplicationIds) : IRequest<BulkOperationResultDto>;
