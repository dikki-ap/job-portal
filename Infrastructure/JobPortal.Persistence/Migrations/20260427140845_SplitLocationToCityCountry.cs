using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SplitLocationToCityCountry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Rename Location → Country temporarily (data still holds "City, Country" string)
            migrationBuilder.RenameColumn(
                name: "Location",
                table: "JobPosts",
                newName: "Country");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "JobPosts",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            // Split old "City, Country" values: before first comma → City, after last comma → Country
            migrationBuilder.Sql(@"
                UPDATE `JobPosts`
                SET
                    `City` = CASE
                        WHEN `Country` LIKE '%,%' THEN TRIM(SUBSTRING_INDEX(`Country`, ',', 1))
                        ELSE TRIM(`Country`)
                    END,
                    `Country` = CASE
                        WHEN `Country` LIKE '%,%' THEN TRIM(SUBSTRING_INDEX(`Country`, ',', -1))
                        ELSE ''
                    END;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "JobPosts");

            migrationBuilder.RenameColumn(
                name: "Country",
                table: "JobPosts",
                newName: "Location");
        }
    }
}
