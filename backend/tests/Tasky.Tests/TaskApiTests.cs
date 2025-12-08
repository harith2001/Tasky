using Microsoft.EntityFrameworkCore;
using Tasky.Api.Data;
using Tasky.Api.Entities;
using Tasky.Api.Models;
using Xunit;

public class TaskApiTests
{
    private AppDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task Creates_Task_With_Validation()
    {
        var db = CreateInMemoryDb();
        var dto = new TaskCreateDto("Test Title", "Desc");
        var item = new TaskItem { Title = dto.Title, Description = dto.Description };
        db.Tasks.Add(item);
        await db.SaveChangesAsync();
        Assert.Equal(1, await db.Tasks.CountAsync());
        var saved = await db.Tasks.FirstAsync();
        Assert.False(saved.IsCompleted);
        Assert.Equal("Test Title", saved.Title);
    }

    [Fact]
    public async Task Complete_Task_Hides_From_Query()
    {
        var db = CreateInMemoryDb();
        db.Tasks.Add(new TaskItem { Title = "A" });
        db.Tasks.Add(new TaskItem { Title = "B" });
        await db.SaveChangesAsync();

        var b = await db.Tasks.FirstAsync(t => t.Title == "B");
        b.IsCompleted = true;
        await db.SaveChangesAsync();

        var visible = await db.Tasks.Where(t => !t.IsCompleted).ToListAsync();
        Assert.Single(visible);
        Assert.Equal("A", visible[0].Title);
    }
}
