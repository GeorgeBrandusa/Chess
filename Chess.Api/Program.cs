using Chess.Application.Services;
using Chess.Api.Services;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<GameClockService>();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("cors", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyOrigin();
    });
});

var app = builder.Build();

app.UseCors("cors");

app.MapGet("/api/board", () =>
{
    return BoardFactory.Create();
});

app.MapGet("/api/game-clock", (GameClockService gameClockService) =>
{
    return gameClockService.GetState();
});

app.MapPost("/api/game-clock/turn", (GameClockService gameClockService, TurnRequest request) =>
{
    return Results.Ok(gameClockService.SetTurn(request.Turn));
});

app.MapPost("/api/game-clock/reset", (GameClockService gameClockService) =>
{
    return Results.Ok(gameClockService.Reset());
});

app.Run();

public sealed record TurnRequest(string Turn);