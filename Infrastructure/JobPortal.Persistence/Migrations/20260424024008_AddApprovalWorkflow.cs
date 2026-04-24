using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddApprovalWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobApprovalInstanceSteps_Users_ApproverUserId",
                table: "JobApprovalInstanceSteps");

            migrationBuilder.DropIndex(
                name: "IX_JobApprovalInstanceSteps_ApproverUserId",
                table: "JobApprovalInstanceSteps");

            migrationBuilder.DropColumn(
                name: "ApproverUserId",
                table: "JobApprovalInstanceSteps");

            migrationBuilder.AddColumn<string>(
                name: "ApproverEmail",
                table: "JobApprovalInstanceSteps",
                type: "varchar(320)",
                maxLength: 320,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ApproverName",
                table: "JobApprovalInstanceSteps",
                type: "varchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ApprovalLevels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LevelOrder = table.Column<int>(type: "int", nullable: false),
                    ApproverName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ApproverEmail = table.Column<string>(type: "varchar(320)", maxLength: 320, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedByUserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalLevels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalLevels_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ApprovalLevels_Users_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalLevels_CreatedByUserId",
                table: "ApprovalLevels",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalLevels_LevelOrder",
                table: "ApprovalLevels",
                column: "LevelOrder",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalLevels_UpdatedByUserId",
                table: "ApprovalLevels",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApprovalLevels");

            migrationBuilder.DropColumn(
                name: "ApproverEmail",
                table: "JobApprovalInstanceSteps");

            migrationBuilder.DropColumn(
                name: "ApproverName",
                table: "JobApprovalInstanceSteps");

            migrationBuilder.AddColumn<int>(
                name: "ApproverUserId",
                table: "JobApprovalInstanceSteps",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_JobApprovalInstanceSteps_ApproverUserId",
                table: "JobApprovalInstanceSteps",
                column: "ApproverUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_JobApprovalInstanceSteps_Users_ApproverUserId",
                table: "JobApprovalInstanceSteps",
                column: "ApproverUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
