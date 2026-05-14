import Board from "./components/Board";

function App() {

  return (
    <div className="min-h-screen flex items-center justify-center p-10">

      <div className="flex gap-10 items-start">

        <Board />

        <div
          className="
            w-[320px]
            bg-white/10
            backdrop-blur-xl
            border border-white/10
            rounded-3xl
            p-6
            shadow-2xl
          "
        >

          <h1 className="text-3xl font-bold mb-6">
            Chess 2026
          </h1>

          <div className="space-y-4">

            <div className="bg-black/20 rounded-2xl p-4">
              <p className="text-sm text-gray-300">
                Status
              </p>

              <p className="text-lg font-semibold">
                White to move
              </p>
            </div>

            <div className="bg-black/20 rounded-2xl p-4">
              <p className="text-sm text-gray-300">
                Selected Piece
              </p>

              <p className="text-lg font-semibold">
                None
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

export default App;