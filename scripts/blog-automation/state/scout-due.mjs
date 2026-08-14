import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_STATE_DIR, STATE_PATHS, validateScoutState } from "./init.mjs";

function brisbaneParts(now) {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function brisbaneDate(now = new Date()) {
  const parts = brisbaneParts(now);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function scoutDue(state, now = new Date(), stateDir = DEFAULT_STATE_DIR) {
  validateScoutState(state);

  if (state.activeRun) {
    const runDirectory = path.join(stateDir, STATE_PATHS.runs, state.activeRun);
    const archiveDirectory = path.join(stateDir, STATE_PATHS.archive, state.activeRun);
    return {
      due: true,
      reason: "active-run",
      activeRun: state.activeRun,
      runDirectory: existsSync(runDirectory) || !existsSync(archiveDirectory) ? runDirectory : archiveDirectory,
    };
  }

  return {
    due: brisbaneDate(now) >= state.nextNominalThursday,
    reason: "persisted-date",
    nextNominalThursday: state.nextNominalThursday,
  };
}

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const stateDir = argumentValue("--state-dir") ?? DEFAULT_STATE_DIR;
  const nowText = argumentValue("--now");
  const now = nowText ? new Date(nowText) : new Date();
  if (Number.isNaN(now.getTime())) throw new Error("--now must be a valid ISO-8601 timestamp");

  const state = JSON.parse(await readFile(path.join(stateDir, STATE_PATHS.scout), "utf8"));
  process.stdout.write(`${JSON.stringify(scoutDue(state, now, stateDir))}\n`);
}
