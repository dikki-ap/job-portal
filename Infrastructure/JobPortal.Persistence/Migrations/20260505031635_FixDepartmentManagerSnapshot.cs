using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixDepartmentManagerSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Table was already created by AddDepartmentManagers (manual migration).
            // This migration exists only to sync the EF model snapshot after adding
            // DepartmentManagerConfiguration (MaxLength, unique email index, Restrict FK).
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DepartmentManagers");
        }
    }
}
