using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailTemplatesToSteps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FailEmailBody",
                table: "JobSteps",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "FailEmailSubject",
                table: "JobSteps",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PassEmailBody",
                table: "JobSteps",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PassEmailSubject",
                table: "JobSteps",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "FailEmailBody",
                table: "HiringTemplateSteps",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "FailEmailSubject",
                table: "HiringTemplateSteps",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PassEmailBody",
                table: "HiringTemplateSteps",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PassEmailSubject",
                table: "HiringTemplateSteps",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FailEmailBody",
                table: "JobSteps");

            migrationBuilder.DropColumn(
                name: "FailEmailSubject",
                table: "JobSteps");

            migrationBuilder.DropColumn(
                name: "PassEmailBody",
                table: "JobSteps");

            migrationBuilder.DropColumn(
                name: "PassEmailSubject",
                table: "JobSteps");

            migrationBuilder.DropColumn(
                name: "FailEmailBody",
                table: "HiringTemplateSteps");

            migrationBuilder.DropColumn(
                name: "FailEmailSubject",
                table: "HiringTemplateSteps");

            migrationBuilder.DropColumn(
                name: "PassEmailBody",
                table: "HiringTemplateSteps");

            migrationBuilder.DropColumn(
                name: "PassEmailSubject",
                table: "HiringTemplateSteps");
        }
    }
}
