using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.AppSettings.Queries.GetBrandingSetting;

public class GetBrandingSettingQuery : IRequest<BrandingSettingDto>;
