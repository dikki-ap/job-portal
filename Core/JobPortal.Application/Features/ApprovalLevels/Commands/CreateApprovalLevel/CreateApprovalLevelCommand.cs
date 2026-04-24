using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.ApprovalLevels.Commands.CreateApprovalLevel;

public record CreateApprovalLevelCommand(
    string Name,
    int LevelOrder,
    string ApproverName,
    string ApproverEmail,
    bool IsActive) : IRequest<ApprovalLevelDto>;
