import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "./firebase";
import { loadStats, saveStats } from "./gameState";
import { loadRawabetStats, saveRawabetStats } from "./rawabetState";
import { loadTarteebStats, saveTarteebStats } from "./tarteebState";

let currentUid: string | null = null;

export function setCurrentUser(uid: string | null) {
  currentUid = uid;
}

export async function mergeLocalStatsFromFirestore(uid: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = getFirestore(app);
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return;

    const data = snap.data();

    // Merge Wordle stats — take the higher value for streak fields
    if (data.kalimaStats) {
      const local = loadStats();
      const remote = data.kalimaStats;
      const merged = {
        ...local,
        gamesPlayed: Math.max(local.gamesPlayed, remote.gamesPlayed ?? 0),
        gamesWon: Math.max(local.gamesWon, remote.gamesWon ?? 0),
        currentStreak: Math.max(local.currentStreak, remote.currentStreak ?? 0),
        maxStreak: Math.max(local.maxStreak, remote.maxStreak ?? 0),
        lastPlayedPuzzle: Math.max(local.lastPlayedPuzzle, remote.lastPlayedPuzzle ?? -1),
        lastWonPuzzle: Math.max(local.lastWonPuzzle, remote.lastWonPuzzle ?? -1),
      };
      saveStats(merged);
    }

    // Merge Rawabet stats — same logic
    if (data.rawabetStats) {
      const local = loadRawabetStats();
      const remote = data.rawabetStats;
      const merged = {
        ...local,
        gamesPlayed: Math.max(local.gamesPlayed, remote.gamesPlayed ?? 0),
        gamesWon: Math.max(local.gamesWon, remote.gamesWon ?? 0),
        currentStreak: Math.max(local.currentStreak, remote.currentStreak ?? 0),
        maxStreak: Math.max(local.maxStreak, remote.maxStreak ?? 0),
        lastPlayedPuzzle: Math.max(local.lastPlayedPuzzle, remote.lastPlayedPuzzle ?? -1),
        lastWonPuzzle: Math.max(local.lastWonPuzzle, remote.lastWonPuzzle ?? -1),
      };
      saveRawabetStats(merged);
    }

    // Merge Tarteeb stats
    if (data.tarteebStats) {
      const local = loadTarteebStats();
      const remote = data.tarteebStats;
      const merged = {
        ...local,
        gamesPlayed: Math.max(local.gamesPlayed, remote.gamesPlayed ?? 0),
        gamesWon: Math.max(local.gamesWon, remote.gamesWon ?? 0),
        perfectGames: Math.max(local.perfectGames, remote.perfectGames ?? 0),
        currentStreak: Math.max(local.currentStreak, remote.currentStreak ?? 0),
        maxStreak: Math.max(local.maxStreak, remote.maxStreak ?? 0),
        totalScore: Math.max(local.totalScore, remote.totalScore ?? 0),
        lastPlayedPuzzle: Math.max(local.lastPlayedPuzzle, remote.lastPlayedPuzzle ?? -1),
        lastWonPuzzle: Math.max(local.lastWonPuzzle, remote.lastWonPuzzle ?? -1),
      };
      saveTarteebStats(merged);
    }
  } catch {
    // Graceful failure — never break the game for Firestore
  }
}

export async function writeStatsToFirestore(): Promise<void> {
  if (!currentUid || typeof window === "undefined") return;
  try {
    const db = getFirestore(app);
    await setDoc(
      doc(db, "users", currentUid),
      {
        kalimaStats: loadStats(),
        rawabetStats: loadRawabetStats(),
        tarteebStats: loadTarteebStats(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch {
    // Graceful failure
  }
}
