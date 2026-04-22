using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCandidateProfileEducationAndJobRequiredDocuments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EducationLevelId",
                table: "UserProfiles",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "JobPostRequiredDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    JobPostId = table.Column<int>(type: "int", nullable: false),
                    DocumentTypeId = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobPostRequiredDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobPostRequiredDocuments_DocumentTypes_DocumentTypeId",
                        column: x => x.DocumentTypeId,
                        principalTable: "DocumentTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobPostRequiredDocuments_JobPosts_JobPostId",
                        column: x => x.JobPostId,
                        principalTable: "JobPosts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfiles_EducationLevelId",
                table: "UserProfiles",
                column: "EducationLevelId");

            migrationBuilder.CreateIndex(
                name: "IX_JobPostRequiredDocuments_DocumentTypeId",
                table: "JobPostRequiredDocuments",
                column: "DocumentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_JobPostRequiredDocuments_JobPostId_DocumentTypeId",
                table: "JobPostRequiredDocuments",
                columns: new[] { "JobPostId", "DocumentTypeId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_UserProfiles_EducationLevels_EducationLevelId",
                table: "UserProfiles",
                column: "EducationLevelId",
                principalTable: "EducationLevels",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserProfiles_EducationLevels_EducationLevelId",
                table: "UserProfiles");

            migrationBuilder.DropTable(
                name: "JobPostRequiredDocuments");

            migrationBuilder.DropIndex(
                name: "IX_UserProfiles_EducationLevelId",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "EducationLevelId",
                table: "UserProfiles");
        }
    }
}
