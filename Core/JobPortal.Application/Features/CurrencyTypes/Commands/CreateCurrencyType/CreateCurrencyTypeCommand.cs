using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.CurrencyTypes.Commands.CreateCurrencyType;

public record CreateCurrencyTypeCommand(string Name, string Prefix) : IRequest<CurrencyTypeDto>;
