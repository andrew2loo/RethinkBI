import React, { useEffect, useState } from "react";

export function StatusBar(): JSX.Element {
  const [status, setStatus] = useState<{ engine: string; version: string; busy: boolean } | null>(null);

  useEffect(() => {
    void (async () => {
      const s = await window.api.getStatus();
      setStatus(s);
    })();
  }, []);

  return (
    <div className="h-7 bg-[var(--panel)] border-t border-[var(--border)] flex items-center px-4 text-xs text-[var(--muted)]">
      <span>
        {status ? `${status.engine} ${status.version}` : "Loading..."}
        {status?.busy && " • Busy"}
      </span>
    </div>
  );
}

