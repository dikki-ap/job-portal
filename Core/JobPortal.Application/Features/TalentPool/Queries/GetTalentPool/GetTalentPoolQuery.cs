using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.TalentPool.Queries.GetTalentPool;

public class GetTalentPoolQuery : IRequest<IEnumerable<TalentPoolEntryDto>>;
