using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Carmen.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupTenantAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GroupTenantAccess",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    AssignedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    AssignedBy = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupTenantAccess", x => new { x.UserId, x.TenantId });
                    table.ForeignKey(
                        name: "FK_GroupTenantAccess_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GroupTenantAccess_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_GroupTenantAccess_AssignedAt",
                table: "GroupTenantAccess",
                column: "AssignedAt");

            migrationBuilder.CreateIndex(
                name: "IX_GroupTenantAccess_TenantId",
                table: "GroupTenantAccess",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GroupTenantAccess");
        }
    }
}
