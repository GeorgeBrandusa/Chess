using Chess.Core.Entities;

namespace Chess.Core.Models;

public class BoardState
{
    public List<ChessPiece> Pieces { get; set; } = new();
}