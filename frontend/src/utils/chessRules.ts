import type { ChessPiece } from "../types/chess";

export const isValidMove = (
  piece: ChessPiece,
  targetRow: number,
  targetCol: number
): boolean => {

  switch (piece.type) {

    case "Rook":
      return isValidRookMove(
        piece,
        targetRow,
        targetCol
      );

    case "Knight":
      return isValidKnightMove(
        piece,
        targetRow,
        targetCol
      );

    default:
      return false;
  }
};

const isValidRookMove = (
  piece: ChessPiece,
  targetRow: number,
  targetCol: number
): boolean => {

  return (
    piece.row === targetRow ||
    piece.column === targetCol
  );
};

const isValidKnightMove = (
  piece: ChessPiece,
  targetRow: number,
  targetCol: number
): boolean => {

  const rowDiff = Math.abs(
    targetRow - piece.row
  );

  const colDiff = Math.abs(
    targetCol - piece.column
  );

  return (
    (rowDiff === 2 && colDiff === 1) ||
    (rowDiff === 1 && colDiff === 2)
  );
};