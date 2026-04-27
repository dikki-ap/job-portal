using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPrivacyConsent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS `_efmig_add_privacy_consent`;");
            migrationBuilder.Sql(@"CREATE PROCEDURE `_efmig_add_privacy_consent`()
BEGIN
    -- AppSettings table
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'AppSettings') THEN
        CREATE TABLE `AppSettings` (
            `Id` int NOT NULL AUTO_INCREMENT,
            `Key` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
            `Value` varchar(500) CHARACTER SET utf8mb4 NOT NULL,
            `UpdatedAt` datetime(6) NULL,
            `UpdatedByUserId` int NULL,
            PRIMARY KEY (`Id`)
        ) CHARACTER SET utf8mb4;
    END IF;

    -- Unique index on Key
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'AppSettings' AND INDEX_NAME = 'IX_AppSettings_Key') THEN
        CREATE UNIQUE INDEX `IX_AppSettings_Key` ON `AppSettings` (`Key`);
    END IF;

    -- Default seed row: RequirePrivacyConsent
    IF NOT EXISTS (SELECT 1 FROM `AppSettings` WHERE `Key` = 'RequirePrivacyConsent') THEN
        INSERT INTO `AppSettings` (`Key`, `Value`) VALUES ('RequirePrivacyConsent', 'false');
    END IF;

    -- HasConsentedToPrivacyPolicy column on UserProfiles
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'UserProfiles' AND COLUMN_NAME = 'HasConsentedToPrivacyPolicy') THEN
        ALTER TABLE `UserProfiles` ADD `HasConsentedToPrivacyPolicy` tinyint(1) NOT NULL DEFAULT 0;
    END IF;

    -- ConsentedAt column on UserProfiles
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'UserProfiles' AND COLUMN_NAME = 'ConsentedAt') THEN
        ALTER TABLE `UserProfiles` ADD `ConsentedAt` datetime(6) NULL;
    END IF;
END");
            migrationBuilder.Sql("CALL `_efmig_add_privacy_consent`();");
            migrationBuilder.Sql("DROP PROCEDURE `_efmig_add_privacy_consent`;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TABLE IF EXISTS `AppSettings`;");
            migrationBuilder.Sql("ALTER TABLE `UserProfiles` DROP COLUMN IF EXISTS `ConsentedAt`;");
            migrationBuilder.Sql("ALTER TABLE `UserProfiles` DROP COLUMN IF EXISTS `HasConsentedToPrivacyPolicy`;");
        }
    }
}
