using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.BulkRejectDepartmentApplication;

public record BulkRejectDepartmentApplicationCommand(
    List<int> ApplicationIds,
    IReadOnlyList<int> DepartmentIds) : IRequest<BulkOperationResultDto>;
