export interface FeatureFlagDefinition {
  key: string;
  description: string;
  defaultValue: boolean;
  /** If true, the flag controls a CSS class on <html> that must be applied before hydration */
  cssClass?: string;
}

export const FEATURE_FLAGS: FeatureFlagDefinition[] = [
  {
    key: "edit-in-tina",
    description: "Show 'Edit in Tina' button on blog posts",
    defaultValue: false,
  },
  {
    key: "ssw-theme",
    description: "Apply SSW branded color theme",
    defaultValue: false,
    cssClass: "ssw-theme",
  },
];

export const FEATURE_FLAG_STORAGE_PREFIX = "ff:";

export function getStorageKey(flagKey: string): string {
  return `${FEATURE_FLAG_STORAGE_PREFIX}${flagKey}`;
}

export function readFlagFromStorage(flagKey: string): boolean | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(getStorageKey(flagKey));
  if (value === null) return null;
  return value === "true";
}

export function writeFlagToStorage(flagKey: string, value: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(flagKey), String(value));
}

export function getFlagDefault(flagKey: string): boolean {
  const flag = FEATURE_FLAGS.find((f) => f.key === flagKey);
  return flag?.defaultValue ?? false;
}
