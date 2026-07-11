using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedAchievements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Achievements",
                columns: new[] { "Id", "Category", "Description", "Icon", "Name", "TargetValue" },
                values: new object[,]
                {
                    { 1, "All", "Create your first collectible.", "first-capture", "First Capture", 1 },
                    { 2, "All", "Create 10 collectibles.", "collector", "Collector", 10 },
                    { 3, "Food", "Collect 5 food items.", "food-hunter", "Food Hunter", 5 },
                    { 4, "Vehicle", "Collect 5 vehicles.", "vehicle-collector", "Vehicle Collector", 5 },
                    { 5, "Building", "Collect 5 places or buildings.", "world-explorer", "World Explorer", 5 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Achievements",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Achievements",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Achievements",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Achievements",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Achievements",
                keyColumn: "Id",
                keyValue: 5);
        }
    }
}
