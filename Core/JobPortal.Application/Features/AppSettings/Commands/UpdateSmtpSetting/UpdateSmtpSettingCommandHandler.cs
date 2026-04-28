using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;

namespace JobPortal.Application.Features.AppSettings.Commands.UpdateSmtpSetting;

public class UpdateSmtpSettingCommandHandler(
    IAppSettingRepository repo,
    ICurrentUserService currentUserService)
    : IRequestHandler<UpdateSmtpSettingCommand, Unit>
{
    public async Task<Unit> Handle(UpdateSmtpSettingCommand request, CancellationToken ct)
    {
        var userId = currentUserService.GetCurrentUserId();
        await repo.SetValueAsync("SmtpHost",        request.Host,                          userId, ct);
        await repo.SetValueAsync("SmtpPort",        request.Port.ToString(),               userId, ct);
        await repo.SetValueAsync("SmtpSenderName",  request.SenderName,                    userId, ct);
        await repo.SetValueAsync("SmtpSenderEmail", request.SenderEmail,                   userId, ct);
        await repo.SetValueAsync("SmtpUsername",    request.Username,                      userId, ct);
        await repo.SetValueAsync("SmtpEnableSsl",   request.EnableSsl ? "true" : "false", userId, ct);
        await repo.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
