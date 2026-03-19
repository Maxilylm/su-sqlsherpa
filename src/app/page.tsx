"use client";

import { useState } from "react";

type Tab = "explain" | "generate";

export default function Home() {
  const [tab, setTab] = useState<Tab>("explain");
  const [sqlInput, setSqlInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleExplain() {
    if (!sqlInput.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sqlInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data.explanation);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    if (!descriptionInput.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: descriptionInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function switchTab(newTab: Tab) {
    setTab(newTab);
    setResult("");
    setError("");
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="text-accent">SQL</span>Sherpa
        </h1>
        <p className="text-muted mt-2 text-sm sm:text-base">
          AI-powered SQL explainer &amp; generator
        </p>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-3xl">
        <div className="flex border-b border-card-border mb-6">
          <button
            onClick={() => switchTab("explain")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              tab === "explain"
                ? "text-accent border-b-2 border-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            Explain SQL
          </button>
          <button
            onClick={() => switchTab("generate")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              tab === "generate"
                ? "text-accent border-b-2 border-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            Generate SQL
          </button>
        </div>

        {/* Input area */}
        <div className="bg-card border border-card-border rounded-xl p-5 mb-6">
          {tab === "explain" ? (
            <>
              <label className="block text-sm font-medium mb-2 text-muted">
                Paste your SQL query
              </label>
              <textarea
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                placeholder={`SELECT u.name, COUNT(o.id) AS order_count\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE u.created_at > '2024-01-01'\nGROUP BY u.name\nHAVING COUNT(o.id) > 5\nORDER BY order_count DESC;`}
                rows={8}
                className="w-full bg-code-bg border border-card-border rounded-lg p-4 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-y"
              />
              <button
                onClick={handleExplain}
                disabled={loading || !sqlInput.trim()}
                className="mt-4 px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors"
              >
                {loading ? "Explaining..." : "Explain Query"}
              </button>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium mb-2 text-muted">
                Describe what you need in plain English
              </label>
              <textarea
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="Find the top 10 customers who spent the most money in the last 30 days, along with their email addresses and total spend amount."
                rows={5}
                className="w-full bg-code-bg border border-card-border rounded-lg p-4 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-y font-sans"
                style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !descriptionInput.trim()}
                className="mt-4 px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors"
              >
                {loading ? "Generating..." : "Generate SQL"}
              </button>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 mb-6 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 rounded-full bg-accent animate-bounce" />
            </div>
            <span className="ml-3 text-muted text-sm">
              {tab === "explain" ? "Analyzing your query..." : "Crafting your SQL..."}
            </span>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="bg-card border border-card-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-success">
                {tab === "explain" ? "Explanation" : "Generated SQL"}
              </h2>
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="text-xs text-muted hover:text-foreground transition-colors px-2 py-1 rounded border border-card-border hover:border-muted"
              >
                Copy
              </button>
            </div>
            <div
              className="explanation text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(result) }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-8 pb-4 text-center text-xs text-muted">
        Powered by Groq &amp; Llama 3.3 &mdash; SQLSherpa
      </footer>
    </main>
  );
}

/** Simple markdown renderer for structured AI output */
function renderMarkdown(md: string): string {
  return md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
      return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Headers
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    // Ordered lists
    .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")
    // Unordered lists
    .replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>")
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>")
    // Paragraphs (lines not already wrapped)
    .replace(/^(?!<[hupol])(.*\S.*)$/gm, "<p>$1</p>")
    // Clean up whitespace
    .replace(/\n\n+/g, "\n")
    .replace(/\n/g, "");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
