using Microsoft.EntityFrameworkCore;
using Tasky.Api.Data;
using Tasky.Api.Models;
using Tasky.Api.Entities;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

// Configuration
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? builder.Configuration["ConnectionStrings:Default"]
    ?? throw new InvalidOperationException("Connection string 'Default' not configured.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddHealthChecks();

// CORS: allow frontend origin
var frontendOrigin = builder.Configuration["Frontend:Origin"]
    ?? builder.Configuration["VITE_API_BASE_URL"] // unlikely, but fallback
    ?? "http://localhost:5173";
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(frontendOrigin)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Apply migrations and seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    if (!db.Tasks.Any())
    {
        db.Tasks.AddRange(new[]
        {
            new TaskItem { Title = "Buy groceries", Description = "Milk, eggs, bread" },
            new TaskItem { Title = "Clean home", Description = "Living room and kitchen" },
            new TaskItem { Title = "Finish assignment", Description = "Submit before Friday" },
            new TaskItem { Title = "Play cricket", Description = "Evening practice" },
            new TaskItem { Title = "Call Sam", Description = "Discuss project" }
        });
        db.SaveChanges();
    }
}

app.MapHealthChecks("/health");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.MapGet("/api/tasks", async (int? limit, AppDbContext db) =>
{
    IQueryable<TaskItem> query = db.Tasks.Where(t => !t.IsCompleted);
    if (limit.HasValue)
    {
        query = query.OrderByDescending(t => t.CreatedAt).Take(limit.Value);
    }
    else
    {
        query = query.OrderByDescending(t => t.CreatedAt);
    }
    var items = await query.ToListAsync();
    return Results.Ok(items.Select(t => new {
        t.Id, t.Title, t.Description, t.IsCompleted, t.CreatedAt
    }));
});

app.MapPost("/api/tasks", async (TaskCreateDto dto, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(dto.Title))
        return Results.BadRequest(new { error = "Title is required" });
    if (dto.Title.Length > 200)
        return Results.BadRequest(new { error = "Title must be <= 200 chars" });
    if (dto.Description?.Length > 1000)
        return Results.BadRequest(new { error = "Description must be <= 1000 chars" });

    var item = new TaskItem
    {
        Title = dto.Title.Trim(),
        Description = dto.Description?.Trim()
    };
    db.Tasks.Add(item);
    await db.SaveChangesAsync();
    return Results.Created($"/api/tasks/{item.Id}", new { item.Id });
});

app.MapPatch("/api/tasks/{id}/complete", async (int id, AppDbContext db) =>
{
    var item = await db.Tasks.FindAsync(id);
    if (item == null) return Results.NotFound();
    if (item.IsCompleted) return Results.NoContent();
    item.IsCompleted = true;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

namespace Tasky.Api.Models
{
    public record TaskCreateDto(string Title, string? Description);
}
