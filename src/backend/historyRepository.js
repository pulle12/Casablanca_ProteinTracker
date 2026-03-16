const fs = require("fs/promises");
const path = require("path");

const HISTORY_FILE = path.join(__dirname, "..", "database", "history.json");

function todayIsoDate() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function dateShift(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function readHistory() {
  try {
    const content = await fs.readFile(HISTORY_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeHistory(history) {
  await fs.writeFile(HISTORY_FILE, `${JSON.stringify(history, null, 2)}\n`, "utf-8");
}

function classifyDay(consumed, target) {
  if (target <= 0) {
    return "no-target";
  }

  if (Math.abs(consumed - target) <= 5) {
    return "reached";
  }

  if (consumed > target) {
    return "over";
  }

  return "under";
}

async function upsertDay(entry) {
  const date = String(entry.date || todayIsoDate()).slice(0, 10);
  const consumed = Math.max(0, Number(entry.consumed || 0));
  const target = Math.max(0, Number(entry.target || 0));
  const status = classifyDay(consumed, target);

  const history = await readHistory();
  const existingIndex = history.findIndex((item) => item.date === date);
  const nextEntry = {
    date,
    consumed: Math.round(consumed * 10) / 10,
    target: Math.round(target * 10) / 10,
    status,
    reached: status === "reached" || status === "over",
  };

  if (existingIndex >= 0) {
    history[existingIndex] = nextEntry;
  } else {
    history.push(nextEntry);
  }

  history.sort((a, b) => a.date.localeCompare(b.date));
  await writeHistory(history);
  return nextEntry;
}

async function getLastDays(days = 7) {
  const count = Math.max(1, Math.min(31, Number(days) || 7));
  const history = await readHistory();
  const byDate = new Map(history.map((item) => [item.date, item]));
  const today = todayIsoDate();
  const result = [];

  for (let i = count - 1; i >= 0; i -= 1) {
    const date = dateShift(today, -i);
    const existing = byDate.get(date);

    if (existing) {
      result.push(existing);
    } else {
      result.push({
        date,
        consumed: 0,
        target: 0,
        status: "no-data",
        reached: false,
      });
    }
  }

  return result;
}

async function getCurrentStreak() {
  const history = await readHistory();
  const byDate = new Map(history.map((item) => [item.date, item]));
  const today = todayIsoDate();

  let streak = 0;
  for (let i = 0; i < 365; i += 1) {
    const date = dateShift(today, -i);
    const entry = byDate.get(date);

    if (entry && entry.reached) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

module.exports = {
  upsertDay,
  getLastDays,
  getCurrentStreak,
  classifyDay,
};
