🌐 Comment Classifier Frontend (React + Tailwind CSS v4)

This repository contains the frontend UI for the Comment Classifier project, built for the Incramania Pvt Ltd Python Full Stack Developer Task.

The frontend fetches comments from the Django API, classifies them, hides red-flag comments, and provides a clean, responsive UI.

🚀 Tech Stack
React (Vite)
Tailwind CSS v4 (Engine v4 — no config needed)
Lucide React Icons
Fetch API

📌 Features

✔ Fetch comments from backend
✔ Classify comments based on length
✔ Red Flag (length > 10)
✔ Green Flag (length ≤ 10)
✔ Hide All red-flag comments (API simulated)
✔ Restore hidden comments
✔ Toast notifications
✔ Smooth transitions & icons
✔ Tailwind CSS modern UI

📁 Project Structure
frontend/
│── index.html
│── vite.config.js
│── package.json
│── src/
     ├── App.jsx
     ├── main.jsx
     ├── index.css

⚙️ Setup & Installation
1️⃣ Install Dependencies
npm install

2️⃣ Install Tailwind v4
npm install tailwindcss@next

3️⃣ Add Tailwind Import

src/index.css:

@import "tailwindcss";

4️⃣ Start Project
npm run dev


Frontend runs at:
👉 http://localhost:5173/

Backend must be running at:
👉 http://localhost:8000/

🔗 API Endpoints Used
Endpoint	Method	Purpose
/api/comments/	GET	Fetch all comments
/api/hide-red-flags/	POST	Hide red-flag comments
🧠 Approach
1️⃣ Fetch comments on load

Split into:

greenFlags → text length ≤ 10

redFlags → text length > 10

2️⃣ Hide All button

Calls /api/hide-red-flags/

Moves red flags into hiddenComments

Clears red flags from UI

Shows toast feedback

3️⃣ Show Hidden

Restores previously hidden comments.

🎨 UI Highlights

Clean card-based layout
Tailwind CSS v4 utilities
Icons using lucide-react
Toast alerts for success/error
Loading spinners
Smooth fade-in animation
