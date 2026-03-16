# Tech Stack - ProteinTrack

## Ueberblick
ProteinTrack ist eine kleine Web-App mit Frontend, Backend und JSON-Dateien als einfache Datenbank.

## Verwendete Technologien
- Node.js: Laufzeit fuer den Server
- Express: Web-Framework fuer API-Endpunkte und statische Dateien
- HTML: Struktur der Benutzeroberflaeche
- CSS: Layout und Design
- Vanilla JavaScript: Frontend-Logik und API-Aufrufe
- Chart.js: Diagramme fuer Tagesfortschritt und 7-Tage-Historie
- JSON-Dateien: einfache persistente Speicherung (ohne echte SQL-Datenbank)

## Projektstruktur
- src/frontend
  - index.html: UI mit Formularen und Diagramm-Flaechen
  - styles.css: Styling und responsive Layout
  - app.js: gesamte Client-Logik (Berechnung, API-Aufrufe, UI-Updates)
- src/backend
  - server.js: Express-Server und API-Routen
  - mealRepository.js: Lesen/Schreiben von Mahlzeiten in meals.json
  - historyRepository.js: Lesen/Schreiben von Tageshistorie und Streak-Berechnung
- src/database
  - meals.json: gespeicherte Mahlzeiten-Templates
  - history.json: taegliche Werte fuer Historie
- docs
  - PRD, Prompts, User Stories und diese Tech-Stack-Doku

## So funktioniert die App
1. User gibt Gewicht und Groesse ein.
2. Backend berechnet das Ziel mit 2 g Protein pro kg Koerpergewicht.
3. User fuegt Mahlzeiten hinzu (manuell oder aus gespeicherten Templates).
4. Protein wird aus Protein/100g und Portionsgroesse berechnet.
5. Tageswert wird im Frontend summiert.
6. Tageswert + Ziel werden in history.json gespeichert.
7. Historie fuer die letzten 7 Tage wird als Diagramm angezeigt.
8. Streak zeigt, wie viele Tage in Folge das Ziel erreicht wurde.

## Wichtige API-Endpunkte
- GET /api/health
  - einfacher Check, ob der Server laeuft
- POST /api/protein-target
  - Input: weight, height
  - Output: target, bmi, factor
- GET /api/meals
  - liefert gespeicherte Mahlzeiten
- POST /api/meals
  - speichert neue Mahlzeiten-Templates
- GET /api/history?days=7
  - liefert Tageshistorie fuer die letzten X Tage
- POST /api/history
  - speichert/aktualisiert einen Tageswert
- GET /api/streak
  - liefert aktuelle Streak

## Datenmodell (vereinfacht)
### meals.json
- id: eindeutige ID
- name: Name der Mahlzeit
- proteinPer100g: Protein pro 100 g
- defaultPortionGrams: Standard-Portion in g
- category: Kategorie (z. B. Snack)

### history.json
- date: Datum im Format YYYY-MM-DD
- consumed: konsumiertes Protein in g
- target: Tagesziel in g
- status: reached, over, under, no-data
- reached: true/false fuer Ziel erreicht

## Warum dieser Stack fuer ein Schulprojekt gut ist
- Einfach zu verstehen und schnell aufzusetzen
- Keine komplexe Datenbank-Installation noetig
- Klare Trennung von Frontend und Backend
- Gut erweiterbar (z. B. Login, echte Datenbank, Deployment)

## Lokal starten
1. npm install
2. npm start
3. Browser: http://localhost:3000
