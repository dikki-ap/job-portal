using MediatR;

namespace JobPortal.Application.Features.AppSettings.Commands.UpdateSmtpSetting;

public record UpdateSmtpSettingCommand(
    string Host,
    int Port,
    string SenderName,
    string SenderEmail,
    string Username,
    bool EnableSsl) : IRequest<Unit>;
