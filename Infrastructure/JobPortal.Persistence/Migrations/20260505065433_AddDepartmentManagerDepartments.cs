using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentManagerDepartments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DepartmentManagers_Departments_DepartmentId",
                table: "DepartmentManagers");

            migrationBuilder.DropIndex(
                name: "IX_DepartmentManagers_DepartmentId",
                table: "DepartmentManagers");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "DepartmentManagers");

            migrationBuilder.CreateTable(
                name: "DepartmentManagerDepartments",
                columns: table => new
                {
                    DepartmentManagerId = table.Column<int>(type: "int", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DepartmentManagerDepartments", x => new { x.DepartmentManagerId, x.DepartmentId });
                    table.ForeignKey(
                        name: "FK_DepartmentManagerDepartments_DepartmentManagers_DepartmentMa~",
                        column: x => x.DepartmentManagerId,
                        principalTable: "DepartmentManagers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DepartmentManagerDepartments_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_DepartmentManagerDepartments_DepartmentId",
                table: "DepartmentManagerDepartments",
                column: "DepartmentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DepartmentManagerDepartments");

            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "DepartmentManagers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_DepartmentManagers_DepartmentId",
                table: "DepartmentManagers",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_DepartmentManagers_Departments_DepartmentId",
                table: "DepartmentManagers",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
