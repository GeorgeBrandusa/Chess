using Chess.Core.Entities;
using Chess.Core.Models;

namespace Chess.Application.Services;

public static class BoardFactory
{
    public static BoardState Create()
    {
        return new BoardState
        {
            Pieces =
            [
                new ChessPiece
                {
                    Id = Guid.NewGuid(),
                    Type = PieceType.Rook,
                    Color = PieceColor.White,
                    Row = 0,
                    Column = 0
                },

                new ChessPiece
                {
                    Id = Guid.NewGuid(),
                    Type = PieceType.Knight,
                    Color = PieceColor.White,
                    Row = 0,
                    Column = 1
                }
            ]
        };
    }
}