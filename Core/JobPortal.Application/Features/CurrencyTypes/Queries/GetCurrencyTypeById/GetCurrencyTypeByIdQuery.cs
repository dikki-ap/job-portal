using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.CurrencyTypes.Queries.GetCurrencyTypeById;

public record GetCurrencyTypeByIdQuery(int Id) : IRequest<CurrencyTypeDto?>;
