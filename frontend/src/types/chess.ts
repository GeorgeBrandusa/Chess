export type PieceType =
  | "Rook"
  | "Knight";

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