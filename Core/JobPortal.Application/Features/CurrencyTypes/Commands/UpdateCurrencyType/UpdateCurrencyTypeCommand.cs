using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.CurrencyTypes.Commands.UpdateCurrencyType;

public record UpdateCurrencyTypeCommand(int Id, string Name, string Prefix) : IRequest<CurrencyTypeDto>;
