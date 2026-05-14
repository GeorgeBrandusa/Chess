import { useEffect, useState } from "react";
import { api } from "../services/chessApi";
import { motion } from "framer-motion";


import type {
  BoardState,
  ChessPiece
} from "../types/chess";

import { isValidMove } from "../utils/chessRules";

const Board = () => {

  const [board, setBoard] =
    useState<BoardState>();

  const [
    selectedPieceId,
    setSelectedPieceId
  ] = useState<string | null>(null);

  const [currentTurn, setCurrentTurn] =
    useState<"White" | "Black">("White");

  const [moveHistory, setMoveHistory] = useState<
    Array<{
      from: { row: number; col: number };
      to: { row: number; col: number };
      piece: string;
      captured?: string;
    }>
  >([]);

  const [boardHistory, setBoardHistory] = useState<BoardState[]>([]);

  const [capturedPieces, setCapturedPieces] = useState<
    { type: string; color: string }[]
  >([]);

  const [validMoves, setValidMoves] = useState<
    Array<{ row: number; col: number }>
  >([]);

  useEffect(() => {

    api.get("/api/board")
      .then(res => setBoard(res.data));

  }, []);

  const selectedPiece =
    board?.pieces.find(
      p => p.id === selectedPieceId
    );

  const getValidMoves = (
    piece: ChessPiece
  ): Array<{ row: number; col: number }> => {
    const moves: Array<{ row: number; col: number }> = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (
          isValidMove(piece, row, col, board) &&
          !(piece.row === row && piece.column === col)
        ) {
          moves.push({ row, col });
        }
      }
    }

    return moves;
  };

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

    if (!selectedPieceId || !board) return;

    const piece =
      board?.pieces.find(
        p => p.id === selectedPieceId
      );

    if (!piece) return;

    const valid = isValidMove(
      piece,
      row,
      col,
      board
    );

    if (!valid) return;

    const capturedPiece = board.pieces.find(
      p => p.row === row && p.column === col
    );

    setBoardHistory([...boardHistory, { ...board }]);

    setBoard(prev => {

      if (!prev) return prev;

      const newPieces = prev.pieces
        .filter(
          p => !capturedPiece || p.id !== capturedPiece.id
        )
        .map(p => {

          if (p.id !== selectedPieceId)
            return p;

          return {
            ...p,
            row,
            column: col
          };
        });

      return {
        ...prev,
        pieces: newPieces
      };
    });

    if (capturedPiece) {
      setCapturedPieces([
        ...capturedPieces,
        {
          type: capturedPiece.type,
          color: capturedPiece.color
        }
      ]);
    }

    setMoveHistory([
      ...moveHistory,
      {
        from: { row: piece.row, col: piece.column },
        to: { row, col },
        piece: `${piece.color} ${piece.type}`,
        captured: capturedPiece
          ? `${capturedPiece.type}`
          : undefined
      }
    ]);

    setCurrentTurn(
      currentTurn === "White" ? "Black" : "White"
    );

    setSelectedPieceId(null);
    setValidMoves([]);
  };

  const undoMove = () => {
    if (boardHistory.length === 0) return;

    const lastBoard = boardHistory[boardHistory.length - 1];
    setBoard(lastBoard);
    setBoardHistory(boardHistory.slice(0, -1));

    const lastMove = moveHistory[moveHistory.length - 1];
    if (lastMove?.captured) {
      setCapturedPieces(capturedPieces.slice(0, -1));
    }

    setMoveHistory(moveHistory.slice(0, -1));
    setCurrentTurn(
      currentTurn === "White" ? "Black" : "White"
    );
    setSelectedPieceId(null);
    setValidMoves([]);
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

        if (piece.color === currentTurn) {
          setSelectedPieceId(piece.id);
          setValidMoves(getValidMoves(piece));
        }
      }}

      className={`
        text-5xl
        cursor-pointer
        select-none
        drop-shadow-2xl
        transition-all
        text-amber-800
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
        flex
        flex-col
        gap-4
      "
    >

      <div
        className="
          flex
          justify-between
          items-center
          px-4
          py-2
          rounded-lg
          bg-white/5
        "
      >
        <div
          className="
            text-lg
            font-semibold
            text-white
          "
        >
          Rândul: <span className={currentTurn === "White" ? "text-gray-300" : "text-gray-600"}>{currentTurn}</span>
        </div>
        <button
          onClick={undoMove}
          disabled={moveHistory.length === 0}
          className="
            px-3
            py-1
            text-sm
            bg-red-500
            hover:bg-red-600
            disabled:bg-gray-600
            disabled:cursor-not-allowed
            text-white
            rounded
            transition-colors
          "
        >
          Undo
        </button>
      </div>

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
                    ? "bg-black"
                    : "bg-white"
                }

                ${
                  isSelected
                    ? "ring-4 ring-yellow-400 z-10"
                    : ""
                }

                ${
                  validMoves.some(m => m.row === row && m.col === col)
                    ? "ring-4 ring-green-400 ring-inset"
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

      <div
        className="
          grid
          grid-cols-2
          gap-4
          px-4
        "
      >
        <div
          className="
            bg-white/5
            rounded-lg
            p-3
          "
        >
          <div className="text-white font-semibold mb-2">
            Piese capturate
          </div>
          <div className="text-amber-800 text-3xl flex flex-wrap gap-1">
            {capturedPieces.map((p, i) => (
              <span key={i}>
                {getPieceSymbol(p.type, p.color)}
              </span>
            ))}
          </div>
        </div>

        <div
          className="
            bg-white/5
            rounded-lg
            p-3
            overflow-y-auto
            max-h-40
          "
        >
          <div className="text-white font-semibold mb-2">
            Istoric mutari
          </div>
          <div className="text-white/70 text-sm">
            {moveHistory.length === 0 ? (
              <span>Nicio mutare</span>
            ) : (
              moveHistory.map((m, i) => (
                <div key={i} className="py-1">
                  {i + 1}. ({m.from.row},{m.from.col}) → ({m.to.row},{m.to.col}) {m.piece}
                  {m.captured && ` x${m.captured}`}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Board;