using MediatR;

namespace JobPortal.Application.Features.CurrencyTypes.Commands.DeleteCurrencyType;

public record DeleteCurrencyTypeCommand(int Id) : IRequest<Unit>;
