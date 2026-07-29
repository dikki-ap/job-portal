using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_JobApprovalInstances_Status",
                table: "JobApprovalInstances",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationSteps_Status",
                table: "ApplicationSteps",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_AppliedAt",
                table: "Applications",
                column: "AppliedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_Status",
                table: "Applications",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_JobApprovalInstances_Status",
                table: "JobApprovalInstances");

            migrationBuilder.DropIndex(
                name: "IX_ApplicationSteps_Status",
                table: "ApplicationSteps");

            migrationBuilder.DropIndex(
                name: "IX_Applications_AppliedAt",
                table: "Applications");

            migrationBuilder.DropIndex(
                name: "IX_Applications_Status",
                table: "Applications");
        }
    }
}
