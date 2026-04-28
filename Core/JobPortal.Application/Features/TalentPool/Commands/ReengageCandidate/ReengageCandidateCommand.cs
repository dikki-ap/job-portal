using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.TalentPool.Commands.ReengageCandidate;

public record ReengageCandidateCommand(int TalentPoolEntryId, int JobPostId) : IRequest<ApplicationDto>;
