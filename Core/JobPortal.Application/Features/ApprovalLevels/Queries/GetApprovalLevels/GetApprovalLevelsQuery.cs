using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.ApprovalLevels.Queries.GetApprovalLevels;

public record GetApprovalLevelsQuery : IRequest<IEnumerable<ApprovalLevelDto>>;
