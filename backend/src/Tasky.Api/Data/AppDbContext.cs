using Microsoft.EntityFrameworkCore;
using Tasky.Api.Entities;

namespace Tasky.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<TaskItem> Tasks => Set<TaskItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<TaskItem>(b =>
            {
                b.ToTable("task");
                b.HasKey(x => x.Id);
                b.Property(x => x.Title).IsRequired().HasMaxLength(200);
                b.Property(x => x.Description).HasMaxLength(1000);
                b.Property(x => x.IsCompleted).HasDefaultValue(false);
                b.Property(x => x.CreatedAt).HasDefaultValueSql("NOW()")
                    .HasColumnType("timestamp with time zone");
            });
        }
    }
}
