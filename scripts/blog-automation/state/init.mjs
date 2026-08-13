import { chmod, lstat, mkdir, open, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_STATE_DIR =
  "/Users/gordonbeeming/Library/Application Support/Xylem Blog Automation";

export const STATE_PATHS = Object.freeze({
  queue: "queue.yaml",
  scout: "scout-state.json",
  runs: "runs",
  archive: "archive",
  ideas: "ideas",
  locks: "locks",
});

const STATE_DIRECTORY_MODE = 0o700;
const STATE_FILE_MODE = 0o600;
const DEFAULT_CADENCE_DAYS = 2;
const QUEUE_KEYS = new Set([
  "version",
  "timezone",
  "publishEveryDays",
  "nextPublishOn",
  "posts",
]);
const SCOUT_KEYS = new Set([
  "version",
  "timezone",
  "lastSuccessfulCutoff",
  "nextNominalThursday",
  "activeRun",
]);

function brisbaneDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Brisbane",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function initialQueue(now = new Date()) {
  return {
    version: 1,
    timezone: "Australia/Brisbane",
    publishEveryDays: DEFAULT_CADENCE_DAYS,
    nextPublishOn: brisbaneDate(now),
    posts: [],
  };
}

function nextThursday(dateText) {
  const noonUtc = new Date(`${dateText}T02:00:00.000Z`);
  const daysUntilThursday = (4 - noonUtc.getUTCDay() + 7) % 7;
  noonUtc.setUTCDate(noonUtc.getUTCDate() + daysUntilThursday);
  return noonUtc.toISOString().slice(0, 10);
}

export function initialScoutState(now = new Date()) {
  return {
    version: 1,
    timezone: "Australia/Brisbane",
    lastSuccessfulCutoff: null,
    nextNominalThursday: nextThursday(brisbaneDate(now)),
    activeRun: null,
  };
}

function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return false;
  const [year, month, day] = value.split("-").map(Number);
  const instant = new Date(Date.UTC(year, month - 1, day));
  return (
    instant.getUTCFullYear() === year &&
    instant.getUTCMonth() === month - 1 &&
    instant.getUTCDate() === day
  );
}

function hasOnlyKeys(value, allowedKeys) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).every((key) => allowedKeys.has(key)) &&
    Object.keys(value).length === allowedKeys.size
  );
}

function isSafeRunId(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 200 &&
    value !== "." &&
    value !== ".." &&
    !value.includes("/") &&
    !value.includes("\\") &&
    !value.includes("\0")
  );
}

export function validateQueue(queue) {
  if (
    !hasOnlyKeys(queue, QUEUE_KEYS) ||
    queue?.version !== 1 ||
    queue.timezone !== "Australia/Brisbane" ||
    !Number.isInteger(queue.publishEveryDays) ||
    queue.publishEveryDays < 1 ||
    queue.publishEveryDays > 365 ||
    !isCalendarDate(queue.nextPublishOn) ||
    !Array.isArray(queue.posts) ||
    !queue.posts.every(
      (post) =>
        typeof post === "string" &&
        /^content\/blog-drafts\/[a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?\/post\.mdx$/.test(post),
    ) ||
    new Set(queue.posts).size !== queue.posts.length
  ) {
    throw new Error("The publication queue does not match version 1 of the queue schema");
  }

  return queue;
}

export function parseQueueYaml(source) {
  const queue = { posts: [] };
  let readingPosts = false;

  for (const rawLine of source.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    if (line === "posts:" || line === "posts: []") {
      readingPosts = line === "posts:";
      continue;
    }

    if (readingPosts && line.startsWith("- ")) {
      queue.posts.push(line.slice(2).trim().replace(/^['"]|['"]$/g, ""));
      continue;
    }

    readingPosts = false;
    const separator = line.indexOf(":");
    if (separator === -1) throw new Error("The publication queue is not valid YAML");

    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (key === "version" || key === "publishEveryDays") queue[key] = Number(value);
    else if (key === "timezone" || key === "nextPublishOn") queue[key] = value;
    else throw new Error(`The publication queue contains an unknown field: ${key}`);
  }

  return validateQueue(queue);
}

export function validateScoutState(state) {
  if (
    !hasOnlyKeys(state, SCOUT_KEYS) ||
    state?.version !== 1 ||
    state.timezone !== "Australia/Brisbane" ||
    !isCalendarDate(state.nextNominalThursday) ||
    !(
      state.lastSuccessfulCutoff === null ||
      Number.isFinite(Date.parse(state.lastSuccessfulCutoff))
    ) ||
    !(state.activeRun === null || isSafeRunId(state.activeRun))
  ) {
    throw new Error("The scout state does not match version 1 of the state schema");
  }

  return state;
}

function queueYaml(queue) {
  validateQueue(queue);
  return [
    `version: ${queue.version}`,
    `timezone: ${queue.timezone}`,
    `publishEveryDays: ${queue.publishEveryDays}`,
    `nextPublishOn: '${queue.nextPublishOn}'`,
    "posts: []",
    "",
  ].join("\n");
}

async function createFileWithoutOverwrite(filePath, content) {
  let handle;
  try {
    handle = await open(filePath, "wx", STATE_FILE_MODE);
    await handle.writeFile(content, "utf8");
    await handle.sync();
    return true;
  } catch (error) {
    if (error?.code === "EEXIST") return false;
    throw error;
  } finally {
    await handle?.close();
  }
}

async function enforceOwnerOnly(target, expectedType, mode) {
  const info = await lstat(target);
  if (info.isSymbolicLink()) throw new Error(`${target} must not be a symbolic link`);
  if (expectedType === "directory" ? !info.isDirectory() : !info.isFile()) {
    throw new Error(`${target} must be a ${expectedType}`);
  }
  if (typeof process.getuid === "function" && info.uid !== process.getuid()) {
    throw new Error(`${target} must be owned by the current user`);
  }
  await chmod(target, mode);
}

export async function initializeState({ stateDir = DEFAULT_STATE_DIR, now = new Date() } = {}) {
  if (!path.isAbsolute(stateDir)) throw new Error("The state directory must be absolute");
  await mkdir(stateDir, { recursive: true, mode: STATE_DIRECTORY_MODE });
  await enforceOwnerOnly(stateDir, "directory", STATE_DIRECTORY_MODE);

  for (const directory of [
    STATE_PATHS.runs,
    STATE_PATHS.archive,
    STATE_PATHS.ideas,
    STATE_PATHS.locks,
  ]) {
    const directoryPath = path.join(stateDir, directory);
    await mkdir(directoryPath, { recursive: true, mode: STATE_DIRECTORY_MODE });
    await enforceOwnerOnly(directoryPath, "directory", STATE_DIRECTORY_MODE);
  }

  const queuePath = path.join(stateDir, STATE_PATHS.queue);
  const scoutPath = path.join(stateDir, STATE_PATHS.scout);
  const queue = initialQueue(now);
  const scout = initialScoutState(now);

  const queueCreated = await createFileWithoutOverwrite(queuePath, queueYaml(queue));
  const scoutCreated = await createFileWithoutOverwrite(
    scoutPath,
    `${JSON.stringify(scout, null, 2)}\n`,
  );

  await enforceOwnerOnly(queuePath, "file", STATE_FILE_MODE);
  await enforceOwnerOnly(scoutPath, "file", STATE_FILE_MODE);
  if (!queueCreated) parseQueueYaml(await readFile(queuePath, "utf8"));
  if (!scoutCreated) validateScoutState(JSON.parse(await readFile(scoutPath, "utf8")));

  return {
    stateDir,
    queuePath,
    scoutPath,
    queueCreated,
    scoutCreated,
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

  if (Number.isNaN(now.getTime())) {
    throw new Error("--now must be a valid ISO-8601 timestamp");
  }

  const result = await initializeState({ stateDir, now });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
