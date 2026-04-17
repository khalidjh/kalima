"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  deleteDoc,
  Unsubscribe,
} from "firebase/firestore";
import { app } from "@/lib/firebase";
import { getWordByPuzzleNumber, VALID_ANSWERS } from "@/data/words";
import { getJasoosPuzzle, JASOOS_DECOYS } from "@/data/jasoos";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";

// ── Types ──

type GamePhase = "landing" | "lobby" | "playing" | "voting" | "results";

interface Player {
  id: string;
  name: string;
  joinedAt: number;
  isHost: boolean;
}

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
}

interface Room {
  roomId: string;
  status: "lobby" | "playing" | "voting" | "results";
  hostPlayerId: string;
  puzzleNumber: number;
  spyPlayerId: string;
  previousSpyIds?: string[];
  players: Record<string, Player>;
  votes: Record<string, string>;
  winner: "players" | "spy" | null;
  createdAt: number;
}

function randomPuzzleNumber(): number {
  return Math.floor(Math.random() * VALID_ANSWERS.length) + 1;
}

// ── Helpers ──

const db = getFirestore(app);

function getPlayerId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("jasoos_playerId");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("jasoos_playerId", id);
  }
  return id;
}

function getStoredName(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("jasoos_playerName") || "";
}

function storeName(name: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("jasoos_playerName", name);
  }
}

function emojiForName(name: string): string {
  const emojis = ["🟢", "🔵", "🟡", "🟠", "🔴", "🟣", "⚪", "🟤"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return emojis[Math.abs(hash) % emojis.length];
}

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ── Inner component (needs useSearchParams) ──

function JasoosInner() {
  const searchParams = useSearchParams();
  const initialRoomCode = searchParams.get("room") || "";

  const [phase, setPhase] = useState<GamePhase>("landing");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [joinMode, setJoinMode] = useState(!!initialRoomCode);
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const router = useRouter();

  const playerId = useRef("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const unsubRoom = useRef<Unsubscribe | null>(null);
  const unsubMessages = useRef<Unsubscribe | null>(null);

  // Initialize player ID + stored name
  useEffect(() => {
    playerId.current = getPlayerId();
    const stored = getStoredName();
    if (stored) setPlayerName(stored);
  }, []);

  // Scroll chat to bottom (use nearest to avoid pushing the whole page)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  // On mobile, prevent virtual keyboard from scrolling the page away from chat
  useEffect(() => {
    if (phase !== "playing") return;
    const handleResize = () => {
      // When virtual keyboard opens, visualViewport shrinks
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };
    window.visualViewport?.addEventListener("resize", handleResize);
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, [phase]);

  // Cleanup subscriptions
  const cleanup = useCallback(() => {
    unsubRoom.current?.();
    unsubMessages.current?.();
    unsubRoom.current = null;
    unsubMessages.current = null;
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // Subscribe to room changes
  const subscribeToRoom = useCallback(
    (roomId: string) => {
      cleanup();

      const roomRef = doc(db, "jasoos_rooms", roomId);
      unsubRoom.current = onSnapshot(roomRef, (snap) => {
        if (!snap.exists()) {
          setError("الغرفة غير موجودة أو تم حذفها");
          setPhase("landing");
          cleanup();
          return;
        }
        const data = snap.data() as Room;
        setRoom(data);

        // Sync phase with room status
        if (data.status === "lobby") setPhase("lobby");
        else if (data.status === "playing") setPhase("playing");
        else if (data.status === "voting") setPhase("voting");
        else if (data.status === "results") setPhase("results");
      });

      // Subscribe to messages subcollection
      const messagesRef = collection(db, "jasoos_rooms", roomId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));
      unsubMessages.current = onSnapshot(q, (snap) => {
        const msgs: ChatMessage[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ChatMessage, "id">),
        }));
        setMessages(msgs);
      });
    },
    [cleanup]
  );

  // ── Actions ──

  const handleCreateRoom = async () => {
    const name = playerName.trim();
    if (!name) {
      setError("أدخل اسمك أولاً");
      return;
    }
    setLoading(true);
    setError("");
    storeName(name);

    try {
      const roomId = generateRoomId();
      const newRoom: Room = {
        roomId,
        status: "lobby",
        hostPlayerId: playerId.current,
        puzzleNumber: randomPuzzleNumber(),
        spyPlayerId: "",
        previousSpyIds: [],
        players: {
          [playerId.current]: {
            id: playerId.current,
            name,
            joinedAt: Date.now(),
            isHost: true,
          },
        },
        votes: {},
        winner: null,
        createdAt: Date.now(),
      };
      await setDoc(doc(db, "jasoos_rooms", roomId), newRoom);
      setRoomCode(roomId);
      subscribeToRoom(roomId);
      setPhase("lobby");
    } catch (err) {
      setError("حدث خطأ أثناء إنشاء الغرفة");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    const name = playerName.trim();
    const code = roomCode.trim().toUpperCase();
    if (!name) {
      setError("أدخل اسمك أولاً");
      return;
    }
    if (!code || code.length < 4) {
      setError("أدخل رمز الغرفة");
      return;
    }
    setLoading(true);
    setError("");
    storeName(name);

    try {
      const roomRef = doc(db, "jasoos_rooms", code);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        setError("الغرفة غير موجودة");
        setLoading(false);
        return;
      }
      const data = snap.data() as Room;
      if (data.status !== "lobby") {
        setError("اللعبة بدأت بالفعل");
        setLoading(false);
        return;
      }

      // Add player to room
      await updateDoc(roomRef, {
        [`players.${playerId.current}`]: {
          id: playerId.current,
          name,
          joinedAt: Date.now(),
          isHost: false,
        },
      });

      setRoomCode(code);
      subscribeToRoom(code);
      setPhase("lobby");
    } catch (err) {
      setError("حدث خطأ أثناء الانضمام");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!room) return;
    const playerIds = Object.keys(room.players);
    if (playerIds.length < 3) return;

    // Pick random spy, avoiding previous spies if possible
    const prev = room.previousSpyIds ?? [];
    let candidates = playerIds.filter((id) => !prev.includes(id));
    // If everyone has been spy, reset
    if (candidates.length === 0) candidates = playerIds;
    const spyIndex = Math.floor(Math.random() * candidates.length);
    const spyId = candidates[spyIndex];

    try {
      await updateDoc(doc(db, "jasoos_rooms", room.roomId), {
        status: "playing",
        spyPlayerId: spyId,
        previousSpyIds: [...prev, spyId],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    const text = chatInput.trim();
    if (!text || !room) return;
    setChatInput("");

    const me = room.players[playerId.current];
    if (!me) return;

    try {
      const messagesRef = collection(
        db,
        "jasoos_rooms",
        room.roomId,
        "messages"
      );
      await addDoc(messagesRef, {
        playerId: playerId.current,
        playerName: me.name,
        text,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartVoting = async () => {
    if (!room) return;
    try {
      await updateDoc(doc(db, "jasoos_rooms", room.roomId), {
        status: "voting",
        votes: {},
      });
      setHasVoted(false);
      setSelectedVote(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async () => {
    if (!room || !selectedVote || hasVoted) return;
    setHasVoted(true);

    try {
      await updateDoc(doc(db, "jasoos_rooms", room.roomId), {
        [`votes.${playerId.current}`]: selectedVote,
      });

      // Check if all players have voted
      const totalPlayers = Object.keys(room.players).length;
      const currentVotes = Object.keys(room.votes).length + 1; // +1 for this vote
      if (currentVotes >= totalPlayers) {
        // Tally votes
        const allVotes = { ...room.votes, [playerId.current]: selectedVote };
        const tally: Record<string, number> = {};
        Object.values(allVotes).forEach((targetId) => {
          tally[targetId] = (tally[targetId] || 0) + 1;
        });

        // Find player with most votes
        let maxVotes = 0;
        let mostVotedId = "";
        Object.entries(tally).forEach(([id, count]) => {
          if (count > maxVotes) {
            maxVotes = count;
            mostVotedId = id;
          }
        });

        const spyCaught = mostVotedId === room.spyPlayerId;
        await updateDoc(doc(db, "jasoos_rooms", room.roomId), {
          status: "results",
          winner: spyCaught ? "players" : "spy",
        });
      }
    } catch (err) {
      console.error(err);
      setHasVoted(false);
    }
  };

  // Auto-advance to results when all votes are in (for non-voting players)
  useEffect(() => {
    if (!room || room.status !== "voting") return;
    const totalPlayers = Object.keys(room.players).length;
    const totalVotes = Object.keys(room.votes).length;
    if (totalVotes >= totalPlayers && room.status === "voting") {
      // Tally and resolve
      const tally: Record<string, number> = {};
      Object.values(room.votes).forEach((targetId) => {
        tally[targetId] = (tally[targetId] || 0) + 1;
      });
      let maxVotes = 0;
      let mostVotedId = "";
      Object.entries(tally).forEach(([id, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          mostVotedId = id;
        }
      });
      const spyCaught = mostVotedId === room.spyPlayerId;

      // Only host finalizes
      if (room.hostPlayerId === playerId.current) {
        updateDoc(doc(db, "jasoos_rooms", room.roomId), {
          status: "results",
          winner: spyCaught ? "players" : "spy",
        });
      }
    }
  }, [room]);

  const handleLeave = async () => {
    if (!room) {
      setPhase("landing");
      return;
    }

    const isHost = room.hostPlayerId === playerId.current;
    try {
      if (isHost && room.status === "lobby") {
        // Host leaving lobby → delete room
        await deleteDoc(doc(db, "jasoos_rooms", room.roomId));
      } else {
        // Remove player from room
        const updatedPlayers = { ...room.players };
        delete updatedPlayers[playerId.current];

        if (Object.keys(updatedPlayers).length === 0) {
          await deleteDoc(doc(db, "jasoos_rooms", room.roomId));
        } else {
          await updateDoc(doc(db, "jasoos_rooms", room.roomId), {
            players: updatedPlayers,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }

    cleanup();
    setRoom(null);
    setMessages([]);
    setPhase("landing");
    setRoomCode("");
    setHasVoted(false);
    setSelectedVote(null);
  };

  const handlePlayAgain = async () => {
    // Reset same room — keep players, pick new word + spy
    if (!room) return;
    try {
      // Clear old messages
      const messagesRef = collection(db, "jasoos_rooms", room.roomId, "messages");
      const msgSnap = await getDocs(messagesRef);
      const deletions: Promise<void>[] = [];
      msgSnap.forEach((d) => deletions.push(deleteDoc(d.ref)));
      await Promise.all(deletions);

      // Reset room state with new puzzle number, keep players and previousSpyIds
      await updateDoc(doc(db, "jasoos_rooms", room.roomId), {
        status: "lobby",
        puzzleNumber: randomPuzzleNumber(),
        spyPlayerId: "",
        votes: {},
        winner: null,
      });

      setMessages([]);
      setHasVoted(false);
      setSelectedVote(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = () => {
    const url = `https://kalima.fun/jasoos?room=${roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Derived state ──
  const isHost = room?.hostPlayerId === playerId.current;
  const isSpy = room?.spyPlayerId === playerId.current;
  const playerList = room ? Object.values(room.players).sort((a, b) => a.joinedAt - b.joinedAt) : [];
  const voteCount = room ? Object.keys(room.votes).length : 0;
  const totalPlayers = playerList.length;

  // ── Render ──

  const handleBack = async () => {
    if (phase === "landing") {
      router.push("/home");
    } else {
      await handleLeave();
      router.push("/home");
    }
  };

  return (
    <div className="h-dvh bg-background flex flex-col overflow-hidden" dir="rtl">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0">
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface border border-border text-white hover:bg-surface/80 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
        <h1 className="text-base font-bold text-white">كلمة الجاسوس 🕵️</h1>
        {room && phase !== "landing" ? (
          <span className="text-xs font-mono text-muted bg-surface px-2 py-1 rounded-lg border border-border">
            {roomCode}
          </span>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-hidden max-w-lg mx-auto w-full px-4 pb-4 flex flex-col min-h-0">

        {/* ── Landing Phase ── */}
        {phase === "landing" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <div className="text-center">
              <p className="text-5xl mb-2">🕵️</p>
              <p className="text-muted text-base">العب مع أصدقائك</p>
            </div>

            <div className="w-full max-w-xs space-y-3">
              <input
                type="text"
                value={playerName}
                onChange={(e) => { setPlayerName(e.target.value); setError(""); }}
                placeholder="اسمك"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white text-center text-lg placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                maxLength={20}
              />

              {!joinMode ? (
                <>
                  <button
                    onClick={handleCreateRoom}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-primary text-background font-bold text-lg transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    {loading ? "جاري الإنشاء..." : "أنشئ غرفة"}
                  </button>
                  <button
                    onClick={() => setJoinMode(true)}
                    className="w-full py-3 rounded-xl bg-surface border border-border text-white font-semibold text-lg hover:border-primary/40 transition-colors"
                  >
                    انضم لغرفة
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => { setRoomCode(e.target.value.toUpperCase()); setError(""); }}
                    placeholder="رمز الغرفة"
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white text-center text-lg font-mono tracking-widest placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                    maxLength={6}
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-primary text-background font-bold text-lg transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    {loading ? "جاري الانضمام..." : "انضم"}
                  </button>
                  <button
                    onClick={() => { setJoinMode(false); setRoomCode(""); setError(""); }}
                    className="w-full py-2 text-muted text-sm hover:text-white transition-colors"
                  >
                    رجوع
                  </button>
                </>
              )}

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            </div>
          </div>
        )}

        {/* ── Lobby Phase ── */}
        {phase === "lobby" && room && (
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            {/* Room code */}
            <div className="bg-surface rounded-2xl border border-border py-3 px-5 text-center flex-shrink-0">
              <p className="text-muted text-xs mb-1">رمز الغرفة</p>
              <button
                onClick={handleCopyCode}
                className="text-3xl font-mono font-bold text-primary tracking-[0.3em] hover:brightness-110 transition-all"
              >
                {roomCode}
              </button>
              <p className="text-muted/50 text-[10px] mt-0.5">
                {copied ? "تم النسخ!" : "اضغط للنسخ"}
              </p>
            </div>

            {/* Share button */}
            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 rounded-xl bg-surface border border-primary/30 text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors flex-shrink-0 text-sm"
            >
              <span>🔗</span>
              <span>{copied ? "تم نسخ الرابط!" : "شارك الرابط"}</span>
            </button>

            {/* Player list — scrollable */}
            <div className="flex-1 bg-surface rounded-2xl border border-border p-4 overflow-y-auto min-h-0">
              <h3 className="text-muted text-xs mb-2">اللاعبون ({totalPlayers})</h3>
              <div className="space-y-2">
                {playerList.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-background/50">
                    <span className="text-lg">{emojiForName(p.name)}</span>
                    <span className="text-white font-semibold flex-1 text-sm">{p.name}</span>
                    {p.isHost && (
                      <span className="text-[10px] font-bold text-background bg-primary px-2 py-0.5 rounded-full">المضيف</span>
                    )}
                    {p.id === playerId.current && (
                      <span className="text-[10px] text-muted">(أنت)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Start / waiting */}
            <div className="flex-shrink-0">
              {isHost ? (
                <button
                  onClick={handleStartGame}
                  disabled={totalPlayers < 3}
                  className="w-full py-3 rounded-xl bg-primary text-background font-bold text-base transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {totalPlayers < 3 ? `يلزم ${3 - totalPlayers} لاعبين إضافيين` : "ابدأ اللعبة"}
                </button>
              ) : (
                <div className="text-center text-muted py-3 text-sm">في انتظار المضيف لبدء اللعبة...</div>
              )}
            </div>
          </div>
        )}

        {/* ── Playing Phase ── */}
        {phase === "playing" && room && (
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            {/* Word card — compact */}
            {isSpy ? (
              <div className="bg-gradient-to-br from-red-900/40 to-orange-900/30 rounded-2xl border border-red-500/30 p-4 text-center flex-shrink-0">
                <p className="text-red-300 text-xs font-semibold mb-1">أنت الجاسوس 🕵️</p>
                <p className="text-2xl font-bold text-white">{getJasoosPuzzle(room.puzzleNumber).decoyWord}</p>
                <p className="text-red-300/60 text-[11px] mt-1">كلمتك مختلفة — حاول اكتشاف كلمتهم!</p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 rounded-2xl border border-correct/30 p-4 text-center flex-shrink-0">
                <p className="text-correct text-xs font-semibold mb-1">كلمتك</p>
                <p className="text-2xl font-bold text-white">{getWordByPuzzleNumber(room.puzzleNumber)}</p>
                <p className="text-correct/50 text-[11px] mt-1">لا تكشف كلمتك مباشرة — لمّح فقط!</p>
              </div>
            )}

            {/* Chat — fills remaining space */}
            <div className="flex-1 bg-surface rounded-2xl border border-border overflow-hidden flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 && (
                  <p className="text-muted/40 text-center text-sm mt-8">ابدأ النقاش... أعطِ تلميحات عن كلمتك</p>
                )}
                {messages.map((msg) => {
                  const isMe = msg.playerId === playerId.current;
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                      <span className="text-sm mt-1 flex-shrink-0">{emojiForName(msg.playerName)}</span>
                      <div className={`max-w-[75%] px-3 py-2 rounded-xl ${isMe ? "bg-primary/20 border border-primary/20" : "bg-background/60 border border-border/50"}`}>
                        {!isMe && <p className="text-[10px] text-muted mb-0.5">{msg.playerName}</p>}
                        <p className="text-sm text-white">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <div className="border-t border-border p-2 flex gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                  placeholder="اكتب رسالة..."
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-white text-sm placeholder:text-muted/40 focus:outline-none focus:border-primary/40 transition-colors"
                  maxLength={200}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-background font-bold text-sm disabled:opacity-30 transition-all hover:brightness-110"
                >
                  ارسل
                </button>
              </div>
            </div>

            {/* Host: start voting */}
            {isHost && (
              <button
                onClick={handleStartVoting}
                className="w-full py-3 rounded-xl bg-present text-white font-bold text-base transition-all hover:brightness-110 flex-shrink-0"
              >
                بدء التصويت 🗳️
              </button>
            )}
          </div>
        )}

        {/* ── Voting Phase ── */}
        {phase === "voting" && room && (
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="text-center flex-shrink-0">
              <h2 className="text-xl font-bold text-white mb-0.5">من الجاسوس؟ 🗳️</h2>
              <p className="text-muted text-sm">صوّت {voteCount} من {totalPlayers}</p>
            </div>

            {/* Player vote cards — scrollable */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {playerList.map((p) => {
                if (p.id === playerId.current) return null;
                const isSelected = selectedVote === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => !hasVoted && setSelectedVote(p.id)}
                    disabled={hasVoted}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      isSelected ? "bg-primary/20 border-primary/50" : "bg-surface border-border hover:border-primary/30"
                    } ${hasVoted ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <span className="text-xl">{emojiForName(p.name)}</span>
                    <span className="text-white font-semibold flex-1 text-right">{p.name}</span>
                    {isSelected && <span className="text-primary text-sm">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Submit vote */}
            <div className="flex-shrink-0">
              {!hasVoted ? (
                <button
                  onClick={handleVote}
                  disabled={!selectedVote}
                  className="w-full py-3 rounded-xl bg-primary text-background font-bold text-base transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  تأكيد التصويت
                </button>
              ) : (
                <div className="text-center text-muted py-3 text-sm">تم تسجيل صوتك — في انتظار البقية...</div>
              )}
            </div>
          </div>
        )}

        {/* ── Results Phase ── */}
        {phase === "results" && room && (
          <div className="flex-1 overflow-y-auto flex flex-col items-center gap-4 py-2">
            {/* Winner */}
            <div className="text-center flex-shrink-0">
              {room.winner === "players" ? (
                <>
                  <p className="text-4xl mb-2">🎉</p>
                  <h2 className="text-xl font-bold text-correct mb-0.5">اللاعبون فازوا!</h2>
                  <p className="text-muted text-sm">تم كشف الجاسوس</p>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-2">🕵️</p>
                  <h2 className="text-xl font-bold text-red-400 mb-0.5">الجاسوس فاز!</h2>
                  <p className="text-muted text-sm">لم يتم اكتشاف الجاسوس</p>
                </>
              )}
            </div>

            {/* Spy reveal */}
            <div className="bg-surface rounded-2xl border border-border p-4 w-full text-center">
              <p className="text-muted text-xs mb-2">الجاسوس كان</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xl">{room.players[room.spyPlayerId] ? emojiForName(room.players[room.spyPlayerId].name) : "🕵️"}</span>
                <span className="text-lg font-bold text-white">{room.players[room.spyPlayerId]?.name || "غير معروف"}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-center gap-8">
                <div>
                  <p className="text-[10px] text-muted mb-0.5">كلمة اللاعبين</p>
                  <p className="text-base font-bold text-correct">{getWordByPuzzleNumber(room.puzzleNumber)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted mb-0.5">كلمة الجاسوس</p>
                  <p className="text-base font-bold text-red-400">{getJasoosPuzzle(room.puzzleNumber).decoyWord}</p>
                </div>
              </div>
            </div>

            {/* Vote tally */}
            <div className="bg-surface rounded-2xl border border-border p-4 w-full">
              <p className="text-muted text-xs mb-2 text-center">نتائج التصويت</p>
              <div className="space-y-1">
                {(() => {
                  const tally: Record<string, number> = {};
                  Object.values(room.votes).forEach((targetId) => { tally[targetId] = (tally[targetId] || 0) + 1; });
                  return playerList
                    .filter((p) => tally[p.id])
                    .sort((a, b) => (tally[b.id] || 0) - (tally[a.id] || 0))
                    .map((p) => (
                      <div key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${p.id === room.spyPlayerId ? "bg-red-900/20 border border-red-500/20" : "bg-background/40"}`}>
                        <span>{emojiForName(p.name)}</span>
                        <span className="text-white text-sm flex-1">{p.name}</span>
                        <span className="text-muted text-sm font-mono">{tally[p.id] || 0} صوت</span>
                        {p.id === room.spyPlayerId && <span className="text-[10px] text-red-400">🕵️</span>}
                      </div>
                    ));
                })()}
              </div>
            </div>

            {/* Actions */}
            <div className="w-full space-y-2 pb-2">
              <button onClick={handlePlayAgain} className="w-full py-3 rounded-xl bg-primary text-background font-bold text-base transition-all hover:brightness-110">
                العب مجدداً
              </button>
              <button onClick={handleBack} className="w-full py-2 text-muted text-sm hover:text-white transition-colors">
                الخروج للرئيسية
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page wrapper with Suspense for useSearchParams ──

export default function JasoosPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center bg-background">
          <p className="text-muted">جاري التحميل...</p>
        </div>
      }
    >
      <JasoosInner />
    </Suspense>
  );
}
