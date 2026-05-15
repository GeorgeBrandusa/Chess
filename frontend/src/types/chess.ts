export type PieceType =
  | "Pawn"
  | "Rook"
  | "Knight"
  | "Bishop"
  | "Queen"
  | "King";

export type PieceColor =
  | "White"
  | "Black";

export interface ChessPiece {
  id: string;
  type: PieceType;
  color: PieceColor;
  row: number;
  column: number;
}

export interface BoardState {
  pieces: ChessPiece[];
}

export interface GameClockState {
  currentTurn: PieceColor;
  whiteTimeSeconds: number;
  blackTimeSeconds: number;
  isGameOver: boolean;
}