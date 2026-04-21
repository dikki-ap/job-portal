using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.CurrencyTypes.Queries.GetAllCurrencyTypes;

public record GetAllCurrencyTypesQuery : IRequest<IEnumerable<CurrencyTypeDto>>;
