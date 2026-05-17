# Sah

Acesta este un proiect demo de șah: backend în ASP.NET Core și frontend în React + Vite.

Structură scurtă
- `Chess.Api` — API (dotnet 10)
- `Chess.Core`, `Chess.Application` — modele și logică
- `frontend` — client React + TypeScript

Ce-ți trebuie înainte de a începe
- .NET 10 SDK instalat
- Node.js 18+ și `npm`

Rulare locală (2 pași simpli)

1) Pornește API-ul (backend)

```powershell
cd Chess.Api
dotnet build
dotnet run
```

După pornire, API-ul ar trebui să fie la http://localhost:5138 (verifică consola pentru port exact).

2) Pornește clientul (frontend)

```bash
cd frontend
npm install
npm run dev
```

Deschide browserul la http://localhost:5173 (sau portul pe care Vite îl afișează).

Endpoints utile
- `GET /api/board` — întoarce starea inițială a tablei
- `GET /api/game-clock` — starea ceasului de joc
- `POST /api/game-clock/turn` — schimbă tura (body: `{ "turn": "White" }` sau `"Black"`)
- `POST /api/game-clock/reset` — resetează ceasul

Note rapide pentru dezvoltare
- CORS este permis pentru dezvoltare; în producție restrânge originea în [Chess.Api/Program.cs](Chess.Api/Program.cs).
- Tabla de joc este ținută în frontend — backend-ul nu persistă partidele.
- Nu păstra API keys sau token-uri (Hugging Face etc.) în cod; folosește variabile de mediu.

VS Code
- Am adăugat configurații în `.vscode/` (launch, tasks, extensions). Din Run → alege `Run Backend + Frontend` sau rulează taskurile din Command Palette.

Fișiere de referință
- [Chess.Api/Program.cs](Chess.Api/Program.cs)
- [Chess.Api/Services/GameClockService.cs](Chess.Api/Services/GameClockService.cs)
- [Chess.Core/Entities/BoardFactory.cs](Chess.Core/Entities/BoardFactory.cs)
- [frontend/src/components/Board.tsx](frontend/src/components/Board.tsx)

Ce poți face mai departe
- Adaugă teste automate
- Salvează partidele într-o bază de date
- Completează regulile avansate (rocada, en passant, promovare)

Contribuții
- Deschide un issue sau un PR cu propunerile tale.

