using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.BulkUpdateDepartmentApplicationStep;

public record BulkUpdateDepartmentApplicationStepCommand(
    List<int> ApplicationIds,
    string Action,
    IReadOnlyList<int> DepartmentIds) : IRequest<BulkOperationResultDto>;
