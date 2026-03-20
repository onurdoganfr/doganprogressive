PROJECT REBUILD INSTRUCTIONS (IMPORTANT)
You are rebuilding an existing React-based workout tracking app.
🎯 GOAL
Recreate the EXACT SAME application behavior and UI, but:
    •   DO NOT use a single index.html file
    •   Convert the app into a MODULAR, FILE-BASED architecture
    •   Make the project scalable, clean, and maintainable
The current version works perfectly. DO NOT change logic or UI/UX.
ONLY improve structure and code organization.
⸻
🧱 TECH STACK
    •   React (with Vite)
    •   Functional components
    •   Hooks (useState, useEffect, useRef)
    •   LocalStorage (same logic must be preserved)
    •   No backend
⸻
📁 REQUIRED PROJECT STRUCTURE
src/
│
├── components/
│   ├── Sidebar.jsx
│   ├── Dashboard.jsx
│   ├── HistoryList.jsx
│   ├── DayDetail.jsx
│   ├── AddWorkout.jsx
│   ├── ExercisePicker.jsx
│   ├── DayStrip.jsx
│   ├── Stepper.jsx
│   └── LastSessionCard.jsx
│
├── data/
│   ├── exerciseLibrary.js
│   └── defaultPrograms.js
│
├── utils/
│   ├── storage.js
│   ├── date.js
│   └── workout.js
│
├── App.jsx
├── main.jsx
└── styles.css
⸻
⚙️ RULES
1. LocalStorage keys: gymHistory, gymPrograms
2. DO NOT change logic, UI texts, or class names
3. This is a STRUCTURAL REFACTOR only
