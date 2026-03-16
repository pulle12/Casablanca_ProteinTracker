const express = require("express");
const path = require("path");
const { readMeals, addMeal } = require("./mealRepository");
const { upsertDay, getLastDays, getCurrentStreak } = require("./historyRepository");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

function calculateProteinTarget(weightKg, heightCm) {
  const weight = Number(weightKg);
  const height = Number(heightCm);

  if (!Number.isFinite(weight) || weight <= 0) {
    return { isValid: false, message: "Gewicht muss eine Zahl groesser als 0 sein." };
  }

  if (!Number.isFinite(height) || height <= 0) {
    return { isValid: false, message: "Groesse muss eine Zahl groesser als 0 sein." };
  }

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const factor = 2;
  const target = Math.round(weight * factor);

  return {
    isValid: true,
    target,
    bmi: Math.round(bmi * 10) / 10,
    factor,
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ProteinTrack API" });
});

app.post("/api/protein-target", (req, res) => {
  const { weight, height } = req.body || {};
  const result = calculateProteinTarget(weight, height);

  if (!result.isValid) {
    return res.status(400).json({ error: result.message });
  }

  return res.json({
    target: result.target,
    bmi: result.bmi,
    factor: result.factor,
  });
});

app.get("/api/meals", async (_req, res) => {
  try {
    const meals = await readMeals();
    return res.json(meals);
  } catch (error) {
    return res.status(500).json({ error: "Mahlzeiten konnten nicht geladen werden." });
  }
});

app.post("/api/meals", async (req, res) => {
  const { name, proteinPer100g, defaultPortionGrams, category } = req.body || {};

  try {
    const result = await addMeal(name, proteinPer100g, defaultPortionGrams, category);
    if (!result.isValid) {
      return res.status(400).json({ error: result.message });
    }

    return res.status(result.existed ? 200 : 201).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Mahlzeit konnte nicht gespeichert werden." });
  }
});

app.get("/api/history", async (req, res) => {
  try {
    const days = Number(req.query.days || 7);
    const history = await getLastDays(days);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: "Historie konnte nicht geladen werden." });
  }
});

app.post("/api/history", async (req, res) => {
  const { date, consumed, target } = req.body || {};

  try {
    const entry = await upsertDay({ date, consumed, target });
    return res.status(201).json(entry);
  } catch (error) {
    return res.status(500).json({ error: "Historie konnte nicht gespeichert werden." });
  }
});

app.get("/api/streak", async (_req, res) => {
  try {
    const streak = await getCurrentStreak();
    return res.json({ streak });
  } catch (error) {
    return res.status(500).json({ error: "Streak konnte nicht berechnet werden." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.listen(PORT, () => {
  console.log(`ProteinTrack running on http://localhost:${PORT}`);
});
