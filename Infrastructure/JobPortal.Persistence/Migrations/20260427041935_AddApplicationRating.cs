using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddApplicationRating : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS `_efmig_add_rating`;");
            migrationBuilder.Sql(@"CREATE PROCEDURE `_efmig_add_rating`()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Applications' AND COLUMN_NAME = 'Rating') THEN
        ALTER TABLE `Applications` ADD `Rating` int NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Applications' AND COLUMN_NAME = 'RatingNote') THEN
        ALTER TABLE `Applications` ADD `RatingNote` longtext CHARACTER SET utf8mb4 NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Applications' AND COLUMN_NAME = 'RatedAt') THEN
        ALTER TABLE `Applications` ADD `RatedAt` datetime(6) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Applications' AND COLUMN_NAME = 'RatedByUserId') THEN
        ALTER TABLE `Applications` ADD `RatedByUserId` int NULL;
    END IF;
END");
            migrationBuilder.Sql("CALL `_efmig_add_rating`();");
            migrationBuilder.Sql("DROP PROCEDURE `_efmig_add_rating`;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE `Applications` DROP COLUMN IF EXISTS `Rating`;");
            migrationBuilder.Sql("ALTER TABLE `Applications` DROP COLUMN IF EXISTS `RatingNote`;");
            migrationBuilder.Sql("ALTER TABLE `Applications` DROP COLUMN IF EXISTS `RatedAt`;");
            migrationBuilder.Sql("ALTER TABLE `Applications` DROP COLUMN IF EXISTS `RatedByUserId`;");
        }
    }
}
