# PRD - ProteinPilot

## Group Name
ProteinTrack

## Product Name
ProteinTrack

## Problem
Many students and beginners want to eat enough protein but do not know how much they need per day. They also forget what they already ate.

## Solution
ProteinPilot helps users track daily protein intake. Users enter weight and height, and the app calculates a simple daily protein goal. Users can add meals and see progress in a chart.

## Target Users
- Students who want a healthy routine
- Beginners in fitness
- People who want a simple nutrition tool

## Core Features
- User enters weight and height
- App calculates daily protein target
- User can add eaten meals to daily intake
- Meals are stored in a JSON file
- User can select saved meals from the JSON list
- Progress chart shows target vs consumed protein

## Non-Goals
- No calorie, fat, or carb tracking
- No advanced medical nutrition advice
- No login system or cloud sync in v1
- No AI meal suggestions in v1

## Simple Tech Suggestion
- Frontend: HTML, CSS, JavaScript
- Chart: Chart.js
- Data storage: local JSON file
- Optional backend (if needed): Node.js + Express for reading/writing JSON
