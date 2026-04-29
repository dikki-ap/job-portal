using JobPortal.Application.Interfaces.Repositories;
using MediatR;

namespace JobPortal.Application.Features.CandidateProfile.Queries.GetInstitutionSuggestions;

public class GetInstitutionSuggestionsQueryHandler(IUserProfileRepository repository)
    : IRequestHandler<GetInstitutionSuggestionsQuery, List<string>>
{
    public Task<List<string>> Handle(GetInstitutionSuggestionsQuery request, CancellationToken cancellationToken)
        => repository.GetInstitutionSuggestionsAsync(request.Q, cancellationToken);
}
