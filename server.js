const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map();
const makeCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();
const cleanName = s => String(s || "").trim().replace(/[<>]/g, "").slice(0, 20);

function publicState(room, viewerId) {
  const isViewerHost = viewerId === room.hostId;
  const visibleQuestion = room.activeQuestion ? {...room.activeQuestion} : null;
  if (visibleQuestion && !isViewerHost && !room.answerShown) delete visibleQuestion.answer;
  return {
    code: room.code,
    hostId: room.hostId,
    players: [...room.players.values()].map(p => ({ id: p.id, name: p.name, score: p.score })),
    categories: room.categories,
    used: [...room.used],
    activeQuestion: visibleQuestion,
    hostAnswer: isViewerHost && room.activeQuestion ? room.activeQuestion.answer : null,
    buzzWinner: room.buzzWinner,
    buzzOpen: room.buzzOpen,
    status: room.status,
    message: room.message,
    timerEndAt: room.timerEndAt || null,
    attemptedPlayers: [...(room.attemptedPlayers || [])],
    answerShown: !!room.answerShown
  };
}
async function broadcast(room) {
  const sockets = await io.in(room.code).fetchSockets();
  for (const client of sockets) client.emit("state", publicState(room, client.id));
}
function getRoom(socket) {
  const code = socket.data.roomCode;
  return code ? rooms.get(code) : null;
}
function isHost(socket, room) { return !!room && room.hostId === socket.id; }

io.on("connection", socket => {
  socket.on("createRoom", ({name, password, categories} = {}) => {
    if (String(password || "") !== "ChatGPT123") return socket.emit("errorMessage", "Falsches Spielleiter-Passwort.");
    name = cleanName(name) || "Spielleitung";
    let code = makeCode();
    while (rooms.has(code)) code = makeCode();
    const room = {
      code, hostId: socket.id, players: new Map(),
      categoryPool: Array.isArray(categories) ? JSON.parse(JSON.stringify(categories)) : [],
      categories: [],
      used: new Set(), seenQuestions: {}, activeQuestion: null, buzzWinner: null,
      buzzOpen: false, attemptedPlayers: new Set(), status: "board", message: "Wählt eine Kategorie und Punktzahl."
    };
    const shuffleList = arr => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    const makeBoardCategory = category => {
      const points = [100, 200, 300, 400, 500];
      const questions = points.map(value => {
        const options = (category.questions || []).filter(q => Number(q.points) === value);
        const chosen = options.length ? options[Math.floor(Math.random() * options.length)] : (category.questions || []).find(q => Number(q.points) === value);
        return chosen ? {points: value, question: chosen.question, answer: chosen.answer} : null;
      }).filter(Boolean);
      return {name: category.name, questions};
    };
    room.categories = shuffleList(room.categoryPool).slice(0, 5).map(makeBoardCategory);
    // Track questions already shown for each category and point value so they
    // are not repeated on later shuffles until that category's bank is exhausted.
    room.categories.forEach(category => category.questions.forEach(q => {
      const key = `${category.name}::${q.points}`;
      if (!room.seenQuestions[key]) room.seenQuestions[key] = [];
      if (!room.seenQuestions[key].includes(q.question)) room.seenQuestions[key].push(q.question);
    }));
    rooms.set(code, room);
    socket.join(code); socket.data.roomCode = code;
    socket.emit("joined", {code, host: true});
    broadcast(room);
  });

  socket.on("joinRoom", ({code, name}) => {
    code = String(code || "").trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) return socket.emit("errorMessage", "Spielcode nicht gefunden.");
    name = cleanName(name);
    if (!name) return socket.emit("errorMessage", "Gib bitte einen Namen ein.");
    if ([...room.players.values()].some(p => p.name.toLowerCase() === name.toLowerCase()))
      return socket.emit("errorMessage", "Dieser Name ist bereits vergeben.");
    room.players.set(socket.id, {id: socket.id, name, score: 0});
    socket.join(code); socket.data.roomCode = code;
    socket.emit("joined", {code, host: false});
    broadcast(room);
  });

  socket.on("selectQuestion", ({categoryIndex, points, targetPlayerId}) => {
    const room = getRoom(socket);
    if (!isHost(socket, room) || room.status !== "board") return;
    const cat = room.categories[categoryIndex];
    if (!cat || !Number.isInteger(Number(points)) || Number(points) < 0 || Number(points) > 100000) return;
    const q = cat.questions.find(q => q.points === Number(points));
    const key = `${categoryIndex}:${points}`;
    if (!q || room.used.has(key)) return;
    const assignedPlayerId = targetPlayerId && room.players.has(targetPlayerId) ? targetPlayerId : null;
    room.activeQuestion = {...q, points: Number(q.points), category: cat.name, categoryIndex, key, assignedPlayerId};
    room.buzzWinner = null; room.buzzOpen = false; room.attemptedPlayers = new Set(); room.status = "question"; room.timerEndAt = null; room.answerShown = false;
    room.message = "Frage läuft. Die Spielleitung kann den Buzzer freigeben.";
    broadcast(room);
  });

  socket.on("openBuzzers", () => {
    const room = getRoom(socket);
    if (!isHost(socket, room) || room.status !== "question" || room.buzzWinner) return;
    room.buzzOpen = true; room.message = "BUZZERN! Wer zuerst drückt, darf antworten.";
    broadcast(room);
  });

  socket.on("buzz", () => {
    const room = getRoom(socket);
    if (!room || !room.buzzOpen || room.status !== "question" || room.buzzWinner || !room.players.has(socket.id) || room.attemptedPlayers.has(socket.id)) return;
    room.buzzWinner = socket.id;
    room.buzzOpen = false;
    const p = room.players.get(socket.id);
    room.message = `${p.name} ist zuerst dran!`;
    broadcast(room);
  });

  socket.on("setQuestionScorer", ({playerId}) => {
    const room = getRoom(socket);
    if (!isHost(socket, room) || room.status !== "question" || !room.activeQuestion) return;
    if (playerId && !room.players.has(playerId)) return;
    room.activeQuestion.assignedPlayerId = playerId || null;
    room.message = playerId ? `Punkte-Empfänger: ${room.players.get(playerId).name}.` : "Punkte-Empfänger folgt dem Buzzer.";
    broadcast(room);
  });

  socket.on("judge", ({correct, playerId}) => {
    const room = getRoom(socket);
    if (!isHost(socket, room) || room.status !== "question" || !room.activeQuestion) return;
    if (room.answerShown) return;
    const scoringPlayerId = playerId || room.activeQuestion.assignedPlayerId || room.buzzWinner;
    if (!scoringPlayerId || !room.players.has(scoringPlayerId)) {
      socket.emit("errorMessage", "Wähle einen Spieler als Punkte-Empfänger aus oder lass jemanden buzzern."); return;
    }
    const p = room.players.get(scoringPlayerId);
    const awardedPoints = Number(room.activeQuestion.points) || 0;
    if (correct) {
      p.score += awardedPoints; room.used.add(room.activeQuestion.key);
      room.message = `${p.name} bekommt ${awardedPoints} Punkte. Lösung wird angezeigt. Drücke „Zurück zur Übersicht“, wenn du bereit bist.`;
      room.answerShown = true; room.buzzWinner = null; room.buzzOpen = false; room.timerEndAt = null;
    } else {
      // Stop the shared countdown immediately when an answer is marked wrong.
      room.timerEndAt = null;
      const penalty = Math.ceil(awardedPoints / 2);
      p.score -= penalty;
      // Sperre sowohl den tatsächlich buzzenden Spieler als auch den ausgewählten Antwortenden,
      // falls die Spielleitung den Punkteempfänger manuell ausgewählt hat.
      room.attemptedPlayers.add(scoringPlayerId);
      if (room.buzzWinner) room.attemptedPlayers.add(room.buzzWinner);
      room.buzzWinner = null;
      const eligible = [...room.players.keys()].some(id => !room.attemptedPlayers.has(id));
      room.buzzOpen = eligible;
      room.message = `${p.name} lag falsch: ${penalty} Punkte Abzug (die Hälfte). ${eligible ? "Die anderen Spieler dürfen buzzern; wer schon falsch lag, ist gesperrt." : "Alle haben bereits geantwortet. Beende die Frage mit „Wegmachen“."}`;
    }
    broadcast(room);
  });

  socket.on("endQuestion", () => {
    const room = getRoom(socket);
    if (!isHost(socket, room) || room.status !== "question" || !room.activeQuestion) return;
    room.used.add(room.activeQuestion.key); room.activeQuestion = null; room.buzzWinner = null; room.buzzOpen = false; room.attemptedPlayers = new Set(); room.answerShown = false;
    room.status = "board"; room.timerEndAt = null; room.message = "Frage beendet. Wählt die nächste Frage."; broadcast(room);
  });

  socket.on("startTimer", () => {
    const room = getRoom(socket);
    if (!isHost(socket, room) || room.status !== "question") return;
    room.timerEndAt = Date.now() + 60000; room.message = "60-Sekunden-Timer läuft!"; broadcast(room);
  });

  socket.on("setPlayerScore", ({playerId, score}) => {
    const room = getRoom(socket);
    if (!isHost(socket, room) || !playerId || !room.players.has(playerId)) return;
    const value = Number(score);
    if (!Number.isFinite(value) || !Number.isInteger(value) || Math.abs(value) > 1000000) {
      socket.emit("errorMessage", "Bitte gib eine ganze Punktzahl zwischen -1.000.000 und 1.000.000 ein.");
      return;
    }
    room.players.get(playerId).score = value;
    room.message = `Punktestand von ${room.players.get(playerId).name} manuell geändert.`;
    broadcast(room);
  });

  socket.on("adjustPlayerScore", ({playerId, delta}) => {
    const room = getRoom(socket);
    if (!isHost(socket, room) || !playerId || !room.players.has(playerId)) return;
    const change = Number(delta);
    if (!Number.isInteger(change) || Math.abs(change) > 1000000) return;
    room.players.get(playerId).score += change;
    room.message = `Punktestand von ${room.players.get(playerId).name} manuell angepasst (${change > 0 ? "+" : ""}${change}).`;
    broadcast(room);
  });

  socket.on("noAnswer", () => {
    const room = getRoom(socket);
    if (!isHost(socket, room) || room.status !== "question") return;
    room.buzzWinner = null;
    room.buzzOpen = [...room.players.keys()].some(id => !room.attemptedPlayers.has(id));
    room.message = "Buzzer für alle Spieler freigegeben, die noch nicht geantwortet haben.";
    broadcast(room);
  });

  socket.on("editCategories", categories => {
    const room = getRoom(socket);
    if (!isHost(socket, room) || room.status !== "board") return;
    if (!Array.isArray(categories) || categories.length < 1 || categories.length > 12) return;
    room.categoryPool = JSON.parse(JSON.stringify(categories));
    room.categories = categories.slice(0, 5).map(c => JSON.parse(JSON.stringify(c)));
    room.used = new Set();
    room.message = "Fragen wurden aktualisiert.";
    broadcast(room);
  });

  socket.on("shuffleCategories", () => {
    const room = getRoom(socket);
    if (!isHost(socket, room) || room.status !== "board") return;
    const shuffle = arr => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    // Choose five categories from the full pool, excluding every category
    // currently on the board whenever the pool contains enough alternatives.
    // This makes each shuffle replace all five displayed categories, not merely
    // rearrange them. If the pool has fewer than five alternatives, fill the
    // remaining slots from the full pool as a safe fallback.
    const pool = room.categoryPool && room.categoryPool.length ? room.categoryPool : room.categories;
    const previousBoard = room.categories || [];
    const previousNames = new Set(previousBoard.map(c => String(c.name)));
    const unseenCategories = pool.filter(c => !previousNames.has(String(c.name)));
    let candidates = shuffle(unseenCategories);
    if (candidates.length < 5) {
      const fallback = shuffle(pool.filter(c => previousNames.has(String(c.name))));
      candidates = candidates.concat(fallback);
    }
    const selected = candidates.slice(0, Math.min(5, pool.length)).map(c => JSON.parse(JSON.stringify(c)));
    // Keep exactly five categories. For each category and point value, prefer a
    // question different from the one shown on the previous board. Questions and
    // answers remain paired and never move between categories or point values.
    selected.forEach(category => {
      const bank = category.questions || [];
      const previousCategory = previousBoard.find(c => c.name === category.name);
      category.questions = [100, 200, 300, 400, 500].map(points => {
        const options = bank.filter(q => Number(q.points) === points);
        if (!options.length) return null;
        const key = `${category.name}::${points}`;
        if (!room.seenQuestions[key]) room.seenQuestions[key] = [];
        const seen = room.seenQuestions[key];
        // Prefer any question not previously displayed for this category and
        // score. Only recycle this category/score's questions after exhausting it.
        let choices = options.filter(q => !seen.includes(q.question));
        if (!choices.length) {
          room.seenQuestions[key] = [];
          choices = options;
        }
        const chosen = choices[Math.floor(Math.random() * choices.length)];
        room.seenQuestions[key].push(chosen.question);
        return {points, question: chosen.question, answer: chosen.answer};
      }).filter(Boolean);
    });
    room.categories = shuffle(selected).slice(0, 5);
    room.used.clear();
    room.message = "Fünf Kategorien wurden zufällig ausgewählt. Wo möglich, wurden andere Fragen derselben Kategorie und Punktestufe gewählt; Lösungen bleiben bei ihren Fragen.";
    broadcast(room);
  });

  socket.on("resetScores", () => {
    const room = getRoom(socket);
    if (!isHost(socket, room)) return;
    room.players.forEach(p => p.score = 0);
    room.used.clear(); room.activeQuestion = null; room.buzzWinner = null; room.attemptedPlayers = new Set(); room.answerShown = false;
    room.buzzOpen = false; room.status = "board"; room.timerEndAt = null; room.message = "Spiel zurückgesetzt.";
    broadcast(room);
  });

  socket.on("disconnect", () => {
    const room = getRoom(socket);
    if (!room) return;
    room.players.delete(socket.id);
    if (room.hostId === socket.id) {
      const next = room.players.keys().next();
      if (!next.done) room.hostId = next.value;
      else { rooms.delete(room.code); return; }
    }
    broadcast(room);
  });
});

server.listen(PORT, () => console.log(`Quizshow läuft auf Port ${PORT}`));
