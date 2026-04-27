using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddJobPostPreferredMajors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Idempotent: add Code column only if it doesn't exist
            //    (MySQL doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS, so use a stored procedure)
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS `_efmig_add_code_col`;");
            migrationBuilder.Sql(@"CREATE PROCEDURE `_efmig_add_code_col`()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'Applications'
          AND COLUMN_NAME  = 'Code'
    ) THEN
        ALTER TABLE `Applications`
            ADD `Code` varchar(60) CHARACTER SET utf8mb4 NOT NULL DEFAULT '';
    END IF;
END");
            migrationBuilder.Sql("CALL `_efmig_add_code_col`();");
            migrationBuilder.Sql("DROP PROCEDURE `_efmig_add_code_col`;");

            // 2. Idempotent: create JobPostEducationMajors table
            migrationBuilder.Sql(@"CREATE TABLE IF NOT EXISTS `JobPostEducationMajors` (
    `Id`               int NOT NULL AUTO_INCREMENT,
    `JobPostId`        int NOT NULL,
    `EducationMajorId` int NOT NULL,
    CONSTRAINT `PK_JobPostEducationMajors` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_JobPostEducationMajors_EducationMajors_EducationMajorId`
        FOREIGN KEY (`EducationMajorId`) REFERENCES `EducationMajors` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_JobPostEducationMajors_JobPosts_JobPostId`
        FOREIGN KEY (`JobPostId`) REFERENCES `JobPosts` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;");

            // 3. Backfill: existing rows with empty Code get a stable unique value
            migrationBuilder.Sql(
                "UPDATE `Applications` SET `Code` = CONCAT('legacy-', LPAD(CAST(`Id` AS CHAR), 8, '0')) WHERE `Code` = '';");

            // 4. Idempotent: unique index on Applications.Code
            migrationBuilder.Sql(
                "CREATE UNIQUE INDEX IF NOT EXISTS `IX_Applications_Code` ON `Applications` (`Code`);");

            // 5. Idempotent: indices on JobPostEducationMajors
            migrationBuilder.Sql(
                "CREATE INDEX IF NOT EXISTS `IX_JobPostEducationMajors_EducationMajorId` ON `JobPostEducationMajors` (`EducationMajorId`);");
            migrationBuilder.Sql(
                "CREATE UNIQUE INDEX IF NOT EXISTS `IX_JobPostEducationMajors_JobPostId_EducationMajorId` ON `JobPostEducationMajors` (`JobPostId`, `EducationMajorId`);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TABLE IF EXISTS `JobPostEducationMajors`;");

            migrationBuilder.Sql("DROP INDEX IF EXISTS `IX_Applications_Code` ON `Applications`;");

            migrationBuilder.Sql("ALTER TABLE `Applications` DROP COLUMN IF EXISTS `Code`;");
        }
    }
}
