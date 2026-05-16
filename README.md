## Documentatie tehnica

### 1. Arhitectura generala

Aplicatia este organizata in 4 zone principale:

- Chess.Api: API HTTP (ASP.NET Core minimal API) care expune tabla initiala si ceasul de joc.
- Chess.Application: strat de aplicatie (logica de construire a tablei).
- Chess.Core: modele de domeniu (piese, culori, tipuri de piese, stare tabla).
- frontend: aplicatia client (React + TypeScript + Vite + Tailwind) pentru interfata jocului.

Model de interactiune:

- Frontend-ul cere starea initiala a tablei de la backend.
- Frontend-ul cere periodic starea ceasului de joc.
- Frontend-ul notifica backend-ul la schimbarea turei.
- Mutarile sunt validate pe client (in utilitarul de reguli), iar starea tablei este mentinuta local in frontend.

### 2. Tehnologii folosite

Backend:

- .NET 10 (target framework net10.0)
- ASP.NET Core Minimal API
- JSON serialization cu enum-uri ca string
- CORS deschis pentru dezvoltare

Frontend:

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Axios
- Framer Motion
- Zustand (disponibil in dependinte)

### 3. Structura proiectului

- Sah.sln
- Chess.Api/
- Chess.Application/
- Chess.Core/
- frontend/

Fisiere importante:

- Chess.Api/Program.cs: configurare API, CORS, endpoint-uri.
- Chess.Api/Services/GameClockService.cs: logica ceasului de joc (10 minute / jucator).
- Chess.Core/Entities/: modele de baza pentru piese.
- Chess.Core/Entities/BoardFactory.cs: pozitia initiala de joc.
- frontend/src/components/Board.tsx: tabla, selectie piese, mutari, integrare AI local.
- frontend/src/utils/chessRules.ts: reguli de validare mutari.
- frontend/src/App.tsx: compunere UI, status joc, ceas, toggle AI.
- frontend/src/services/chessApi.ts: client API catre backend.

### 4. API backend

Base URL (dev): http://localhost:5138

Endpoint-uri:

1. GET /api/board
   - Returneaza starea initiala a tablei:
     - pieces: lista de piese cu id, type, color, row, column

2. GET /api/game-clock
   - Returneaza starea ceasului:
     - currentTurn: White sau Black
     - whiteTimeSeconds: secunde ramase alb
     - blackTimeSeconds: secunde ramase negru
     - isGameOver: true cand unul dintre timpi ajunge la 0

3. POST /api/game-clock/turn
   - Body:
       {
         "turn": "White" | "Black"
       }
   - Schimba tura activa in ceas

4. POST /api/game-clock/reset
   - Reseteaza ceasul la starea initiala (10:00 / 10:00, tura White)

### 5. Model date (domain + frontend)

Entitati principale:

- ChessPiece
  - id: Guid/string
  - type: Pawn, Rook, Knight, Bishop, Queen, King
  - color: White, Black
  - row: 0..7
  - column: 0..7

- BoardState
  - pieces: colectie de ChessPiece

- GameClockState
  - currentTurn
  - whiteTimeSeconds
  - blackTimeSeconds
  - isGameOver

### 6. Flux runtime

Pornire backend:

    cd Chess.Api
    dotnet run

Pornire frontend:

    cd frontend
    npm install
    npm run dev

La rulare:

- Frontend-ul incarca tabla initiala prin GET /api/board.
- Frontend-ul sincronizeaza ceasul la fiecare secunda prin GET /api/game-clock.
- La fiecare schimbare de tura in UI, frontend-ul trimite POST /api/game-clock/turn.

### 7. Decizii tehnice si observatii

- Persistenta mutarilor nu este in backend: tabla este mentinuta in starea frontend-ului.
- CORS este complet deschis (AllowAnyOrigin/Method/Header), potrivit pentru dezvoltare, nu recomandat in productie.
- Ceasul este server-side si thread-safe (foloseste lock intern).
- AI-ul activ din Board.tsx este un fallback local (selectie mutare valida), cu delay pentru experienta vizuala.
- Exista un serviciu separat pentru Hugging Face (frontend/src/services/aiService.ts), dar integrarea efectiva in fluxul principal nu este finalizata.

### 8. Limitari tehnice curente

- Reguli avansate de sah lipsa sau partiale: rocada, en passant, promovare pion, remiza etc.
- Verificarile de sah/sah-mat exista utilitar, dar nu sunt orchestrate complet in fluxul de joc UI.
- Nu exista testare automata (unit/integration/e2e) configurata.
- Token-ul Hugging Face in cod este placeholder si nu trebuie hardcodat in productie.

## Documentatie functionala

### 1. Scopul aplicatiei

Aplicatia permite jucarea unei partide de sah intr-o interfata web moderna, cu doua moduri:

- Joc impotriva AI (implicit activ)
- Joc local 1 vs 1 (AI dezactivat)

### 2. Utilizatori tinta

- Utilizator casual care doreste sa joace sah in browser.
- Utilizator care doreste sa testeze mutari si pozitionari de piese.
- Dezvoltator care extinde proiectul cu reguli complete sau AI real.

### 3. Functionalitati principale

1. Afisare tabla de joc 8x8
   - Tabla este randata vizual cu piese Unicode.
   - Pozitia initiala este standard de sah.

2. Selectie piesa si mutari
   - Utilizatorul selecteaza o piesa proprie.
   - Mutarile valide sunt evidentiate.
   - Click pe tinta valida executa mutarea.
   - Captura este suportata prin inlocuirea piesei adverse de pe pozitia tinta.

3. Gestionare ture
   - Jocul alterneaza tura White/Black dupa fiecare mutare valida.
   - UI afiseaza clar jucatorul la mutare.

4. Ceas de joc
   - Fiecare jucator are 10 minute initial.
   - Ceasul scade pentru jucatorul aflat la mutare.
   - Ceasul este sincronizat cu backend-ul.

5. Mod AI / 1 vs 1
   - In modul AI, cand este tura Black, sistemul calculeaza o mutare valida automat.
   - In modul 1 vs 1, utilizatorii muta alternativ pe acelasi dispozitiv.

6. Feedback vizual
   - Status joc (randul tau / AI analizeaza)
   - Indicator piesa selectata
   - Evidentiere timer activ
   - Animatii pentru stare AI

### 4. Flux functional utilizator

1. Utilizatorul deschide aplicatia.
2. Tabla este afisata in pozitia initiala.
3. Utilizatorul muta o piesa alba.
4. Tura se schimba la negru.
5. Daca AI este activ, AI efectueaza mutarea neagra.
6. Ceasurile se actualizeaza continuu in panoul lateral.
7. Jocul continua pana la oprirea sesiunii sau expirarea timpului.

### 5. Reguli implementate la nivel functional

- Validare mutari pentru:
  - pion
  - tura
  - cal
  - nebun
  - regina
  - rege
- Interdictie mutare in afara tablei.
- Interdictie mutare pe aceeasi casuta.
- Interdictie capturare piesa proprie.

### 6. Criterii minime de acceptanta (MVP)

- Aplicatia porneste local (backend + frontend).
- Tabla se incarca corect la initializare.
- Utilizatorul poate muta piese respectand regulile implementate.
- Tura se schimba dupa mutare.
- Ceasul se actualizeaza corect pentru jucatorul activ.
- Modul AI poate fi activat/dezactivat din UI.

### 7. Extensii recomandate

- Persistenta partidei (backend + baza de date).
- Motor de sah real (integrare model AI robust sau engine dedicat).
- Detectie completa de final partida (sah-mat, pat, remiza).
- Export/Import partide (PGN/FEN).
- Autentificare utilizatori si istoric partide.
