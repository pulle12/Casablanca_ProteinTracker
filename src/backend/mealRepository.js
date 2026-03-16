const fs = require("fs/promises");
const path = require("path");

const MEALS_FILE = path.join(__dirname, "..", "database", "meals.json");

async function readMeals() {
  try {
    const content = await fs.readFile(MEALS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeMeals(meals) {
  await fs.writeFile(MEALS_FILE, `${JSON.stringify(meals, null, 2)}\n`, "utf-8");
}

function normalizeMealName(name) {
  return String(name).trim().toLowerCase();
}

function validateMealInput(name, proteinPer100g, defaultPortionGrams) {
  const trimmedName = String(name || "").trim();
  const proteinPer100gNumber = Number(proteinPer100g);
  const defaultPortionNumber = Number(defaultPortionGrams);

  if (!trimmedName) {
    return { isValid: false, message: "Bitte einen Mahlzeit-Namen eingeben." };
  }

  if (!Number.isFinite(proteinPer100gNumber) || proteinPer100gNumber <= 0) {
    return { isValid: false, message: "Protein pro 100 g muss eine Zahl groesser als 0 sein." };
  }

  if (!Number.isFinite(defaultPortionNumber) || defaultPortionNumber <= 0) {
    return { isValid: false, message: "Portion (g) muss eine Zahl groesser als 0 sein." };
  }

  return {
    isValid: true,
    meal: {
      name: trimmedName,
      proteinPer100g: Math.round(proteinPer100gNumber * 10) / 10,
      defaultPortionGrams: Math.round(defaultPortionNumber * 10) / 10,
    },
  };
}

async function addMeal(name, proteinPer100g, defaultPortionGrams, category) {
  const validation = validateMealInput(name, proteinPer100g, defaultPortionGrams);
  if (!validation.isValid) {
    return validation;
  }

  const meals = await readMeals();
  const alreadyExists = meals.find(
    (meal) => normalizeMealName(meal.name) === normalizeMealName(validation.meal.name)
  );

  if (alreadyExists) {
    return { isValid: true, existed: true, meal: alreadyExists };
  }

  const nextMeal = {
    id: `meal-${Date.now()}`,
    ...validation.meal,
    category: String(category || "Allgemein").trim() || "Allgemein",
  };

  meals.push(nextMeal);
  await writeMeals(meals);

  return { isValid: true, existed: false, meal: nextMeal };
}

module.exports = {
  readMeals,
  addMeal,
};
