using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.TalentPool.Commands.AddToTalentPool;

public record AddToTalentPoolCommand(int ApplicationId, string? Notes) : IRequest<TalentPoolEntryDto>;
