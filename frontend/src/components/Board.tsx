import { useEffect, useState, useCallback } from "react";
import { api } from "../services/chessApi";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { BoardState, PieceColor, PieceType } from "../types/chess";
import { isValidMove } from "../utils/chessRules";

interface BoardProps {
  onTurnChange: (turn: "White" | "Black") => void;
  onPieceSelect: (pieceName: string) => void;
  onAiThinking: (thinking: boolean) => void;
}

const Board = ({ onTurnChange, onPieceSelect, onAiThinking }: BoardProps) => {
  const [board, setBoard] = useState<BoardState>();
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<"White" | "Black">("White");
  const [validMoves, setValidMoves] = useState<Array<{ row: number; col: number }>>([]);
  const boardAnimation: Variants = {
    hidden: { opacity: 0, scale: 0.96, y: 18 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.45, staggerChildren: 0.005 }
    }
  };

  const squareAnimation = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 }
  };

  useEffect(() => {
    api.get("/api/board").then(res => setBoard(res.data));
  }, []);

  // Funcția principală de mutare (apelată de om și AI)
  const executeMove = useCallback((pieceId: string, toRow: number, toCol: number) => {
    setBoard(prev => {
      if (!prev) return prev;
      const piece = prev.pieces.find(p => p.id === pieceId);
      if (!piece) return prev;

      const capturedPiece = prev.pieces.find(p => p.row === toRow && p.column === toCol);
      const newPieces = prev.pieces
        .filter(p => !capturedPiece || p.id !== capturedPiece.id)
        .map(p => (p.id === pieceId ? { ...p, row: toRow, column: toCol } : p));

      return { ...prev, pieces: newPieces };
    });

    setCurrentTurn(prev => (prev === "White" ? "Black" : "White"));
    setSelectedPieceId(null);
    setValidMoves([]);
    onPieceSelect("None");
  }, [onPieceSelect]);

  // Logica AI (Hugging Face)
  const handleAiTurn = useCallback(async () => {
    if (!board || currentTurn === "White") return;

    onAiThinking(true);
    try {
      // Simulăm un apel API (Înlocuiește cu logica reală de serializare FEN dacă ai modelul activ)
      // Pentru demo, AI-ul alege cea mai bună mutare (prima captură găsită sau random)
      const blackPieces = board.pieces.filter(p => p.color === "Black");
      let bestMove = null;

      for (const p of blackPieces) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (isValidMove(p, r, c, board)) moves.push({ r, c });
          }
        }
        if (moves.length > 0) {
          bestMove = { pieceId: p.id, to: moves[Math.floor(Math.random() * moves.length)] };
          break;
        }
      }

      await new Promise(r => setTimeout(r, 1200)); // Delay pentru realism
      if (bestMove) executeMove(bestMove.pieceId, bestMove.to.r, bestMove.to.c);
    } catch (e) {
      console.error("AI Error", e);
    } finally {
      onAiThinking(false);
    }
  }, [board, currentTurn, executeMove, onAiThinking]);

  useEffect(() => {
    onTurnChange(currentTurn);
  }, [currentTurn, onTurnChange]);

  useEffect(() => {
    if (currentTurn !== "Black") return;

    const timeoutId = window.setTimeout(() => {
      void handleAiTurn();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [currentTurn, handleAiTurn]);

  const onSquareClick = (row: number, col: number) => {
    if (currentTurn === "Black") return; // Blocăm input-ul când mută AI

    const clickedPiece = board?.pieces.find(p => p.row === row && p.column === col);

    if (clickedPiece && clickedPiece.color === "White") {
      setSelectedPieceId(clickedPiece.id);
      onPieceSelect(`White ${clickedPiece.type}`);
      // Calculăm mutări valide (simplificat)
      const moves = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (isValidMove(clickedPiece, r, c, board)) moves.push({ row: r, col: c });
        }
      }
      setValidMoves(moves);
    } else if (selectedPieceId) {
      const piece = board?.pieces.find(p => p.id === selectedPieceId);
      if (piece && isValidMove(piece, row, col, board)) {
        executeMove(selectedPieceId, row, col);
      }
    }
  };

  const getPieceSymbol = (type: PieceType, color: PieceColor) => {
    const symbols: Record<PieceColor, Record<PieceType, string>> = {
      White: { King: "♔", Queen: "♕", Rook: "♖", Bishop: "♗", Knight: "♘", Pawn: "♙" },
      Black: { King: "♚", Queen: "♛", Rook: "♜", Bishop: "♝", Knight: "♞", Pawn: "♟" }
    };
    return symbols[color][type];
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={boardAnimation}
      className="relative w-full max-w-[min(92vw,640px)] rounded-[40px] border border-white/10 bg-slate-950/45 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6"
    >
      <div className="pointer-events-none absolute inset-0 rounded-[40px] bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.10),_transparent_34%)]" />

      <div className="relative aspect-square w-full overflow-hidden rounded-[28px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.35)]">
        <div className="pointer-events-none absolute inset-0 grid grid-cols-8 opacity-15">
          {Array.from({ length: 64 }).map((_, index) => (
            <div key={`grid-${index}`} className="border border-white/20" />
          ))}
        </div>

        <div className="grid h-full grid-cols-8">
        {Array.from({ length: 64 }).map((_, index) => {
          const displayRow = Math.floor(index / 8);
          const displayCol = index % 8;
          const boardRow = 7 - displayRow;
          const boardCol = displayCol;
          const isDark = (displayRow + displayCol) % 2 === 1;
          const piece = board?.pieces.find(p => p.row === boardRow && p.column === boardCol);
          const isSelected = piece?.id === selectedPieceId;
          const isValid = validMoves.some(m => m.row === boardRow && m.col === boardCol);

          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => onSquareClick(boardRow, boardCol)}
              variants={squareAnimation}
              whileHover={{ scale: 1.03, zIndex: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative flex items-center justify-center overflow-hidden transition-colors duration-200 focus:outline-none
                ${isDark ? "bg-[#35506f]" : "bg-[#d8d0c2]"}
                ${isSelected ? "ring-4 ring-inset ring-amber-300/90 bg-amber-300/35" : ""}
                ${isValid ? "after:content-[''] after:absolute after:h-4 after:w-4 after:rounded-full after:bg-emerald-400/45 after:shadow-[0_0_18px_rgba(52,211,153,0.45)] after:z-0" : ""}
                hover:brightness-110 focus-visible:ring-2 focus-visible:ring-cyan-300/80`}
            >
              {piece && (
                <motion.div
                  layoutId={piece.id}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 480, damping: 28 }}
                  className={`text-6xl select-none z-10 transition-transform duration-200 group-hover:scale-110 ${piece.color === "White" ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" : "text-black drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]"}`}
                >
                  {getPieceSymbol(piece.type, piece.color)}
                </motion.div>
              )}
            </motion.button>
          );
        })}
        </div>
      </div>
    </motion.div>
  );
};

export default Board;