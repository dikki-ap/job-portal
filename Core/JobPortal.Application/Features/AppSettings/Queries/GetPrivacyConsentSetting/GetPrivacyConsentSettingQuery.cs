using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.AppSettings.Queries.GetPrivacyConsentSetting;

public record GetPrivacyConsentSettingQuery : IRequest<PrivacyConsentSettingDto>;
