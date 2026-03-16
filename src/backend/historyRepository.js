const fs = require("fs/promises");
const path = require("path");

const HISTORY_FILE = path.join(__dirname, "..", "database", "history.json");

function todayIsoDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function dateShift(baseDate, days) {
  const parts = String(baseDate || "").split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    return todayIsoDate();
  }

  const [year, month, day] = parts;
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + Number(days || 0));
  return d.toISOString().slice(0, 10);
}

function normalizeAnchorDate(anchorDate) {
  const input = String(anchorDate || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  return todayIsoDate();
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
  const history = await readHistory();
  const existingIndex = history.findIndex((item) => item.date === date);
  const existing = existingIndex >= 0 ? history[existingIndex] : null;

  const hasConsumed = Number.isFinite(Number(entry.consumed));
  const hasTarget = Number.isFinite(Number(entry.target));

  const consumed = hasConsumed
    ? Math.max(0, Number(entry.consumed))
    : Number(existing?.consumed || 0);

  const target = hasTarget
    ? Math.max(0, Number(entry.target))
    : Number(existing?.target || 0);

  const status = classifyDay(consumed, target);
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

async function getLastDays(days = 7, anchorDate) {
  const count = Math.max(1, Math.min(31, Number(days) || 7));
  const history = await readHistory();
  const byDate = new Map(history.map((item) => [item.date, item]));
  const today = normalizeAnchorDate(anchorDate);
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

async function skipDay(dateInput) {
  const date = String(dateInput || todayIsoDate()).slice(0, 10);
  const history = await readHistory();
  const existingIndex = history.findIndex((item) => item.date === date);
  const existing = existingIndex >= 0 ? history[existingIndex] : null;

  const existingConsumed = Number(existing?.consumed || 0);
  const existingTarget = Number(existing?.target || 0);
  const hasTrackedValues = existingConsumed > 0 || existingTarget > 0;

  const nextEntry = {
    date,
    consumed: existingConsumed,
    target: existingTarget,
    status: hasTrackedValues ? String(existing?.status || "no-data") : "skipped",
    reached: hasTrackedValues ? Boolean(existing?.reached) : false,
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

async function getCurrentStreak(anchorDate) {
  const history = await readHistory();
  const byDate = new Map(history.map((item) => [item.date, item]));
  const today = normalizeAnchorDate(anchorDate);

  let streak = 0;
  let foundTrackableDay = false;

  for (let i = 0; i < 365; i += 1) {
    const date = dateShift(today, -i);
    const entry = byDate.get(date);

    if (!entry) {
      if (!foundTrackableDay) {
        continue;
      }
      break;
    }

    if (entry.status === "skipped") {
      foundTrackableDay = true;
      continue;
    }

    foundTrackableDay = true;

    if (entry.reached) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

module.exports = {
  upsertDay,
  skipDay,
  getLastDays,
  getCurrentStreak,
  classifyDay,
};
