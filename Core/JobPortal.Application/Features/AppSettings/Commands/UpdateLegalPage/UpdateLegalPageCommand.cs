using MediatR;

namespace JobPortal.Application.Features.AppSettings.Commands.UpdateLegalPage;

public record UpdateLegalPageCommand(string PageType, string Content) : IRequest<Unit>;
