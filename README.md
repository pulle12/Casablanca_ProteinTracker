# ProteinTrack

Ein einfaches Studentenprojekt zum Tracken von taeglichem Protein.

## Features
- Gewicht und Groesse eingeben
- Taegliches Proteinziel berechnen (2 g pro kg Koerpergewicht)
- Mahlzeiten mit Portionen berechnen (Protein/100g, Portionsgroesse, Anzahl)
- Mahlzeiten manuell hinzufuegen
- Mahlzeiten-Templates im JSON-File speichern
- Gespeicherte Mahlzeiten auswaehlen
- Chart: gegessen vs. Ziel
- Historie fuer letzte 7 Tage (unter/ueber/erreicht)
- Streak fuer erreichte Tage

## Projektstruktur
- `src/frontend` - HTML, CSS, JavaScript
- `src/backend` - Express API
- `src/database/meals.json` - JSON-Datenbank fuer Mahlzeiten
- `src/database/history.json` - JSON-Datenbank fuer Tageshistorie
- `docs` - PRD, Prompt und User Stories

## Start
1. `npm install`
2. `npm start`
3. Browser oeffnen: `http://localhost:3000`

## API kurz
- `POST /api/protein-target` mit `{ "weight": 70, "height": 175 }`
- `GET /api/meals`
- `POST /api/meals` mit `{ "name": "Skyr", "proteinPer100g": 11, "defaultPortionGrams": 300, "category": "Snack" }`
- `GET /api/history?days=7`
- `POST /api/history` mit `{ "date": "2026-03-16", "consumed": 145, "target": 140 }`
- `GET /api/streak`
