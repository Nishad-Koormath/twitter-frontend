Frontend – Twitter Comment Classifier (React + Vite + Tailwind v4)

This is the frontend UI for the Twitter Comment Classifier project.
It connects to the Django backend to fetch real replies from your Twitter post, classifies them, and allows hiding red-flag comments.


📌 Features
✅ Fetches Real Twitter Replies
Automatically loads replies from the backend API
Cleans tweet text by removing @username mention
Classifies comments into:
Green Flag (≤ 10 chars)
Red Flag (> 10 chars)

✅ Hide All Red Flag Comments
Sends raw comments to backend
Backend simulates hide action
UI updates instantly
Can restore hidden comments

✅ Modern UI with Tailwind v4
Responsive card layout
Smooth animations
lucide-react icons
Clean spacing & shadows

✅ Toast Notifications
Success & error messages
Auto-dismiss animations
Visible rate-limit warnings

✅ Twitter Rate Limit Handling
Shows toast when backend returns 429
No UI crash
Dummy mode supported for testing

🛠️ Tech Stack
React (Vite)
Tailwind CSS v4
lucide-react
Fetch API
JavaScript ES6

📂 Folder Structure
frontend/
  ├── src/
  │   ├── App.jsx
  │   ├── main.jsx
  │   └── index.css
  ├── vite.config.js
  ├── package.json
  └── tailwind.config.js

🚀 Setup Instructions
1️⃣ Install dependencies
npm install

2️⃣ Run development server
npm run dev

Frontend will run at:
http://localhost:5173
3️⃣ Ensure backend is running at:
http://localhost:8000

🔌 API Configuration (already inside App.jsx)
Fetch comments:
http://localhost:8000/api/comments/

Hide red flags:
http://localhost:8000/api/hide-red-flags/


📄 Core Logic Example (App.jsx)
useEffect(() => {
  fetch("http://localhost:8000/api/comments/")
    .then(async (res) => {
      if (res.status === 429) {
        showToast("Twitter rate limit reached. Try again later.", "error");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const all = data.comments || [];

      // Clean reply text
      const cleaned = all.map((c) => {
        const cleanedText = c.text.replace(/^@\w+\s*/, "");
        return { ...c, cleanedText };
      });

      setRedFlags(cleaned.filter((c) => c.cleanedText.length > 10));
      setGreenFlags(cleaned.filter((c) => c.cleanedText.length <= 10));
      setComments(cleaned);

      if (cleaned.length === 0) {
        showToast("No replies found on your tweet!", "error");
      }

      setLoading(false);
    })
    .catch(() => {
      showToast("Failed to fetch comments from Twitter", "error");
      setLoading(false);
    });
}, []);

🎨 UI Highlights

Tailwind v4 utility classes

Lucide icons (Shield, Flag, EyeOff, Eye, Loader2)

Smooth list transitions

Animated toast container

Dark text contrast for readability
