const profileForm = document.getElementById("profile-form");
const targetOutput = document.getElementById("target-output");
const goalOutput = document.getElementById("goal-output");
const consumedOutput = document.getElementById("consumed-output");

const manualMealForm = document.getElementById("manual-meal-form");
const mealNameInput = document.getElementById("meal-name");
const mealProteinPer100Input = document.getElementById("meal-protein-100");
const mealPortionInput = document.getElementById("meal-portion");
const mealServingsInput = document.getElementById("meal-servings");
const saveMealInput = document.getElementById("save-meal");

const savedMealsSelect = document.getElementById("saved-meals");
const savedMealPortionInput = document.getElementById("saved-portion");
const savedMealServingsInput = document.getElementById("saved-servings");
const addSavedMealButton = document.getElementById("add-saved-meal");

const dailyList = document.getElementById("daily-list");
const statusEl = document.getElementById("status");
const streakOutput = document.getElementById("streak-output");
const historySummary = document.getElementById("history-summary");

let target = 0;
let consumed = 0;
let savedMeals = [];
let dailyMeals = [];
let progressChart;
let historyChart;

function roundOne(value) {
  return Math.round(Number(value) * 10) / 10;
}

function todayIsoDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function setStatus(message, isError = false) {
  statusEl.textContent = message || "";
  statusEl.classList.toggle("error", isError);
}

function calculateProtein(proteinPer100g, portionGrams, servings) {
  return roundOne((Number(proteinPer100g) * Number(portionGrams) * Number(servings)) / 100);
}

function normalizeMeal(meal) {
  const proteinPer100g = Number(meal.proteinPer100g || meal.protein || 0);
  const defaultPortionGrams = Number(meal.defaultPortionGrams || 100);

  return {
    id: meal.id,
    name: meal.name,
    category: meal.category || "Allgemein",
    proteinPer100g: roundOne(proteinPer100g),
    defaultPortionGrams: roundOne(defaultPortionGrams),
  };
}

function updateOutputs() {
  goalOutput.textContent = String(roundOne(target));
  consumedOutput.textContent = String(roundOne(consumed));
}

function renderDailyMeals() {
  dailyList.innerHTML = "";

  if (dailyMeals.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Noch keine Mahlzeiten eingetragen.";
    dailyList.appendChild(li);
    return;
  }

  dailyMeals.forEach((meal) => {
    const li = document.createElement("li");
    li.textContent = `${meal.name}: ${meal.protein} g (${meal.portion} g x ${meal.servings})`;
    dailyList.appendChild(li);
  });
}

function updateProgressChart() {
  const data = [roundOne(consumed), roundOne(target)];

  if (!progressChart) {
    const ctx = document.getElementById("progress-chart");
    progressChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Gegessen", "Ziel"],
        datasets: [
          {
            label: "Protein in g",
            data,
            backgroundColor: ["#2f7d4f", "#8fbc5a"],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
    return;
  }

  progressChart.data.datasets[0].data = data;
  progressChart.update();
}

function renderHistoryChart(history) {
  const labels = history.map((day) => day.date.slice(5));
  const consumedData = history.map((day) => roundOne(day.consumed));
  const targetData = history.map((day) => roundOne(day.target));

  if (!historyChart) {
    const ctx = document.getElementById("history-chart");
    historyChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Gegessen",
            data: consumedData,
            borderColor: "#2f7d4f",
            backgroundColor: "rgba(47,125,79,0.2)",
            tension: 0.25,
          },
          {
            label: "Ziel",
            data: targetData,
            borderColor: "#8fbc5a",
            backgroundColor: "rgba(143,188,90,0.2)",
            tension: 0.25,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
    return;
  }

  historyChart.data.labels = labels;
  historyChart.data.datasets[0].data = consumedData;
  historyChart.data.datasets[1].data = targetData;
  historyChart.update();
}

function renderHistorySummary(history) {
  const reached = history.filter((d) => d.status === "reached" || d.status === "over").length;
  const under = history.filter((d) => d.status === "under").length;
  const over = history.filter((d) => d.status === "over").length;
  historySummary.textContent = `Letzte 7 Tage: erreicht ${reached}, unter Ziel ${under}, ueber Ziel ${over}`;
}

async function saveTodayHistory() {
  try {
    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: todayIsoDate(),
        consumed: roundOne(consumed),
        target: roundOne(target),
      }),
    });

    await refreshHistoryAndStreak();
  } catch (error) {
    setStatus("Historie konnte nicht gespeichert werden.", true);
  }
}

async function refreshHistoryAndStreak() {
  try {
    const [historyRes, streakRes] = await Promise.all([
      fetch("/api/history?days=7"),
      fetch("/api/streak"),
    ]);

    if (!historyRes.ok || !streakRes.ok) {
      throw new Error("Historie oder Streak konnte nicht geladen werden.");
    }

    const history = await historyRes.json();
    const streakData = await streakRes.json();

    renderHistoryChart(history);
    renderHistorySummary(history);
    streakOutput.textContent = String(streakData.streak || 0);
  } catch (error) {
    setStatus(error.message, true);
  }
}

function addMealToDay(meal) {
  dailyMeals.push(meal);
  consumed += Number(meal.protein);
  consumed = roundOne(consumed);
  updateOutputs();
  renderDailyMeals();
  updateProgressChart();
}

function getSelectedSavedMeal() {
  const selectedId = savedMealsSelect.value;
  return savedMeals.find((meal) => meal.id === selectedId);
}

function renderSavedMeals() {
  savedMealsSelect.innerHTML = "";

  if (savedMeals.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Keine gespeicherten Mahlzeiten";
    savedMealsSelect.appendChild(option);
    savedMealsSelect.disabled = true;
    addSavedMealButton.disabled = true;
    return;
  }

  savedMealsSelect.disabled = false;
  addSavedMealButton.disabled = false;

  savedMeals.forEach((meal) => {
    const option = document.createElement("option");
    option.value = meal.id;
    option.textContent = `${meal.name} (${meal.proteinPer100g} g / 100 g)`;
    savedMealsSelect.appendChild(option);
  });

  const selected = getSelectedSavedMeal();
  if (selected) {
    savedMealPortionInput.value = String(selected.defaultPortionGrams);
  }
}

async function loadSavedMeals() {
  try {
    const response = await fetch("/api/meals");
    if (!response.ok) {
      throw new Error("Mahlzeiten konnten nicht geladen werden.");
    }

    const meals = await response.json();
    savedMeals = meals.map(normalizeMeal);
    renderSavedMeals();
  } catch (error) {
    setStatus(error.message, true);
  }
}

savedMealsSelect.addEventListener("change", () => {
  const meal = getSelectedSavedMeal();
  if (meal) {
    savedMealPortionInput.value = String(meal.defaultPortionGrams);
  }
});

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const weight = Number(document.getElementById("weight").value);
  const height = Number(document.getElementById("height").value);

  try {
    const response = await fetch("/api/protein-target", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight, height }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Ziel konnte nicht berechnet werden.");
    }

    target = data.target;
    targetOutput.textContent = `Dein Ziel: ${data.target} g Protein pro Tag (2 g/kg, BMI: ${data.bmi})`;
    updateOutputs();
    updateProgressChart();
    await saveTodayHistory();
    setStatus("Proteinziel erfolgreich berechnet.");
  } catch (error) {
    setStatus(error.message, true);
  }
});

manualMealForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = mealNameInput.value.trim();
  const proteinPer100g = Number(mealProteinPer100Input.value);
  const portion = Number(mealPortionInput.value);
  const servings = Number(mealServingsInput.value);

  if (!name || proteinPer100g <= 0 || portion <= 0 || servings <= 0) {
    setStatus("Bitte gueltige Werte fuer Name, Protein/100g, Portion und Anzahl eingeben.", true);
    return;
  }

  const protein = calculateProtein(proteinPer100g, portion, servings);
  addMealToDay({ name, protein, portion: roundOne(portion), servings: roundOne(servings) });
  await saveTodayHistory();

  if (saveMealInput.checked) {
    try {
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          proteinPer100g,
          defaultPortionGrams: portion,
          category: "Custom",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Mahlzeit konnte nicht gespeichert werden.");
      }

      await loadSavedMeals();
      setStatus(data.existed ? "Mahlzeit war bereits gespeichert." : "Mahlzeit gespeichert und hinzugefuegt.");
    } catch (error) {
      setStatus(error.message, true);
    }
  } else {
    setStatus("Mahlzeit zum Tag hinzugefuegt.");
  }

  manualMealForm.reset();
  saveMealInput.checked = true;
  mealServingsInput.value = "1";
});

addSavedMealButton.addEventListener("click", async () => {
  const meal = getSelectedSavedMeal();
  const portion = Number(savedMealPortionInput.value);
  const servings = Number(savedMealServingsInput.value);

  if (!meal) {
    setStatus("Bitte zuerst eine Mahlzeit auswaehlen.", true);
    return;
  }

  if (portion <= 0 || servings <= 0) {
    setStatus("Bitte gueltige Portionswerte eingeben.", true);
    return;
  }

  const protein = calculateProtein(meal.proteinPer100g, portion, servings);
  addMealToDay({
    name: meal.name,
    protein,
    portion: roundOne(portion),
    servings: roundOne(servings),
  });
  await saveTodayHistory();
  setStatus(`Mahlzeit \"${meal.name}\" hinzugefuegt (${protein} g).`);
});

(async function init() {
  updateOutputs();
  renderDailyMeals();
  updateProgressChart();
  await loadSavedMeals();
  await refreshHistoryAndStreak();
})();
