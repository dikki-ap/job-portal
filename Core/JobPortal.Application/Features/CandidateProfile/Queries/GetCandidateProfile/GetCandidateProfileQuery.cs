using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.CandidateProfile.Queries.GetCandidateProfile;

public record GetCandidateProfileQuery : IRequest<CandidateProfileDto?>;
