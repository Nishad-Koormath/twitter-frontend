import React, { useEffect, useState } from "react";
import {
  Shield,
  Flag,
  CheckCircle,
  Loader2,
  EyeOff,
  Eye,
  LogIn,
  X,
} from "lucide-react";

function App() {
  const [comments, setComments] = useState([]);
  const [redFlags, setRedFlags] = useState([]);
  const [greenFlags, setGreenFlags] = useState([]);
  const [hiddenComments, setHiddenComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiding, setHiding] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Track OAuth Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Toasts
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => {
      setToasts((p) => p.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  };

  // Detect OAuth Callback
  useEffect(() => {
    if (window.location.search.includes("code=")) {
      showToast("Twitter login successful!", "success");
      setIsLoggedIn(true);
    } else {
      // Check session (backend will validate)
      fetch("http://localhost:8000/api/tweet/hide/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_id: "test" }), // test
      }).then((res) => {
        if (res.status === 401) setIsLoggedIn(false);
        else setIsLoggedIn(true);
      });
    }
  }, []);

  // Fetch Twitter Replies
  useEffect(() => {
    fetch("http://localhost:8000/api/comments/")
      .then(async (res) => {
        if (res.status === 429) {
          showToast("Twitter rate limit reached.", "error");
          setLoading(false);
          return;
        }

        const data = await res.json();
        const all = data.comments || [];

        const cleaned = all.map((c) => ({
          ...c,
          cleanedText: c.text.replace(/^@\S+\s*/, ""),
        }));

        setRedFlags(cleaned.filter((c) => c.cleanedText.length > 10));
        setGreenFlags(cleaned.filter((c) => c.cleanedText.length <= 10));
        setComments(cleaned);

        if (cleaned.length === 0) {
          showToast("No replies found.", "error");
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        showToast("Failed to fetch comments.", "error");
        setLoading(false);
      });
  }, []);

  // ==== LOGIN HANDLER ====
  const loginWithTwitter = () => {
    window.location.href = "http://localhost:8000/api/auth/login/";
  };

  // ==== REAL HIDE USING USER OAUTH TOKEN ====
  const hideAll = () => {
    if (!isLoggedIn) {
      showToast("Login with Twitter to hide comments.", "error");
      return;
    }

    setHiding(true);

    Promise.all(
      redFlags.map((comment) =>
        fetch("http://localhost:8000/api/tweet/hide/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reply_id: comment.id }),
        }).then((res) => res.json())
      )
    )
      .then(() => {
        showToast("Red flag comments hidden on Twitter!", "success");

        setHiddenComments([...redFlags]);
        setRedFlags([]);
      })
      .catch((err) => {
        console.error(err);
        showToast("Failed to hide comments.", "error");
      })
      .finally(() => setHiding(false));
  };

  // Restore locally
  const showHidden = () => {
    setRedFlags([...hiddenComments]);
    setHiddenComments([]);
    showToast("Hidden comments restored!", "success");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-12 px-4">

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <CheckCircle
              className={`w-5 h-5 ${
                toast.type === "success" ? "text-emerald-600" : "text-red-600"
              }`}
            />
            <p
              className={`font-medium ${
                toast.type === "success" ? "text-emerald-800" : "text-red-800"
              }`}
            >
              {toast.message}
            </p>
            <button onClick={() => removeToast(toast.id)}>
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Comment Classifier
          </h1>
          <p className="text-slate-500">
            Shows replies from your Twitter post
          </p>

          {/* LOGIN BUTTON */}
          <div className="mt-4">
            {!isLoggedIn ? (
              <button
                onClick={loginWithTwitter}
                className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl flex items-center mx-auto gap-2"
              >
                <LogIn className="w-5 h-5" />
                Login with Twitter
              </button>
            ) : (
              <p className="text-sm text-emerald-600 font-medium">
                ✅ Logged in with Twitter
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-600 text-lg">
              Fetching replies…
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Safe Comments */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-5">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-semibold">Safe Comments</h2>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {greenFlags.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-emerald-50 border border-emerald-200"
                  >
                    {c.cleanedText}
                  </div>
                ))}
              </div>
            </div>

            {/* Red Flags */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-5">
                <Flag className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-semibold">Flagged Comments</h2>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {redFlags.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-red-50 border border-red-200"
                  >
                    {c.cleanedText}
                  </div>
                ))}
              </div>

              {redFlags.length > 0 && (
                <button
                  onClick={hideAll}
                  disabled={hiding}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  {hiding ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Hiding on Twitter…
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-5 h-5" />
                      Hide All Flagged Comments
                    </>
                  )}
                </button>
              )}

              {hiddenComments.length > 0 && (
                <button
                  onClick={showHidden}
                  className="w-full bg-slate-700 text-white py-3 rounded-xl mt-3"
                >
                  Restore Hidden Comments ({hiddenComments.length})
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
