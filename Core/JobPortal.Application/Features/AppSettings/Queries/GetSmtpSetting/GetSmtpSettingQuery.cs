using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.AppSettings.Queries.GetSmtpSetting;

public class GetSmtpSettingQuery : IRequest<SmtpSettingDto>;
