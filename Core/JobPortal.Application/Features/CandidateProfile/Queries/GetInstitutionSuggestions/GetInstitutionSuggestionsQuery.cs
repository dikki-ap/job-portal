using MediatR;

namespace JobPortal.Application.Features.CandidateProfile.Queries.GetInstitutionSuggestions;

public record GetInstitutionSuggestionsQuery(string Q) : IRequest<List<string>>;
