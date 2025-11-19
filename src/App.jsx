import React, { useEffect, useState } from "react";
import {
  Shield,
  Flag,
  CheckCircle,
  Loader2,
  EyeOff,
  Eye,
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

  // Toast Notification
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

  // Fetch Twitter Comments
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

        // Clean text (@username removed)
        const cleaned = all.map((c) => ({
          ...c,
          cleanedText: c.text.replace(/^@\S+\s*/, ""),
        }));

        setRedFlags(cleaned.filter((c) => c.cleanedText.length > 10));
        setGreenFlags(cleaned.filter((c) => c.cleanedText.length <= 10));
        setComments(cleaned);

        if (cleaned.length === 0) {
          showToast("No replies found on your tweet!", "error");
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        showToast("Failed to fetch comments from Twitter", "error");
        setLoading(false);
      });
  }, []);

  // Hide All Red Flag Comments (Backend + Premium Support)
  const hideAll = () => {
    setHiding(true);

    const rawComments = comments.map((c) => ({
      id: c.id,
      text: c.text,
    }));

    fetch("http://localhost:8000/api/hide-red-flags/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments: rawComments }),
    })
      .then(async (res) => {
        if (res.status === 429) {
          showToast("Rate limit hit while hiding. Try again later.", "error");
          setHiding(false);
          return;
        }

        const data = await res.json();

        // Clean safe/hided comments again
        const cleaned = data.hided_comments.map((c) => ({
          ...c,
          cleanedText: c.text.replace(/^@\S+\s*/, ""),
        }));

        showToast("Red flag comments hidden!", "success");

        setHiddenComments([...redFlags]);
        setRedFlags([]);
        setGreenFlags(cleaned);
        setComments(cleaned);
      })
      .catch((err) => {
        console.error(err);
        showToast("Failed to hide comments", "error");
      })
      .finally(() => setHiding(false));
  };

  // Restore Comments
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
            className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border animate-in slide-in-from-top duration-300 ${
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
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Comment Classifier
          </h1>
          <p className="text-slate-500">
            Shows real replies from your real Twitter post
          </p>
        </div>

        {/* Loading Screen */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-600 text-lg">
              Fetching real replies from Twitter…
            </p>
          </div>
        )}

        {/* Comment Panels */}
        {!loading && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Safe Comments */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Safe Comments
                  </h2>
                  <p className="text-sm text-slate-500">
                    {greenFlags.length} approved
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {greenFlags.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    No short comments found
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

            {/* Red Flags */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Flag className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Flagged Comments
                  </h2>
                  <p className="text-sm text-slate-500">
                    {redFlags.length} need review
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {redFlags.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    No long comments found
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
                  disabled={hiding}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  {hiding ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Hiding…
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
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 mt-3"
                >
                  <Eye className="w-5 h-5" />
                  Show Hidden Comments ({hiddenComments.length})
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
