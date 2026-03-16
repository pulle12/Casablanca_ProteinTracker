# ProteinTrack - Projektuebersicht (Stand: 16.03.2026)

## 1. Ziel des Projekts
ProteinTrack ist eine kleine Web-App zum Tracken der taeglichen Proteinaufnahme.
Nutzerinnen und Nutzer koennen ihr Proteinziel berechnen, Mahlzeiten erfassen, den Tagesfortschritt sehen und die letzten 7 Tage inklusive Streak auswerten.

## 2. Funktionsumfang
- Profil: Gewicht und Groesse erfassen
- Zielberechnung: 2 g Protein pro kg Koerpergewicht
- Mahlzeiten:
  - manuell erfassen (Protein pro 100 g, Portionsgroesse, Anzahl)
  - als Vorlage speichern
  - gespeicherte Vorlagen wiederverwenden
- Tagesansicht:
  - aktueller Proteinverbrauch vs. Tagesziel
  - Liste der heute eingetragenen Mahlzeiten
  - Balkendiagramm (Gegessen vs Ziel)
- Historie:
  - letzte 7 Tage als Liniendiagramm
  - Zusammenfassung: erreicht, unter Ziel, ueber Ziel, skipped
- Streak:
  - Tage in Folge mit erreichtem Ziel
  - skipped Tage sind neutral und brechen die Streak nicht
- Testmodus fuer Tage:
  - aktiver Tag wird angezeigt
  - Tag kann als skipped markiert werden
  - Ruecksprung auf heutigen Tag per Button

## 3. Architektur
### Frontend
- Dateien: src/frontend/index.html, src/frontend/styles.css, src/frontend/app.js
- Aufgaben:
  - UI-Rendering
  - Events (Formulare, Buttons)
  - API-Aufrufe an das Backend
  - Diagramme mit Chart.js
  - Persistenz von Profil und aktivem Tag in localStorage

### Backend
- Datei: src/backend/server.js
- Technologie: Express
- Aufgaben:
  - REST-API bereitstellen
  - Validierung einfacher Eingaben
  - Zugriff auf Repositories
  - Ausliefern des Frontends

### Datenhaltung
- src/database/meals.json
- src/database/history.json
- Repositories:
  - src/backend/mealRepository.js
  - src/backend/historyRepository.js

## 4. Wichtige API-Endpunkte
- GET /api/health
- POST /api/protein-target
- GET /api/meals
- POST /api/meals
- GET /api/history?days=7&anchorDate=YYYY-MM-DD
- POST /api/history
- POST /api/history/skip
- GET /api/streak?anchorDate=YYYY-MM-DD

## 5. Statuslogik Historie
Moegliche status-Werte pro Tag:
- reached: Ziel innerhalb Toleranz erreicht
- over: Ziel ueberschritten
- under: unter Ziel
- skipped: Tag absichtlich ausgelassen
- no-data: kein Datensatz vorhanden
- no-target: Verbrauch ohne gesetztes Ziel

Aktuelle Regelungen:
- reached zaehlt fuer die Streak
- over zaehlt ebenfalls als erreicht
- skipped ist neutral (kein Plus, kein Minus fuer Streak)
- Wenn ein Tag bereits getrackte Werte hat, ueberschreibt ein Skip nicht mehr die bestehende Bewertung

## 6. Aktuelle Korrekturen (dieser Stand)
- Datumsschiebung im Frontend auf UTC-stabile Logik umgestellt, damit der aktive Tag korrekt weitergeschaltet wird.
- Button fuer Ruecksprung auf den heutigen Tag eingebaut.
- History- und Streak-Requests im Frontend mit cache: no-store, damit UI sofort frische Daten zeigt.
- Datumslogik im Backend fuer Tagesfenster und Streak robust gemacht.
- Skip-Verhalten so angepasst, dass bestehende Tageswerte und bestehende Tagesbewertung nicht ungewollt zerstort werden.

## 7. Projektstruktur (Kurzuebersicht)
- package.json
- README.md
- docs/
- src/backend/
- src/database/
- src/frontend/

## 8. Start und Betrieb
1. npm install
2. npm start
3. Browser: http://localhost:3000

Hinweis zu Windows/Port 3000:
Wenn bereits ein Prozess auf Port 3000 laeuft, startet der Server nicht.
Dann den laufenden Prozess beenden und erneut npm start ausfuehren.

## 9. Bekannte technische Hinweise
- Die Tagesanzeige basiert auf dem aktiven Tag aus localStorage (Testmodus).
- Historie und Streak haengen vom anchorDate ab; das erlaubt reproduzierbare Tests.
- Der Skip-Button ist aktuell als Testfunktion gedacht.

## 10. Empfohlene naechste Schritte
- Automatisierte Tests fuer historyRepository (Streak/Skip/Statusfaelle)
- Optional: separater Produktionsmodus ohne Test-Tag-Navigation
- Optional: API-Validierung fuer Datumsformat zentralisieren
