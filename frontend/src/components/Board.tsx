import { useEffect, useState } from "react";
import { api } from "../services/chessApi";
import type { BoardState } from "../types/chess";

const Board = () => {
  const [board, setBoard] =
    useState<BoardState>();

  useEffect(() => {
    api.get("/api/board")
      .then(res => setBoard(res.data));
  }, []);

  const renderPiece = (
    row: number,
    col: number
  ) => {

    const piece = board?.pieces.find(
      p => p.row === row &&
           p.column === col
    );

    if (!piece) return null;

    return (
      <div className="text-4xl">
        {piece.type === "Rook" && "♜"}
        {piece.type === "Knight" && "♞"}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-8 w-[640px] h-[640px] border">
      {Array.from({ length: 64 }).map((_, index) => {

        const row = Math.floor(index / 8);
        const col = index % 8;

        const isDark =
          (row + col) % 2 === 1;

        return (
          <div
            key={index}
            className={`
              flex
              items-center
              justify-center
              ${isDark
                ? "bg-green-700"
                : "bg-amber-100"}
            `}
          >
            {renderPiece(row, col)}
          </div>
        );
      })}
    </div>
  );
};

export default Board;