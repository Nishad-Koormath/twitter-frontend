import React, { useEffect, useState } from "react";
import {
  Shield,
  Flag,
  CheckCircle,
  Loader2,
  EyeOff,
  LogIn,
  LogOut,
  X,
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

function App() {
  const [comments, setComments] = useState([]);
  const [redFlags, setRedFlags] = useState([]);
  const [greenFlags, setGreenFlags] = useState([]);
  const [hiddenComments, setHiddenComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiding, setHiding] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get("auth") === "success") {
      showToast("Twitter login successful!", "success");
      setIsLoggedIn(true);
      window.history.replaceState({}, document.title, "/");
    } else if (params.get("error")) {
      const error = params.get("error");
      showToast(`Login failed: ${error}`, "error");
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/status/`, {
        credentials: "include",
      });
      
      if (res.ok) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsLoggedIn(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    if (checkingAuth) return;

    fetch(`${API_BASE}/comments/`, { credentials: "include" })
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
  }, [checkingAuth]);

  const loginWithTwitter = () => {
    window.location.href = `${API_BASE}/auth/login/`;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout/`, {
        method: "POST",
        credentials: "include",
      });
      setIsLoggedIn(false);
      showToast("Logged out successfully", "success");
    } catch (err) {
      showToast("Logout failed", "error");
    }
  };

  const hideAll = async () => {
    if (!isLoggedIn) {
      showToast("Login with Twitter to hide comments.", "error");
      return;
    }

    setHiding(true);

    try {
      const results = await Promise.allSettled(
        redFlags.map((comment) =>
          fetch(`${API_BASE}/tweet/hide/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ reply_id: comment.id }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Failed to hide ${comment.id}`);
            return res.json();
          })
        )
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (succeeded > 0) {
        showToast(`${succeeded} comment(s) hidden on Twitter!`, "success");
        setHiddenComments([...redFlags]);
        setRedFlags([]);
      }

      if (failed > 0) {
        showToast(`${failed} comment(s) failed to hide`, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to hide comments.", "error");
    } finally {
      setHiding(false);
    }
  };

  const showHidden = () => {
    setRedFlags([...hiddenComments]);
    setHiddenComments([]);
    showToast("Hidden comments restored locally!", "success");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-12 px-4">
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

      <div className="max-w-4xl mx-auto">
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

          <div className="mt-4">
            {!isLoggedIn ? (
              <button
                onClick={loginWithTwitter}
                className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl flex items-center mx-auto gap-2 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Login with Twitter
              </button>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <p className="text-sm text-emerald-600 font-medium">
                  ✅ Logged in with Twitter
                </p>
                <button
                  onClick={logout}
                  className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-600 text-lg">Fetching replies…</p>
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-5">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-semibold">Safe Comments</h2>
                <span className="ml-auto text-sm text-slate-500">
                  {greenFlags.length}
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {greenFlags.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    No safe comments
                  </p>
                ) : (
                  greenFlags.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-emerald-50 border border-emerald-200"
                    >
                      {c.cleanedText}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-5">
                <Flag className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-semibold">Flagged Comments</h2>
                <span className="ml-auto text-sm text-slate-500">
                  {redFlags.length}
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {redFlags.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    {hiddenComments.length > 0
                      ? "All flagged comments hidden"
                      : "No flagged comments"}
                  </p>
                ) : (
                  redFlags.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-red-50 border border-red-200"
                    >
                      {c.cleanedText}
                    </div>
                  ))
                )}
              </div>

              {redFlags.length > 0 && (
                <button
                  onClick={hideAll}
                  disabled={hiding || !isLoggedIn}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
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
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-xl mt-3 transition-colors"
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