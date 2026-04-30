import { useState, type ReactNode } from "react";
import { KeyRound, ShieldAlert } from "lucide-react";
import { Button } from "../../../components/ui/Button";

// SHA-256 hash of the secret key.
// Generate your hash by running this in the browser console:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-secret-key'))
//     .then(b => console.log(Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join('')))
// Then paste the result below.
const SECRET_HASH =
  "890d961cde23587c81193c0ae79006f3ecf7aeedf2251a773788638c7ab32e27";

const SESSION_KEY = "branding_gate_unlocked";

async function sha256(text: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function BrandingGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1",
  );
  const [key, setKey] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  if (unlocked) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(false);
    const hash = await sha256(key);
    if (hash === SECRET_HASH) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
      setKey("");
    }
    setChecking(false);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10">
            <KeyRound className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Restricted Access
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter the secret key to continue.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setError(false);
            }}
            placeholder="Secret key"
            autoFocus
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
          />

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-700">
                Incorrect key. Access denied.
              </p>
            </div>
          )}

          <Button
            type="submit"
            loading={checking}
            disabled={!key}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
          >
            Unlock
          </Button>
        </form>
      </div>
    </div>
  );
}
