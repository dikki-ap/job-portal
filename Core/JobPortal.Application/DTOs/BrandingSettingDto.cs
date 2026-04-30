namespace JobPortal.Application.DTOs;

public record BrandingSettingDto(
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
    string Timezone);
