import { useEffect, useState } from "react";
import { api } from "../services/chessApi";
import { motion } from "framer-motion";


import type {
  BoardState
} from "../types/chess";

import { isValidMove } from "../utils/chessRules";

const Board = () => {

  const [board, setBoard] =
    useState<BoardState>();

  const [
    selectedPieceId,
    setSelectedPieceId
  ] = useState<string | null>(null);

  useEffect(() => {

    api.get("/api/board")
      .then(res => setBoard(res.data));

  }, []);

  const selectedPiece =
    board?.pieces.find(
      p => p.id === selectedPieceId
    );

  const getPieceSymbol = (
    type: string,
    color: string
  ) => {

    const white: Record<string, string> = {
      King: "♔",
      Queen: "♕",
      Rook: "♖",
      Bishop: "♗",
      Knight: "♘",
      Pawn: "♙"
    };

    const black: Record<string, string> = {
      King: "♚",
      Queen: "♛",
      Rook: "♜",
      Bishop: "♝",
      Knight: "♞",
      Pawn: "♟"
    };

    return color === "White"
      ? white[type]
      : black[type];
  };

  const movePiece = (
    row: number,
    col: number
  ) => {

    if (!selectedPieceId) return;

    const piece =
      board?.pieces.find(
        p => p.id === selectedPieceId
      );

    if (!piece) return;

    const valid = isValidMove(
      piece,
      row,
      col
    );

    if (!valid) return;

    setBoard(prev => {

      if (!prev) return prev;

      return {
        ...prev,
        pieces: prev.pieces.map(p => {

          if (p.id !== selectedPieceId)
            return p;

          return {
            ...p,
            row,
            column: col
          };
        })
      };
    });

    setSelectedPieceId(null);
  };

  const renderPiece = (
  row: number,
  col: number
) => {

  const piece = board?.pieces.find(
    p =>
      p.row === row &&
      p.column === col
  );

  if (!piece) return null;

  return (
    <motion.div

      layout

      whileHover={{
        scale: 1.12
      }}

      whileTap={{
        scale: 0.95
      }}

      transition={{
        duration: 0.15
      }}

      onClick={(e) => {

        e.stopPropagation();

        setSelectedPieceId(piece.id);
      }}

      className={`
        text-5xl
        cursor-pointer
        select-none
        drop-shadow-2xl
        transition-all
        ${
          selectedPieceId === piece.id
            ? "scale-125"
            : ""
        }
      `}
    >
      {getPieceSymbol(
        piece.type,
        piece.color
      )}
    </motion.div>
  );
};

  return (

    <div
      className="
        relative
        p-6
        rounded-3xl
        bg-white/10
        backdrop-blur-xl
        border border-white/10
        shadow-2xl
      "
    >

      <div
        className="
          grid
          grid-cols-8
          w-[640px]
          h-[640px]
          overflow-hidden
          rounded-2xl
        "
      >

        {Array.from({ length: 64 }).map((_, index) => {

          const row = Math.floor(index / 8);
          const col = index % 8;

          const isDark =
            (row + col) % 2 === 1;

          const isSelected =
            selectedPiece?.row === row &&
            selectedPiece?.column === col;

          return (
            <div
              key={index}

              onClick={() =>
                movePiece(row, col)
              }

              className={`
                relative
                flex
                items-center
                justify-center
                transition-all
                duration-150

                ${
                  isDark
                    ? "bg-[#769656]"
                    : "bg-[#EEEED2]"
                }

                ${
                  isSelected
                    ? "ring-4 ring-yellow-400 z-10"
                    : ""
                }

                hover:brightness-110
              `}
            >

              {renderPiece(row, col)}

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Board;