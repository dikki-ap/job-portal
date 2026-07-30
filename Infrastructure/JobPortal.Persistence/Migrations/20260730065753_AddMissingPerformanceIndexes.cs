using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_TalentPoolEntries_AddedAt",
                table: "TalentPoolEntries",
                column: "AddedAt");

            migrationBuilder.CreateIndex(
                name: "IX_JobPosts_Status_PublishDate",
                table: "JobPosts",
                columns: new[] { "Status", "PublishDate" });

            migrationBuilder.CreateIndex(
                name: "IX_JobApprovalInstances_JobPostId_Status",
                table: "JobApprovalInstances",
                columns: new[] { "JobPostId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationSteps_ApplicationId_Status",
                table: "ApplicationSteps",
                columns: new[] { "ApplicationId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_UserId",
                table: "Applications",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TalentPoolEntries_AddedAt",
                table: "TalentPoolEntries");

            migrationBuilder.DropIndex(
                name: "IX_JobPosts_Status_PublishDate",
                table: "JobPosts");

            migrationBuilder.DropIndex(
                name: "IX_JobApprovalInstances_JobPostId_Status",
                table: "JobApprovalInstances");

            migrationBuilder.DropIndex(
                name: "IX_ApplicationSteps_ApplicationId_Status",
                table: "ApplicationSteps");

            migrationBuilder.DropIndex(
                name: "IX_Applications_UserId",
                table: "Applications");
        }
    }
}
