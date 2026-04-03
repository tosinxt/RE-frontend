'use client';

import { useState } from 'react';

type ParsedPdf = {
  text: string;
  totalPages: number;
};

export default function PdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedPdf | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError('Please choose a PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/pdf/parse', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to parse PDF');
      }

      const data = (await res.json()) as ParsedPdf;
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unexpected error parsing PDF',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            PDF Parser MVP
          </h1>
          <p className="text-sm text-slate-400">
            Upload a PDF and get back the extracted text and basic metadata
            from the Nest backend.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              Choose PDF file
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setResult(null);
                setError(null);
              }}
              className="block w-full text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-sky-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Parsing…' : 'Parse PDF'}
          </button>

          {error && (
            <p className="text-sm text-red-400 whitespace-pre-wrap">{error}</p>
          )}
        </form>

        {result && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
                Parsed Result
              </h2>
              <span className="text-xs text-slate-500">
                Pages: {result.totalPages}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Text (first 2000 chars)
                </h3>
                <pre className="max-h-48 overflow-auto text-xs text-slate-300 whitespace-pre-wrap">
                  {result.text.slice(0, 2000)}
                </pre>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

