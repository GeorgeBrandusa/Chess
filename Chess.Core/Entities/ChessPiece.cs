namespace Chess.Core.Entities;

public class ChessPiece
{
    public Guid Id { get; set; }

    public PieceType Type { get; set; }

    public PieceColor Color { get; set; }

    public int Row { get; set; }

    public int Column { get; set; }
}