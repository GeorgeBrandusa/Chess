import { useEffect, useState, useCallback, useTransition } from "react";
import { api } from "../services/chessApi";
import type { BoardState } from "../types/chess";
import { isValidMove } from "../utils/chessRules";

interface BoardProps {
  onTurnChange: (turn: "White" | "Black") => void;
  onPieceSelect: (pieceName: string) => void;
  onAiThinking: (thinking: boolean) => void;
  isAiEnabled?: boolean;
}

const Board = ({ onTurnChange, onPieceSelect, onAiThinking, isAiEnabled = true }: BoardProps) => {
  const [, startTransition] = useTransition();
  const [board, setBoard] = useState<BoardState>();
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<"White" | "Black">("White");
  const [validMoves, setValidMoves] = useState<Array<{ row: number; col: number }>>([]);

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
    if (currentTurn === "Black" && isAiEnabled) {
      startTransition(() => {
        handleAiTurn();
      });
    }
  }, [currentTurn, handleAiTurn, startTransition, isAiEnabled]);

  const onSquareClick = (row: number, col: number) => {
    if (currentTurn === "Black" && isAiEnabled) return; // Blocăm input-ul doar când mută AI

    const clickedPiece = board?.pieces.find(p => p.row === row && p.column === col);

    if (clickedPiece && clickedPiece.color === currentTurn) {
      setSelectedPieceId(clickedPiece.id);
      onPieceSelect(`${currentTurn} ${clickedPiece.type}`);
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

  const getPieceSymbol = (type: string, color: string) => {
    const symbols: Record<string, Record<string, string>> = {
      White: { King: "♔", Queen: "♕", Rook: "♖", Bishop: "♗", Knight: "♘", Pawn: "♙" },
      Black: { King: "♚", Queen: "♛", Rook: "♜", Bishop: "♝", Knight: "♞", Pawn: "♟" }
    };
    return symbols[color][type];
  };

  return (
    <div className="relative p-8 rounded-[40px] bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
      <div className="grid grid-cols-8 w-[600px] h-[600px] rounded-lg overflow-hidden border-8 border-slate-800/50 shadow-inner">
        {Array.from({ length: 64 }).map((_, index) => {
          const row = 7 - Math.floor(index / 8);
          const col = index % 8;
          const isDark = (row + col) % 2 === 1;
          const piece = board?.pieces.find(p => p.row === row && p.column === col);
          const isSelected = piece?.id === selectedPieceId;
          const isValid = validMoves.some(m => m.row === row && m.col === col);

          return (
            <div
              key={index}
              onClick={() => onSquareClick(row, col)}
              className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer
                ${isDark ? "bg-slate-700" : "bg-slate-300"}
                ${isSelected ? "bg-yellow-400/40 ring-inset ring-4 ring-yellow-400" : ""}
                ${isValid ? "after:content-[''] after:w-4 after:h-4 after:bg-green-500/40 after:rounded-full after:z-0" : ""}
                hover:brightness-110`}
            >
              {piece && (
                <div
                  className={`text-6xl select-none z-10 ${piece.color === "White" ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" : "text-black drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]"}`}
                >
                  {getPieceSymbol(piece.type, piece.color)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Board;