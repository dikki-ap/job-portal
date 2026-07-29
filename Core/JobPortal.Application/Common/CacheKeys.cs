namespace JobPortal.Application.Common;

public static class CacheKeys
{
    // App settings
    public const string Branding             = "cache:branding";
    public const string PrivacyConsentSetting = "cache:privacy-consent";
    public const string LegalPrivacy         = "cache:legal:privacy";
    public const string LegalTerms           = "cache:legal:terms";

    // Jobs (public careers)
    public const string PublishedJobsVersion = "cache:jobs:version";
    public const string PublishedCountries   = "cache:published-countries";
    public static string JobSlug(string slug) => $"cache:job-slug:{slug}";

    // Per-user identity
    public static string DmIdentity(string email) => $"cache:dm-identity:{email}";

    // Master data
    public const string DocumentTypes    = "cache:document-types";
    public const string Departments      = "cache:departments";
    public const string Skills           = "cache:skills";
    public const string WorkModes        = "cache:work-modes";
    public const string EmploymentTypes  = "cache:employment-types";
    public const string JobCategories    = "cache:job-categories";
    public const string JobLevels        = "cache:job-levels";
    public const string CurrencyTypes    = "cache:currency-types";
    public const string EducationLevels  = "cache:education-levels";
    public const string EducationMajors  = "cache:education-majors";
}
