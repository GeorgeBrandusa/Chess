namespace Chess.Api.Services;

public sealed class GameClockService
{
    private static readonly TimeSpan InitialTime = TimeSpan.FromMinutes(10);
    private readonly object _gate = new();
    private TimeSpan _whiteRemaining = InitialTime;
    private TimeSpan _blackRemaining = InitialTime;
    private string _currentTurn = "White";
    private DateTime _turnStartedAtUtc;
    private bool _initialized = false;

    public GameClockState GetState()
    {
        lock (_gate)
        {
            if (!_initialized)
            {
                _turnStartedAtUtc = DateTime.UtcNow;
                _initialized = true;
            }
            return BuildState(DateTime.UtcNow);
        }
    }

    public GameClockState SetTurn(string turn)
    {
        lock (_gate)
        {
            if (!_initialized)
            {
                _turnStartedAtUtc = DateTime.UtcNow;
                _initialized = true;
            }

            var normalizedTurn = NormalizeTurn(turn);
            if (normalizedTurn == _currentTurn)
            {
                return BuildState(DateTime.UtcNow);
            }

            ApplyElapsed(DateTime.UtcNow);
            _currentTurn = normalizedTurn;
            _turnStartedAtUtc = DateTime.UtcNow;

            return BuildState(DateTime.UtcNow);
        }
    }

    public GameClockState Reset()
    {
        lock (_gate)
        {
            _whiteRemaining = InitialTime;
            _blackRemaining = InitialTime;
            _currentTurn = "White";
            _turnStartedAtUtc = DateTime.UtcNow;
            _initialized = true;

            return BuildState(DateTime.UtcNow);
        }
    }

    private GameClockState BuildState(DateTime nowUtc)
    {
        var whiteRemaining = _whiteRemaining;
        var blackRemaining = _blackRemaining;

        var elapsed = nowUtc - _turnStartedAtUtc;
        if (elapsed > TimeSpan.Zero)
        {
            if (_currentTurn == "White")
            {
                whiteRemaining = ClampToZero(whiteRemaining - elapsed);
            }
            else
            {
                blackRemaining = ClampToZero(blackRemaining - elapsed);
            }
        }

        return new GameClockState(
            _currentTurn,
            (int)Math.Ceiling(whiteRemaining.TotalSeconds),
            (int)Math.Ceiling(blackRemaining.TotalSeconds),
            whiteRemaining <= TimeSpan.Zero || blackRemaining <= TimeSpan.Zero
        );
    }

    private void ApplyElapsed(DateTime nowUtc)
    {
        var elapsed = nowUtc - _turnStartedAtUtc;
        if (elapsed <= TimeSpan.Zero)
        {
            return;
        }

        if (_currentTurn == "White")
        {
            _whiteRemaining = ClampToZero(_whiteRemaining - elapsed);
        }
        else
        {
            _blackRemaining = ClampToZero(_blackRemaining - elapsed);
        }
    }

    private static TimeSpan ClampToZero(TimeSpan value) => value < TimeSpan.Zero ? TimeSpan.Zero : value;

    private static string NormalizeTurn(string turn) => turn == "Black" ? "Black" : "White";
}

public sealed record GameClockState(
    string CurrentTurn,
    int WhiteTimeSeconds,
    int BlackTimeSeconds,
    bool IsGameOver
);