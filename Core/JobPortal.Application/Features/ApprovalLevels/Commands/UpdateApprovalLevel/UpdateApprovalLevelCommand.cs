using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.ApprovalLevels.Commands.UpdateApprovalLevel;

public record UpdateApprovalLevelCommand(
    int Id,
    string Name,
    int LevelOrder,
    string ApproverName,
    string ApproverEmail,
    bool IsActive) : IRequest<ApprovalLevelDto>;
