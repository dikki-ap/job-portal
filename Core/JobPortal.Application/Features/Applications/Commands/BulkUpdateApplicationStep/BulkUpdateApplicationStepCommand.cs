using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.BulkUpdateApplicationStep;

public record BulkUpdateApplicationStepCommand(
    List<int> ApplicationIds,
    string Action) : IRequest<BulkOperationResultDto>;
