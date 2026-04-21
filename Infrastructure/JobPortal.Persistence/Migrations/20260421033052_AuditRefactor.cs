using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobPortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AuditRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FullName",
                table: "Users");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "WorkModes",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "WorkModes",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "UserWorkHistories",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserWorkHistories",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "UserSkills",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserSkills",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Users",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Users",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "Users",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "UserProfiles",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserProfiles",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "UserOrganizationHistories",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserOrganizationHistories",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "UserEducationHistories",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserEducationHistories",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "UserDocuments",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserDocuments",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "UserAddresses",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserAddresses",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "Skills",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Skills",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "JobSteps",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "JobSteps",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "JobPosts",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "JobPosts",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "JobLevels",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "JobLevels",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "JobCategories",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "JobCategories",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "EmploymentTypes",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "EmploymentTypes",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "EducationMajors",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "EducationMajors",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "EducationLevels",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "EducationLevels",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "DocumentTypes",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "DocumentTypes",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "Documents",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Documents",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "Departments",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Departments",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "CurrencyTypes",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "CurrencyTypes",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            // Remove dev data that would violate the new FK constraints (CreatedByUserId must reference a valid User)
            var auditableTables = new[]
            {
                "CurrencyTypes", "Departments", "Documents", "DocumentTypes",
                "EducationLevels", "EducationMajors", "EmploymentTypes",
                "JobCategories", "JobLevels", "JobPosts", "JobSteps",
                "Skills", "UserAddresses", "UserDocuments", "UserEducationHistories",
                "UserOrganizationHistories", "UserProfiles", "UserSkills",
                "UserWorkHistories", "WorkModes"
            };
            foreach (var t in auditableTables)
            {
                migrationBuilder.Sql($"DELETE FROM `{t}` WHERE `CreatedByUserId` NOT IN (SELECT `Id` FROM `Users`);");
                migrationBuilder.Sql($"UPDATE `{t}` SET `UpdatedByUserId` = NULL WHERE `UpdatedByUserId` IS NOT NULL AND `UpdatedByUserId` NOT IN (SELECT `Id` FROM `Users`);");
            }

            migrationBuilder.CreateIndex(
                name: "IX_WorkModes_CreatedByUserId",
                table: "WorkModes",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkModes_UpdatedByUserId",
                table: "WorkModes",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWorkHistories_CreatedByUserId",
                table: "UserWorkHistories",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWorkHistories_UpdatedByUserId",
                table: "UserWorkHistories",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSkills_CreatedByUserId",
                table: "UserSkills",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSkills_UpdatedByUserId",
                table: "UserSkills",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfiles_CreatedByUserId",
                table: "UserProfiles",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfiles_UpdatedByUserId",
                table: "UserProfiles",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOrganizationHistories_CreatedByUserId",
                table: "UserOrganizationHistories",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOrganizationHistories_UpdatedByUserId",
                table: "UserOrganizationHistories",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEducationHistories_CreatedByUserId",
                table: "UserEducationHistories",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEducationHistories_UpdatedByUserId",
                table: "UserEducationHistories",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDocuments_CreatedByUserId",
                table: "UserDocuments",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDocuments_UpdatedByUserId",
                table: "UserDocuments",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAddresses_CreatedByUserId",
                table: "UserAddresses",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAddresses_UpdatedByUserId",
                table: "UserAddresses",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Skills_CreatedByUserId",
                table: "Skills",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Skills_UpdatedByUserId",
                table: "Skills",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_JobSteps_CreatedByUserId",
                table: "JobSteps",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_JobSteps_UpdatedByUserId",
                table: "JobSteps",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_JobPosts_CreatedByUserId",
                table: "JobPosts",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_JobPosts_UpdatedByUserId",
                table: "JobPosts",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_CreatedByUserId",
                table: "JobLevels",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_UpdatedByUserId",
                table: "JobLevels",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCategories_CreatedByUserId",
                table: "JobCategories",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCategories_UpdatedByUserId",
                table: "JobCategories",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentTypes_CreatedByUserId",
                table: "EmploymentTypes",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentTypes_UpdatedByUserId",
                table: "EmploymentTypes",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EducationMajors_CreatedByUserId",
                table: "EducationMajors",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EducationMajors_UpdatedByUserId",
                table: "EducationMajors",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EducationLevels_CreatedByUserId",
                table: "EducationLevels",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EducationLevels_UpdatedByUserId",
                table: "EducationLevels",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTypes_CreatedByUserId",
                table: "DocumentTypes",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTypes_UpdatedByUserId",
                table: "DocumentTypes",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_CreatedByUserId",
                table: "Documents",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_UpdatedByUserId",
                table: "Documents",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_CreatedByUserId",
                table: "Departments",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_UpdatedByUserId",
                table: "Departments",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrencyTypes_CreatedByUserId",
                table: "CurrencyTypes",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CurrencyTypes_UpdatedByUserId",
                table: "CurrencyTypes",
                column: "UpdatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CurrencyTypes_Users_CreatedByUserId",
                table: "CurrencyTypes",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CurrencyTypes_Users_UpdatedByUserId",
                table: "CurrencyTypes",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_Users_CreatedByUserId",
                table: "Departments",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_Users_UpdatedByUserId",
                table: "Departments",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Users_CreatedByUserId",
                table: "Documents",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Users_UpdatedByUserId",
                table: "Documents",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentTypes_Users_CreatedByUserId",
                table: "DocumentTypes",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentTypes_Users_UpdatedByUserId",
                table: "DocumentTypes",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EducationLevels_Users_CreatedByUserId",
                table: "EducationLevels",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EducationLevels_Users_UpdatedByUserId",
                table: "EducationLevels",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EducationMajors_Users_CreatedByUserId",
                table: "EducationMajors",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EducationMajors_Users_UpdatedByUserId",
                table: "EducationMajors",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EmploymentTypes_Users_CreatedByUserId",
                table: "EmploymentTypes",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EmploymentTypes_Users_UpdatedByUserId",
                table: "EmploymentTypes",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JobCategories_Users_CreatedByUserId",
                table: "JobCategories",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JobCategories_Users_UpdatedByUserId",
                table: "JobCategories",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JobLevels_Users_CreatedByUserId",
                table: "JobLevels",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JobLevels_Users_UpdatedByUserId",
                table: "JobLevels",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JobPosts_Users_CreatedByUserId",
                table: "JobPosts",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JobPosts_Users_UpdatedByUserId",
                table: "JobPosts",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JobSteps_Users_CreatedByUserId",
                table: "JobSteps",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JobSteps_Users_UpdatedByUserId",
                table: "JobSteps",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Skills_Users_CreatedByUserId",
                table: "Skills",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Skills_Users_UpdatedByUserId",
                table: "Skills",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserAddresses_Users_CreatedByUserId",
                table: "UserAddresses",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserAddresses_Users_UpdatedByUserId",
                table: "UserAddresses",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserDocuments_Users_CreatedByUserId",
                table: "UserDocuments",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserDocuments_Users_UpdatedByUserId",
                table: "UserDocuments",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserEducationHistories_Users_CreatedByUserId",
                table: "UserEducationHistories",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserEducationHistories_Users_UpdatedByUserId",
                table: "UserEducationHistories",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserOrganizationHistories_Users_CreatedByUserId",
                table: "UserOrganizationHistories",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserOrganizationHistories_Users_UpdatedByUserId",
                table: "UserOrganizationHistories",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserProfiles_Users_CreatedByUserId",
                table: "UserProfiles",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserProfiles_Users_UpdatedByUserId",
                table: "UserProfiles",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserSkills_Users_CreatedByUserId",
                table: "UserSkills",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserSkills_Users_UpdatedByUserId",
                table: "UserSkills",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserWorkHistories_Users_CreatedByUserId",
                table: "UserWorkHistories",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserWorkHistories_Users_UpdatedByUserId",
                table: "UserWorkHistories",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkModes_Users_CreatedByUserId",
                table: "WorkModes",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkModes_Users_UpdatedByUserId",
                table: "WorkModes",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CurrencyTypes_Users_CreatedByUserId",
                table: "CurrencyTypes");

            migrationBuilder.DropForeignKey(
                name: "FK_CurrencyTypes_Users_UpdatedByUserId",
                table: "CurrencyTypes");

            migrationBuilder.DropForeignKey(
                name: "FK_Departments_Users_CreatedByUserId",
                table: "Departments");

            migrationBuilder.DropForeignKey(
                name: "FK_Departments_Users_UpdatedByUserId",
                table: "Departments");

            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Users_CreatedByUserId",
                table: "Documents");

            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Users_UpdatedByUserId",
                table: "Documents");

            migrationBuilder.DropForeignKey(
                name: "FK_DocumentTypes_Users_CreatedByUserId",
                table: "DocumentTypes");

            migrationBuilder.DropForeignKey(
                name: "FK_DocumentTypes_Users_UpdatedByUserId",
                table: "DocumentTypes");

            migrationBuilder.DropForeignKey(
                name: "FK_EducationLevels_Users_CreatedByUserId",
                table: "EducationLevels");

            migrationBuilder.DropForeignKey(
                name: "FK_EducationLevels_Users_UpdatedByUserId",
                table: "EducationLevels");

            migrationBuilder.DropForeignKey(
                name: "FK_EducationMajors_Users_CreatedByUserId",
                table: "EducationMajors");

            migrationBuilder.DropForeignKey(
                name: "FK_EducationMajors_Users_UpdatedByUserId",
                table: "EducationMajors");

            migrationBuilder.DropForeignKey(
                name: "FK_EmploymentTypes_Users_CreatedByUserId",
                table: "EmploymentTypes");

            migrationBuilder.DropForeignKey(
                name: "FK_EmploymentTypes_Users_UpdatedByUserId",
                table: "EmploymentTypes");

            migrationBuilder.DropForeignKey(
                name: "FK_JobCategories_Users_CreatedByUserId",
                table: "JobCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_JobCategories_Users_UpdatedByUserId",
                table: "JobCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_JobLevels_Users_CreatedByUserId",
                table: "JobLevels");

            migrationBuilder.DropForeignKey(
                name: "FK_JobLevels_Users_UpdatedByUserId",
                table: "JobLevels");

            migrationBuilder.DropForeignKey(
                name: "FK_JobPosts_Users_CreatedByUserId",
                table: "JobPosts");

            migrationBuilder.DropForeignKey(
                name: "FK_JobPosts_Users_UpdatedByUserId",
                table: "JobPosts");

            migrationBuilder.DropForeignKey(
                name: "FK_JobSteps_Users_CreatedByUserId",
                table: "JobSteps");

            migrationBuilder.DropForeignKey(
                name: "FK_JobSteps_Users_UpdatedByUserId",
                table: "JobSteps");

            migrationBuilder.DropForeignKey(
                name: "FK_Skills_Users_CreatedByUserId",
                table: "Skills");

            migrationBuilder.DropForeignKey(
                name: "FK_Skills_Users_UpdatedByUserId",
                table: "Skills");

            migrationBuilder.DropForeignKey(
                name: "FK_UserAddresses_Users_CreatedByUserId",
                table: "UserAddresses");

            migrationBuilder.DropForeignKey(
                name: "FK_UserAddresses_Users_UpdatedByUserId",
                table: "UserAddresses");

            migrationBuilder.DropForeignKey(
                name: "FK_UserDocuments_Users_CreatedByUserId",
                table: "UserDocuments");

            migrationBuilder.DropForeignKey(
                name: "FK_UserDocuments_Users_UpdatedByUserId",
                table: "UserDocuments");

            migrationBuilder.DropForeignKey(
                name: "FK_UserEducationHistories_Users_CreatedByUserId",
                table: "UserEducationHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_UserEducationHistories_Users_UpdatedByUserId",
                table: "UserEducationHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_UserOrganizationHistories_Users_CreatedByUserId",
                table: "UserOrganizationHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_UserOrganizationHistories_Users_UpdatedByUserId",
                table: "UserOrganizationHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_UserProfiles_Users_CreatedByUserId",
                table: "UserProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_UserProfiles_Users_UpdatedByUserId",
                table: "UserProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_UserSkills_Users_CreatedByUserId",
                table: "UserSkills");

            migrationBuilder.DropForeignKey(
                name: "FK_UserSkills_Users_UpdatedByUserId",
                table: "UserSkills");

            migrationBuilder.DropForeignKey(
                name: "FK_UserWorkHistories_Users_CreatedByUserId",
                table: "UserWorkHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_UserWorkHistories_Users_UpdatedByUserId",
                table: "UserWorkHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkModes_Users_CreatedByUserId",
                table: "WorkModes");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkModes_Users_UpdatedByUserId",
                table: "WorkModes");

            migrationBuilder.DropIndex(
                name: "IX_WorkModes_CreatedByUserId",
                table: "WorkModes");

            migrationBuilder.DropIndex(
                name: "IX_WorkModes_UpdatedByUserId",
                table: "WorkModes");

            migrationBuilder.DropIndex(
                name: "IX_UserWorkHistories_CreatedByUserId",
                table: "UserWorkHistories");

            migrationBuilder.DropIndex(
                name: "IX_UserWorkHistories_UpdatedByUserId",
                table: "UserWorkHistories");

            migrationBuilder.DropIndex(
                name: "IX_UserSkills_CreatedByUserId",
                table: "UserSkills");

            migrationBuilder.DropIndex(
                name: "IX_UserSkills_UpdatedByUserId",
                table: "UserSkills");

            migrationBuilder.DropIndex(
                name: "IX_UserProfiles_CreatedByUserId",
                table: "UserProfiles");

            migrationBuilder.DropIndex(
                name: "IX_UserProfiles_UpdatedByUserId",
                table: "UserProfiles");

            migrationBuilder.DropIndex(
                name: "IX_UserOrganizationHistories_CreatedByUserId",
                table: "UserOrganizationHistories");

            migrationBuilder.DropIndex(
                name: "IX_UserOrganizationHistories_UpdatedByUserId",
                table: "UserOrganizationHistories");

            migrationBuilder.DropIndex(
                name: "IX_UserEducationHistories_CreatedByUserId",
                table: "UserEducationHistories");

            migrationBuilder.DropIndex(
                name: "IX_UserEducationHistories_UpdatedByUserId",
                table: "UserEducationHistories");

            migrationBuilder.DropIndex(
                name: "IX_UserDocuments_CreatedByUserId",
                table: "UserDocuments");

            migrationBuilder.DropIndex(
                name: "IX_UserDocuments_UpdatedByUserId",
                table: "UserDocuments");

            migrationBuilder.DropIndex(
                name: "IX_UserAddresses_CreatedByUserId",
                table: "UserAddresses");

            migrationBuilder.DropIndex(
                name: "IX_UserAddresses_UpdatedByUserId",
                table: "UserAddresses");

            migrationBuilder.DropIndex(
                name: "IX_Skills_CreatedByUserId",
                table: "Skills");

            migrationBuilder.DropIndex(
                name: "IX_Skills_UpdatedByUserId",
                table: "Skills");

            migrationBuilder.DropIndex(
                name: "IX_JobSteps_CreatedByUserId",
                table: "JobSteps");

            migrationBuilder.DropIndex(
                name: "IX_JobSteps_UpdatedByUserId",
                table: "JobSteps");

            migrationBuilder.DropIndex(
                name: "IX_JobPosts_CreatedByUserId",
                table: "JobPosts");

            migrationBuilder.DropIndex(
                name: "IX_JobPosts_UpdatedByUserId",
                table: "JobPosts");

            migrationBuilder.DropIndex(
                name: "IX_JobLevels_CreatedByUserId",
                table: "JobLevels");

            migrationBuilder.DropIndex(
                name: "IX_JobLevels_UpdatedByUserId",
                table: "JobLevels");

            migrationBuilder.DropIndex(
                name: "IX_JobCategories_CreatedByUserId",
                table: "JobCategories");

            migrationBuilder.DropIndex(
                name: "IX_JobCategories_UpdatedByUserId",
                table: "JobCategories");

            migrationBuilder.DropIndex(
                name: "IX_EmploymentTypes_CreatedByUserId",
                table: "EmploymentTypes");

            migrationBuilder.DropIndex(
                name: "IX_EmploymentTypes_UpdatedByUserId",
                table: "EmploymentTypes");

            migrationBuilder.DropIndex(
                name: "IX_EducationMajors_CreatedByUserId",
                table: "EducationMajors");

            migrationBuilder.DropIndex(
                name: "IX_EducationMajors_UpdatedByUserId",
                table: "EducationMajors");

            migrationBuilder.DropIndex(
                name: "IX_EducationLevels_CreatedByUserId",
                table: "EducationLevels");

            migrationBuilder.DropIndex(
                name: "IX_EducationLevels_UpdatedByUserId",
                table: "EducationLevels");

            migrationBuilder.DropIndex(
                name: "IX_DocumentTypes_CreatedByUserId",
                table: "DocumentTypes");

            migrationBuilder.DropIndex(
                name: "IX_DocumentTypes_UpdatedByUserId",
                table: "DocumentTypes");

            migrationBuilder.DropIndex(
                name: "IX_Documents_CreatedByUserId",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_UpdatedByUserId",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Departments_CreatedByUserId",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Departments_UpdatedByUserId",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_CurrencyTypes_CreatedByUserId",
                table: "CurrencyTypes");

            migrationBuilder.DropIndex(
                name: "IX_CurrencyTypes_UpdatedByUserId",
                table: "CurrencyTypes");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "Users");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "WorkModes",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "WorkModes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "UserWorkHistories",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserWorkHistories",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "UserSkills",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserSkills",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Users",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "Users",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "UserProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserProfiles",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "UserOrganizationHistories",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserOrganizationHistories",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "UserEducationHistories",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserEducationHistories",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "UserDocuments",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserDocuments",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "UserAddresses",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "UserAddresses",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "Skills",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Skills",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "JobSteps",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "JobSteps",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "JobPosts",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "JobPosts",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "JobLevels",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "JobLevels",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "JobCategories",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "JobCategories",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "EmploymentTypes",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "EmploymentTypes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "EducationMajors",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "EducationMajors",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "EducationLevels",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "EducationLevels",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "DocumentTypes",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "DocumentTypes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "Documents",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Documents",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "Departments",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Departments",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UpdatedByUserId",
                table: "CurrencyTypes",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "CurrencyTypes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);
        }
    }
}
