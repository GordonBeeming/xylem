"use client";

import { useFeatureFlags } from "@/components/FeatureFlagProvider";
import { getFlagDefault } from "@/lib/feature-flags";

export function useFeatureFlag(key: string): boolean {
  const { flags, mounted } = useFeatureFlags();
  if (!mounted) return getFlagDefault(key);
  return flags[key] ?? getFlagDefault(key);
}
