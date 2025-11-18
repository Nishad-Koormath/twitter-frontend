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

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    fetch("http://localhost:8000/api/comments/")
      .then((res) => res.json())
      .then((data) => {
        const all = data.comments;
        setComments(all);
        setRedFlags(all.filter((c) => c.text.length > 10));
        setGreenFlags(all.filter((c) => c.text.length <= 10));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const hideAll = () => {
    setHiding(true);
    fetch("http://localhost:8000/api/hide-red-flags/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        showToast("Red flag comments hidden successfully!", "success");
        setHiddenComments([...redFlags]);
        setRedFlags([]);
        setGreenFlags(data.hided_comments);
        setComments(data.hided_comments);
      })
      .catch((err) => {
        console.error(err);
        showToast("Failed to hide comments", "error");
      })
      .finally(() => setHiding(false));
  };

  const showHidden = () => {
    setRedFlags([...hiddenComments]);
    setHiddenComments([]);
    showToast("Hidden comments restored!", "success");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-12 px-4">
      {/* Toast Container */}
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
              className={`w-5 h-5 shrink-0 ${
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
              className={`p-1 rounded-lg transition-colors ${
                toast.type === "success"
                  ? "hover:bg-emerald-100"
                  : "hover:bg-red-100"
              }`}
            >
              <X
                className={`w-4 h-4 ${
                  toast.type === "success" ? "text-emerald-600" : "text-red-600"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Comment Classifier
          </h1>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-600 text-lg">Analyzing comments...</p>
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Green Flags Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
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
                    No safe comments found
                  </p>
                ) : (
                  greenFlags.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-700 hover:bg-emerald-100 transition-colors"
                    >
                      {c.text}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Red Flags Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
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
                    No flagged comments
                  </p>
                ) : (
                  redFlags.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-red-50 border border-red-200 text-slate-700 hover:bg-red-100 transition-colors"
                    >
                      {c.text}
                    </div>
                  ))
                )}
              </div>

              {redFlags.length > 0 && (
                <button
                  onClick={hideAll}
                  disabled={hiding}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  {hiding ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Hiding...
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
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md mt-3"
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
