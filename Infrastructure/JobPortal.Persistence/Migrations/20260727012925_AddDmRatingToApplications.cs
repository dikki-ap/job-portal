using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDmRatingToApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DmRatedAt",
                table: "Applications",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DmRatedByUserId",
                table: "Applications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DmRating",
                table: "Applications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DmRatingNote",
                table: "Applications",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DmRatedAt",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "DmRatedByUserId",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "DmRating",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "DmRatingNote",
                table: "Applications");
        }
    }
}
