import { useState } from "react";
import { UploadCloud, FileSpreadsheet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Modal } from "./Modal";
import { usePtoStore } from "../store/usePtoStore";
import { importPtoWorkbook } from "../lib/importXlsx";
import type { ImportResult } from "../types";

export function ImportModal({ onClose }: { onClose: () => void }) {
  const leaveTypes = usePtoStore((s) => s.leaveTypes);
  const hoursPerDay = usePtoStore((s) => s.settings.hoursPerDay);
  const importEntries = usePtoStore((s) => s.importEntries);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [done, setDone] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const typeCodeToId = Object.fromEntries(leaveTypes.map((t) => [t.code.toUpperCase(), t.id]));
      const defaultTypeId = leaveTypes.find((t) => t.code === "PTO")?.id ?? leaveTypes[0]?.id;
      if (!defaultTypeId) throw new Error("No leave types configured yet.");
      const res = await importPtoWorkbook(file, { hoursPerDay, typeCodeToId, defaultTypeId });
      if (res.entries.length === 0) {
        setError('No PTO log rows found. This importer looks for sheets named like "PTO Tracking 2025" with a "Date" column.');
      } else {
        setResult(res);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this file.");
    } finally {
      setBusy(false);
    }
  }

  function commit() {
    if (!result) return;
    importEntries(result.entries);
    setDone(true);
  }

  return (
    <Modal title="Import from spreadsheet" onClose={onClose} maxWidth="max-w-lg">
      {done ? (
        <div className="text-center py-6 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-good mx-auto" />
          <p className="text-sm text-ink">
            Imported {result?.entries.length} {result?.entries.length === 1 ? "request" : "requests"}.
          </p>
          <button
            onClick={onClose}
            className="bg-pto hover:opacity-90 text-white text-sm font-semibold rounded-lg px-4 py-1.5 transition-opacity"
          >
            Done
          </button>
        </div>
      ) : result ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-ink">
            <FileSpreadsheet className="w-4 h-4 text-pto" />
            Read {result.sheetsRead.length} {result.sheetsRead.length === 1 ? "sheet" : "sheets"}:{" "}
            <span className="text-ink-secondary">{result.sheetsRead.join(", ")}</span>
          </div>
          <p className="text-sm text-ink">
            Found <strong>{result.entries.length}</strong> time-off entries.
          </p>
          {result.issues.length > 0 && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                {result.issues.length} {result.issues.length === 1 ? "row needs" : "rows need"} review after import
              </p>
              {result.issues.slice(0, 12).map((issue, i) => (
                <p key={i} className="text-xs text-ink-secondary">
                  {issue.sheet} row {issue.row}: {issue.message}
                </p>
              ))}
              {result.issues.length > 12 && (
                <p className="text-xs text-ink-muted">…and {result.issues.length - 12} more</p>
              )}
            </div>
          )}
          <p className="text-xs text-ink-muted">
            Imported requests are added to what's already here — nothing is overwritten. Flagged rows can be fixed
            individually on the Requests page.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="bg-surface-2 hover:bg-gridline border border-border-c text-ink text-sm font-medium rounded-lg px-4 py-1.5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={commit}
              className="bg-pto hover:opacity-90 text-white text-sm font-semibold rounded-lg px-4 py-1.5 transition-opacity"
            >
              Import {result.entries.length}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border-c rounded-xl py-10 cursor-pointer hover:border-pto/50 hover:bg-pto/5 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
          >
            <UploadCloud className="w-8 h-8 text-ink-muted" />
            <span className="text-sm text-ink-secondary">
              {busy ? "Reading file…" : "Drop your .xlsx file here, or click to browse"}
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
          <p className="text-xs text-ink-muted mt-3">
            Everything is parsed locally in your browser — the file is never uploaded anywhere. Works best with
            sheets named like "PTO Tracking 2025" containing Date / Hours / Type columns.
          </p>
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-critical mt-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
