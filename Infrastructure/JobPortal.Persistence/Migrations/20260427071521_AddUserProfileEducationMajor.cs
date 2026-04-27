using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfileEducationMajor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS `_efmig_add_profile_major`;");
            migrationBuilder.Sql(@"CREATE PROCEDURE `_efmig_add_profile_major`()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'UserProfiles' AND COLUMN_NAME = 'EducationMajorCustom') THEN
        ALTER TABLE `UserProfiles` ADD `EducationMajorCustom` varchar(255) CHARACTER SET utf8mb4 NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'UserProfiles' AND COLUMN_NAME = 'EducationMajorId') THEN
        ALTER TABLE `UserProfiles` ADD `EducationMajorId` int NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'UserProfiles' AND INDEX_NAME = 'IX_UserProfiles_EducationMajorId') THEN
        CREATE INDEX `IX_UserProfiles_EducationMajorId` ON `UserProfiles` (`EducationMajorId`);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'UserProfiles'
        AND CONSTRAINT_NAME = 'FK_UserProfiles_EducationMajors_EducationMajorId') THEN
        ALTER TABLE `UserProfiles`
            ADD CONSTRAINT `FK_UserProfiles_EducationMajors_EducationMajorId`
            FOREIGN KEY (`EducationMajorId`) REFERENCES `EducationMajors` (`Id`) ON DELETE SET NULL;
    END IF;
END");
            migrationBuilder.Sql("CALL `_efmig_add_profile_major`();");
            migrationBuilder.Sql("DROP PROCEDURE `_efmig_add_profile_major`;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE `UserProfiles` DROP FOREIGN KEY IF EXISTS `FK_UserProfiles_EducationMajors_EducationMajorId`;");
            migrationBuilder.Sql("DROP INDEX IF EXISTS `IX_UserProfiles_EducationMajorId` ON `UserProfiles`;");
            migrationBuilder.Sql("ALTER TABLE `UserProfiles` DROP COLUMN IF EXISTS `EducationMajorId`;");
            migrationBuilder.Sql("ALTER TABLE `UserProfiles` DROP COLUMN IF EXISTS `EducationMajorCustom`;");
        }
    }
}
