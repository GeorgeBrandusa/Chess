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
                // WHITE

                CreatePiece(PieceType.Rook, PieceColor.White, 0, 0),
                CreatePiece(PieceType.Knight, PieceColor.White, 0, 1),
                CreatePiece(PieceType.Bishop, PieceColor.White, 0, 2),
                CreatePiece(PieceType.Queen, PieceColor.White, 0, 3),
                CreatePiece(PieceType.King, PieceColor.White, 0, 4),
                CreatePiece(PieceType.Bishop, PieceColor.White, 0, 5),
                CreatePiece(PieceType.Knight, PieceColor.White, 0, 6),
                CreatePiece(PieceType.Rook, PieceColor.White, 0, 7),

                // WHITE PAWNS

                CreatePiece(PieceType.Pawn, PieceColor.White, 1, 0),
                CreatePiece(PieceType.Pawn, PieceColor.White, 1, 1),
                CreatePiece(PieceType.Pawn, PieceColor.White, 1, 2),
                CreatePiece(PieceType.Pawn, PieceColor.White, 1, 3),
                CreatePiece(PieceType.Pawn, PieceColor.White, 1, 4),
                CreatePiece(PieceType.Pawn, PieceColor.White, 1, 5),
                CreatePiece(PieceType.Pawn, PieceColor.White, 1, 6),
                CreatePiece(PieceType.Pawn, PieceColor.White, 1, 7),

                // BLACK

                CreatePiece(PieceType.Rook, PieceColor.Black, 7, 0),
                CreatePiece(PieceType.Knight, PieceColor.Black, 7, 1),
                CreatePiece(PieceType.Bishop, PieceColor.Black, 7, 2),
                CreatePiece(PieceType.Queen, PieceColor.Black, 7, 3),
                CreatePiece(PieceType.King, PieceColor.Black, 7, 4),
                CreatePiece(PieceType.Bishop, PieceColor.Black, 7, 5),
                CreatePiece(PieceType.Knight, PieceColor.Black, 7, 6),
                CreatePiece(PieceType.Rook, PieceColor.Black, 7, 7),

                // BLACK PAWNS

                CreatePiece(PieceType.Pawn, PieceColor.Black, 6, 0),
                CreatePiece(PieceType.Pawn, PieceColor.Black, 6, 1),
                CreatePiece(PieceType.Pawn, PieceColor.Black, 6, 2),
                CreatePiece(PieceType.Pawn, PieceColor.Black, 6, 3),
                CreatePiece(PieceType.Pawn, PieceColor.Black, 6, 4),
                CreatePiece(PieceType.Pawn, PieceColor.Black, 6, 5),
                CreatePiece(PieceType.Pawn, PieceColor.Black, 6, 6),
                CreatePiece(PieceType.Pawn, PieceColor.Black, 6, 7)
            ]
        };
    }

    private static ChessPiece CreatePiece(
        PieceType type,
        PieceColor color,
        int row,
        int col)
    {
        return new ChessPiece
        {
            Id = Guid.NewGuid(),
            Type = type,
            Color = color,
            Row = row,
            Column = col
        };
    }
}