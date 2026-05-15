import axios from "axios";
import type { BoardState } from "../types/chess";

const HF_API_URL = "https://api-inference.huggingface.co/models/m-v-p/chess-move-prediction";
const HF_TOKEN = "hf_xxxxxxxxxxxx"; // Cheia ta de la Hugging Face

const serializeBoard = (board: BoardState) =>
  board.pieces
    .map(piece => `${piece.color[0]}${piece.type[0]}@${piece.row},${piece.column}`)
    .join(";");

export const getBestMoveFromAI = async (board: BoardState) => {
  try {
    // În 2026, transformăm board.pieces într-un format înțeles de AI (FEN string)
    const boardRepresentation = serializeBoard(board); 

    const response = await axios.post(
      HF_API_URL,
      { inputs: boardRepresentation },
      { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
    );

    return response.data; // Returnează mutarea (ex: { from: "e2", to: "e4" })
  } catch (error) {
    console.error("AI Error:", error);
    return null;
  }
};