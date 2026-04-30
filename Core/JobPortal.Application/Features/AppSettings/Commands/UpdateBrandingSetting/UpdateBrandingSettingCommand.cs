using MediatR;

namespace JobPortal.Application.Features.AppSettings.Commands.UpdateBrandingSetting;

public record UpdateBrandingSettingCommand(
    string CompanyName,
    string LogoUrl,
    string PrimaryColor,
    string PrimaryHoverColor,
    string GradientMidColor,
    string GradientEndColor,
    string ContactEmail,
    string ContactPhone,
    string Address,
    string Description,
    string Timezone) : IRequest<Unit>;
