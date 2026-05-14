import type { ChessPiece, BoardState } from "../types/chess";

export const isValidMove = (
  piece: ChessPiece,
  targetRow: number,
  targetCol: number,
  boardState?: BoardState
): boolean => {
  // Can't move to same square
  if (piece.row === targetRow && piece.column === targetCol) {
    return false;
  }

  // Check bounds
  if (targetRow < 0 || targetRow > 7 || targetCol < 0 || targetCol > 7) {
    return false;
  }

  switch (piece.type) {
    case "Pawn":
      return isValidPawnMove(piece, targetRow, targetCol, boardState);
    case "Rook":
      return isValidRookMove(piece, targetRow, targetCol, boardState);
    case "Knight":
      return isValidKnightMove(piece, targetRow, targetCol, boardState);
    case "Bishop":
      return isValidBishopMove(piece, targetRow, targetCol, boardState);
    case "Queen":
      return isValidQueenMove(piece, targetRow, targetCol, boardState);
    case "King":
      return isValidKingMove(piece, targetRow, targetCol, boardState);
    default:
      return false;
  }
};

const isValidPawnMove = (
  piece: ChessPiece,
  targetRow: number,
  targetCol: number,
  boardState?: BoardState
): boolean => {
  const direction = piece.color === "White" ? 1 : -1;
  const startRow = piece.color === "White" ? 1 : 6;

  // Forward move (one square)
  if (
    piece.column === targetCol &&
    targetRow === piece.row + direction
  ) {
    const isBlocked = boardState?.pieces.some(
      p => p.row === targetRow && p.column === targetCol
    );
    return !isBlocked;
  }

  // Forward move (two squares from start)
  if (
    piece.column === targetCol &&
    piece.row === startRow &&
    targetRow === piece.row + 2 * direction
  ) {
    const isBlocked = boardState?.pieces.some(
      p => (p.row === targetRow || p.row === piece.row + direction) && p.column === targetCol
    );
    return !isBlocked;
  }

  // Capture diagonally
  if (
    Math.abs(targetCol - piece.column) === 1 &&
    targetRow === piece.row + direction
  ) {
    const target = boardState?.pieces.find(
      p => p.row === targetRow && p.column === targetCol
    );
    return target ? target.color !== piece.color : false;
  }

  return false;
};

const isValidRookMove = (
  piece: ChessPiece,
  targetRow: number,
  targetCol: number,
  boardState?: BoardState
): boolean => {
  if (piece.row !== targetRow && piece.column !== targetCol) {
    return false;
  }

  return !isPathBlocked(piece.row, piece.column, targetRow, targetCol, boardState);
};

const isValidKnightMove = (
  piece: ChessPiece,
  targetRow: number,
  targetCol: number,
  boardState?: BoardState
): boolean => {
  const rowDiff = Math.abs(targetRow - piece.row);
  const colDiff = Math.abs(targetCol - piece.column);

  if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
    return false;
  }

  // Check if destination has own piece
  const target = boardState?.pieces.find(
    p => p.row === targetRow && p.column === targetCol
  );
  return !target || target.color !== piece.color;
};

const isValidBishopMove = (
  piece: ChessPiece,
  targetRow: number,
  targetCol: number,
  boardState?: BoardState
): boolean => {
  const rowDiff = Math.abs(targetRow - piece.row);
  const colDiff = Math.abs(targetCol - piece.column);

  if (rowDiff !== colDiff) {
    return false;
  }

  return !isPathBlocked(piece.row, piece.column, targetRow, targetCol, boardState);
};

const isValidQueenMove = (
  piece: ChessPiece,
  targetRow: number,
  targetCol: number,
  boardState?: BoardState
): boolean => {
  const isRookMove = piece.row === targetRow || piece.column === targetCol;
  const isBishopMove = Math.abs(targetRow - piece.row) === Math.abs(targetCol - piece.column);

  if (!isRookMove && !isBishopMove) {
    return false;
  }

  return !isPathBlocked(piece.row, piece.column, targetRow, targetCol, boardState);
};

const isValidKingMove = (
  piece: ChessPiece,
  targetRow: number,
  targetCol: number,
  boardState?: BoardState
): boolean => {
  const rowDiff = Math.abs(targetRow - piece.row);
  const colDiff = Math.abs(targetCol - piece.column);

  if (!(rowDiff <= 1 && colDiff <= 1 && (rowDiff !== 0 || colDiff !== 0))) {
    return false;
  }

  // Check if destination has own piece
  const target = boardState?.pieces.find(
    p => p.row === targetRow && p.column === targetCol
  );
  return !target || target.color !== piece.color;
};

const isPathBlocked = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  boardState?: BoardState
): boolean => {
  const rowStep = toRow === fromRow ? 0 : toRow > fromRow ? 1 : -1;
  const colStep = toCol === fromCol ? 0 : toCol > fromCol ? 1 : -1;

  let currentRow = fromRow + rowStep;
  let currentCol = fromCol + colStep;

  while (currentRow !== toRow || currentCol !== toCol) {
    const isBlocked = boardState?.pieces.some(
      p => p.row === currentRow && p.column === currentCol
    );
    if (isBlocked) return true;

    currentRow += rowStep;
    currentCol += colStep;
  }

  // Check if destination has own piece
  const target = boardState?.pieces.find(
    p => p.row === toRow && p.column === toCol
  );
  return target ? target.color === boardState?.pieces.find(p => p.row === fromRow && p.column === fromCol)?.color : false;
};

export const isInCheck = (
  color: "White" | "Black",
  boardState: BoardState
): boolean => {
  const king = boardState.pieces.find(
    p => p.type === "King" && p.color === color
  );

  if (!king) return false;

  const opponentColor = color === "White" ? "Black" : "White";
  return boardState.pieces.some(
    p =>
      p.color === opponentColor &&
      isValidMove(p, king.row, king.column, boardState)
  );
};

export const isInCheckmate = (
  color: "White" | "Black",
  boardState: BoardState
): boolean => {
  if (!isInCheck(color, boardState)) return false;

  // Check if there's any legal move
  for (const piece of boardState.pieces.filter(p => p.color === color)) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (isValidMove(piece, row, col, boardState)) {
          // Simulate move
          const newBoard = {
            ...boardState,
            pieces: boardState.pieces.map(p =>
              p.id === piece.id ? { ...p, row, column: col } : p
            ).filter(p => !(p.row === row && p.column === col && p.id !== piece.id))
          };

          if (!isInCheck(color, newBoard)) {
            return false;
          }
        }
      }
    }
  }

  return true;
};