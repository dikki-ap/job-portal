using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.BulkAcceptDepartmentApplication;

public record BulkAcceptDepartmentApplicationCommand(
    List<int> ApplicationIds,
    IReadOnlyList<int> DepartmentIds) : IRequest<BulkOperationResultDto>;
