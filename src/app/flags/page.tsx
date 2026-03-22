"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { useFeatureFlags } from "@/components/FeatureFlagProvider";

function FlagsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { flags, setFlag, mounted } = useFeatureFlags();
  const [copied, setCopied] = useState(false);

  // Auto-set flags from URL params and redirect
  useEffect(() => {
    if (!mounted) return;

    const flagKeys = FEATURE_FLAGS.map((f) => f.key);
    const paramsToSet: Array<{ key: string; value: boolean }> = [];

    for (const key of flagKeys) {
      const paramValue = searchParams.get(key);
      if (paramValue !== null) {
        paramsToSet.push({ key, value: paramValue === "true" });
      }
    }

    if (paramsToSet.length > 0) {
      for (const { key, value } of paramsToSet) {
        setFlag(key, value);
      }
      router.replace("/");
    }
  }, [mounted, searchParams, setFlag, router]);

  const generateLink = useCallback(() => {
    const enabledFlags = FEATURE_FLAGS.filter((f) => flags[f.key]);
    if (enabledFlags.length === 0) return `${window.location.origin}/flags`;
    const params = enabledFlags.map((f) => `${f.key}=true`).join("&");
    return `${window.location.origin}/flags?${params}`;
  }, [flags]);

  const handleCopyLink = useCallback(async () => {
    const link = generateLink();
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generateLink]);

  // Check if we have URL params that will trigger redirect
  const hasUrlParams = FEATURE_FLAGS.some(
    (f) => searchParams.get(f.key) !== null
  );

  if (!mounted || hasUrlParams) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-[var(--color-text-secondary)]">Loading flags...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
        Feature Flags
      </h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">
        Toggle experimental features. These settings are stored in your browser.
      </p>

      <div className="space-y-4">
        {FEATURE_FLAGS.map((flag) => (
          <div
            key={flag.key}
            className="flex items-center justify-between rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-secondary)] p-4"
          >
            <div>
              <h2 className="font-semibold text-[var(--color-text-primary)]">
                {flag.key}
              </h2>
              <p className="text-sm text-[var(--color-text-tertiary)]">
                {flag.description}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={flags[flag.key] ?? flag.defaultValue}
              onClick={() => setFlag(flag.key, !(flags[flag.key] ?? flag.defaultValue))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-interactive-focus)] focus-visible:ring-offset-2 ${
                flags[flag.key]
                  ? "bg-[var(--color-interactive-default)]"
                  : "bg-[var(--color-border-strong)]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  flags[flag.key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Copy Link */}
      <div className="mt-8 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-secondary)] p-4">
        <h2 className="mb-2 font-semibold text-[var(--color-text-primary)]">
          Share Configuration
        </h2>
        <p className="mb-3 text-sm text-[var(--color-text-tertiary)]">
          Copy a link that applies your current flags when opened.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={mounted ? generateLink() : ""}
            className="flex-1 rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-md bg-[var(--color-interactive-default)] px-4 py-2 text-sm font-medium text-[var(--color-text-on-primary)] transition-colors hover:bg-[var(--color-interactive-hover)]"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FlagsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <p className="text-[var(--color-text-secondary)]">Loading flags...</p>
        </div>
      }
    >
      <FlagsContent />
    </Suspense>
  );
}
