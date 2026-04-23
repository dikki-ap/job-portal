using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Commands.BulkRejectApplication;

public record BulkRejectApplicationCommand(List<int> ApplicationIds) : IRequest<BulkOperationResultDto>;
