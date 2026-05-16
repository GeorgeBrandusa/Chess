import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Board from "./components/Board";
import { api } from "./services/chessApi";
import type { GameClockState } from "./types/chess";

function App() {
  const [status, setStatus] = useState<"White" | "Black">("White");
  const [selectedPieceName, setSelectedPieceName] = useState<string>("None");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [whiteTime, setWhiteTime] = useState(10 * 60);
  const [blackTime, setBlackTime] = useState(10 * 60);

  useEffect(() => {
    const syncClock = async () => {
      try {
        const response = await api.get<GameClockState>("/api/game-clock");
        const clock = response.data;

        console.log("Clock data received:", clock);
        console.log("White time:", clock.whiteTimeSeconds, "Black time:", clock.blackTimeSeconds);

        setStatus(clock.currentTurn);
        setWhiteTime(clock.whiteTimeSeconds);
        setBlackTime(clock.blackTimeSeconds);
      } catch (error) {
        console.error("Failed to sync game clock", error);
      }
    };

    void syncClock();
    const timerId = window.setInterval(() => {
      void syncClock();
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    const syncTurn = async () => {
      try {
        await api.post("/api/game-clock/turn", { turn: status });
      } catch (error) {
        console.error("Failed to update backend turn", error);
      }
    };

    void syncTurn();
  }, [status]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
      const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  };

  const whiteActive = status === "White";
  const blackActive = status === "Black";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_30%),radial-gradient(circle_at_85%_20%,_rgba(16,185,129,0.12),_transparent_24%),linear-gradient(180deg,_#08111d_0%,_#04070d_100%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

      <motion.main
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative mx-auto flex min-h-screen w-full max-w-[1500px] items-center justify-center px-4 py-8 sm:px-8"
      >
        <div className="flex w-full flex-col gap-6 xl:flex-row xl:items-start xl:gap-8">
          <Board
            onTurnChange={setStatus}
            onPieceSelect={setSelectedPieceName}
            onAiThinking={setIsAiThinking}
            isAiEnabled={isAiEnabled}
          />

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
            className="w-full max-w-[360px] rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl xl:sticky xl:top-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Sah 2026</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  Chess Arena
                </h1>
              </div>

              <motion.div
                animate={{ rotate: isAiThinking ? 360 : 0, scale: isAiThinking ? 1.05 : 1 }}
                transition={{ duration: 1, repeat: isAiThinking ? Infinity : 0, ease: "linear" }}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.15)]"
              >
                ♟
              </motion.div>
            </div>

            <div className="space-y-4">
              <motion.div
                animate={isAiThinking ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                transition={{ duration: 1.2, repeat: isAiThinking ? Infinity : 0 }}
                className={`rounded-3xl border p-4 transition-all duration-500 ${isAiThinking ? "border-fuchsia-400/35 bg-fuchsia-500/12 shadow-[0_0_30px_rgba(217,70,239,0.12)]" : "border-white/10 bg-black/20"}`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/45">Status</p>
                <div className="mt-3 flex items-center gap-3">
                  <p className="text-lg font-medium text-white">
                    {isAiThinking ? "AI analizează..." : status === "White" ? "Rândul tău" : "AI mută..."}
                  </p>
                  {isAiThinking && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 rounded-full border-2 border-fuchsia-300 border-t-transparent"
                    />
                  )}
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    animate={isAiThinking ? { x: ["0%", "120%"] } : { x: "0%" }}
                    transition={{ duration: 1.1, repeat: isAiThinking ? Infinity : 0, ease: "easeInOut" }}
                    className="h-full w-1/3 rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300"
                  />
                </div>
              </motion.div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/45">Piesă selectată</p>
                <motion.p
                  key={selectedPieceName}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 text-lg font-medium text-cyan-200"
                >
                  {selectedPieceName}
                </motion.p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  animate={whiteActive ? { scale: 1.02, y: -2 } : { scale: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-3xl border p-4 ${whiteActive ? "border-cyan-300/40 bg-cyan-400/12 shadow-[0_0_24px_rgba(34,211,238,0.12)]" : "border-white/10 bg-white/6"}`}
                >
                  <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Alb</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{formatTime(whiteTime)}</p>
                  <p className="mt-1 text-xs text-white/45">{whiteActive ? "La mutare" : "Așteaptă"}</p>
                </motion.div>
                <motion.div
                  animate={blackActive ? { scale: 1.02, y: -2 } : { scale: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-3xl border p-4 ${blackActive ? "border-fuchsia-300/40 bg-fuchsia-500/12 shadow-[0_0_24px_rgba(217,70,239,0.12)]" : "border-white/10 bg-white/6"}`}
                >
                  <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Negru</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{formatTime(blackTime)}</p>
                  <p className="mt-1 text-xs text-white/45">{blackActive ? "La mutare" : "Așteaptă"}</p>
                </motion.div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/45">Tur curent</p>
                <p className="mt-2 text-lg font-medium text-cyan-200">
                  {status === "White" ? "Alb" : "Negru"}
                </p>
              </div>

              <button
                onClick={() => setIsAiEnabled(!isAiEnabled)}
                className={`rounded-3xl border p-4 font-semibold transition-all duration-300 ${
                  isAiEnabled
                    ? "border-cyan-400/40 bg-cyan-400/12 text-cyan-200"
                    : "border-fuchsia-400/40 bg-fuchsia-500/12 text-fuchsia-200"
                }`}
              >
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Mod joc</p>
                <p className="mt-2 text-base font-medium">
                  {isAiEnabled ? "vs AI" : "1 vs 1"}
                </p>
              </button>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/70 text-center">
                Chess Arena 2026
              </div>

              <div className="pt-2 text-center text-[10px] uppercase tracking-[0.35em] text-white/30">
                Powered by Hugging Face AI Model
              </div>
            </div>
          </motion.aside>
        </div>
      </motion.main>
    </div>
  );
}

export default App;