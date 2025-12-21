export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-7 h-7 text-black"
            >
              <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">WebNotes</h1>
        </div>

        {/* Tagline */}
        <p className="text-lg text-[var(--zinc-400)]">
          A beautiful note-taking app with Markdown, Math, and more.
        </p>

        {/* Theme Preview */}
        <div className="grid gap-4 mt-12">
          <h2 className="text-xl font-semibold text-[var(--zinc-200)]">
            Theme Preview
          </h2>

          {/* Color Swatches */}
          <div className="flex justify-center gap-2">
            {[
              { name: "accent", color: "var(--accent)" },
              { name: "zinc-200", color: "var(--zinc-200)" },
              { name: "zinc-400", color: "var(--zinc-400)" },
              { name: "zinc-600", color: "var(--zinc-600)" },
              { name: "zinc-800", color: "var(--zinc-800)" },
            ].map((swatch) => (
              <div
                key={swatch.name}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-10 h-10 rounded-lg border border-[var(--border)]"
                  style={{ background: swatch.color }}
                />
                <span className="text-xs text-[var(--zinc-500)]">
                  {swatch.name}
                </span>
              </div>
            ))}
          </div>

          {/* Typography Preview */}
          <div className="mt-8 p-6 rounded-lg border border-[var(--border)] bg-[var(--zinc-950)] text-left">
            <h3 className="text-lg font-semibold mb-4 text-[var(--zinc-100)]">
              Typography Preview
            </h3>
            <div className="space-y-2 text-[var(--zinc-300)]">
              <p>
                Regular paragraph text with <strong>bold</strong> and{" "}
                <em>italic</em> styles.
              </p>
              <p>
                <code className="bg-[var(--zinc-800)] px-2 py-1 rounded text-sm font-mono text-[var(--zinc-200)]">
                  inline code
                </code>
              </p>
              <blockquote className="border-l-4 border-[var(--zinc-700)] pl-4 italic text-[var(--zinc-400)]">
                Blockquote styling preview
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
