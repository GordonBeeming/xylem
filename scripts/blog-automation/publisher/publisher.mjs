import { createHash, randomUUID } from "node:crypto";
import {
  chmodSync,
  closeSync,
  constants,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { hostname } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";
import yaml from "js-yaml";

export const DEFAULT_STATE_DIR =
  "/Users/gordonbeeming/Library/Application Support/Xylem Blog Automation";
export const QUEUE_FILENAME = "queue.yaml";
export const TRANSACTION_FILENAME = "publisher-transaction.json";
export const LOCK_FILENAME = "publisher.lock";
export const TIMEZONE = "Australia/Brisbane";

const QUEUE_KEYS = new Set([
  "version",
  "timezone",
  "publishEveryDays",
  "nextPublishOn",
  "posts",
]);
const DRAFT_PATH = /^content\/blog-drafts\/([a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?)\/post\.mdx$/;
const ASSET_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,149}$/;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const SHA = /^[0-9a-f]{7,64}$/i;
const MAX_LOCK_AGE_MS = 6 * 60 * 60 * 1000;

export class PublisherError extends Error {
  constructor(message, code = "publisher_error") {
    super(message);
    this.name = "PublisherError";
    this.code = code;
  }
}

function assert(condition, message, code = "validation_error") {
  if (!condition) throw new PublisherError(message, code);
}

function assertPlainObject(value, name) {
  assert(
    value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.getPrototypeOf(value) === Object.prototype,
    `${name} must be an object`,
    "invalid_schema",
  );
}

export function validateDate(value, name = "date") {
  assert(typeof value === "string" && DATE.test(value), `${name} must use YYYY-MM-DD`, "invalid_date");
  const [, year, month, day] = DATE.exec(value);
  const instant = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  assert(
    instant.getUTCFullYear() === Number(year) &&
      instant.getUTCMonth() === Number(month) - 1 &&
      instant.getUTCDate() === Number(day),
    `${name} is not a calendar date`,
    "invalid_date",
  );
  return value;
}

export function addDays(date, days) {
  validateDate(date);
  const [year, month, day] = date.split("-").map(Number);
  const instant = new Date(Date.UTC(year, month - 1, day));
  instant.setUTCDate(instant.getUTCDate() + days);
  return instant.toISOString().slice(0, 10);
}

export function validateDraftPath(value) {
  assert(typeof value === "string", "Post path must be a string", "invalid_post_path");
  assert(!value.includes("\\") && !path.posix.isAbsolute(value), "Post path must be repository-relative", "invalid_post_path");
  const match = DRAFT_PATH.exec(value);
  assert(match, "Post path must match content/blog-drafts/<safe-slug>/post.mdx", "invalid_post_path");
  return { postPath: value, slug: match[1] };
}

export function validateQueue(value) {
  assertPlainObject(value, "Queue");
  const unknown = Object.keys(value).filter((key) => !QUEUE_KEYS.has(key));
  assert(unknown.length === 0, `Queue has unknown fields: ${unknown.join(", ")}`, "invalid_schema");
  assert(value.version === 1, "Queue version must be 1", "invalid_schema");
  assert(value.timezone === TIMEZONE, `Queue timezone must be ${TIMEZONE}`, "invalid_schema");
  assert(
    Number.isSafeInteger(value.publishEveryDays) && value.publishEveryDays >= 1 && value.publishEveryDays <= 365,
    "publishEveryDays must be an integer from 1 to 365",
    "invalid_schema",
  );
  validateDate(value.nextPublishOn, "nextPublishOn");
  assert(Array.isArray(value.posts), "Queue posts must be an array", "invalid_schema");
  const seen = new Set();
  for (const post of value.posts) {
    validateDraftPath(post);
    assert(!seen.has(post), `Queue contains duplicate post: ${post}`, "invalid_schema");
    seen.add(post);
  }
  return value;
}

function statePaths(stateDir) {
  return {
    queue: path.join(stateDir, QUEUE_FILENAME),
    transaction: path.join(stateDir, TRANSACTION_FILENAME),
    lock: path.join(stateDir, LOCK_FILENAME),
  };
}

function assertOwnerOnly(target, expectedType) {
  const info = lstatSync(target);
  assert(!info.isSymbolicLink(), `${target} must not be a symbolic link`, "unsafe_state_permissions");
  assert(
    expectedType === "directory" ? info.isDirectory() : info.isFile(),
    `${target} must be a ${expectedType}`,
    "unsafe_state_permissions",
  );
  if (typeof process.getuid === "function") {
    assert(info.uid === process.getuid(), `${target} must be owned by the current user`, "unsafe_state_permissions");
  }
  assert((info.mode & 0o077) === 0, `${target} must not be accessible by group or other users`, "unsafe_state_permissions");
}

export function ensureStateDirectory(stateDir) {
  assert(path.isAbsolute(stateDir), "State directory must be absolute", "invalid_state_dir");
  if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true, mode: 0o700 });
  chmodSync(stateDir, 0o700);
  assertOwnerOnly(stateDir, "directory");
}

function atomicWrite(target, data) {
  const directory = path.dirname(target);
  ensureStateDirectory(directory);
  const temporary = path.join(directory, `.${path.basename(target)}.${process.pid}.${randomUUID()}.tmp`);
  let descriptor;
  try {
    descriptor = openSync(temporary, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600);
    writeFileSync(descriptor, data, "utf8");
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;
    renameSync(temporary, target);
    chmodSync(target, 0o600);
    const directoryDescriptor = openSync(directory, constants.O_RDONLY);
    fsyncSync(directoryDescriptor);
    closeSync(directoryDescriptor);
  } catch (error) {
    if (descriptor !== undefined) closeSync(descriptor);
    if (existsSync(temporary)) unlinkSync(temporary);
    throw error;
  }
}

function queueYaml(queue) {
  return yaml.dump(queue, {
    noRefs: true,
    lineWidth: -1,
    quotingType: "'",
    forceQuotes: false,
    sortKeys: false,
  });
}

export function loadQueue(stateDir) {
  const { queue: queuePath } = statePaths(stateDir);
  assert(existsSync(queuePath), `Queue is not initialized at ${queuePath}`, "queue_not_initialized");
  assertOwnerOnly(queuePath, "file");
  let parsed;
  try {
    parsed = yaml.load(readFileSync(queuePath, "utf8"), { json: true });
  } catch (error) {
    throw new PublisherError(`Queue YAML is malformed: ${error.message}`, "invalid_schema");
  }
  return validateQueue(parsed);
}

function saveQueue(stateDir, queue) {
  atomicWrite(statePaths(stateDir).queue, queueYaml(validateQueue(queue)));
}

function readTransaction(stateDir) {
  const target = statePaths(stateDir).transaction;
  if (!existsSync(target)) return null;
  assertOwnerOnly(target, "file");
  let value;
  try {
    value = JSON.parse(readFileSync(target, "utf8"));
  } catch (error) {
    throw new PublisherError(`Transaction record is malformed: ${error.message}`, "invalid_transaction");
  }
  assertPlainObject(value, "Transaction");
  assert(value.version === 1, "Transaction version must be 1", "invalid_transaction");
  assert(["preparing", "prepared", "finalized"].includes(value.status), "Transaction status is invalid", "invalid_transaction");
  validateDraftPath(value.source);
  validateDate(value.publicationDate, "transaction publicationDate");
  assert(typeof value.marker === "string" && value.marker.startsWith("xylem-blog-publication:"), "Transaction marker is invalid", "invalid_transaction");
  return value;
}

function saveTransaction(stateDir, transaction) {
  atomicWrite(statePaths(stateDir).transaction, `${JSON.stringify(transaction, null, 2)}\n`);
}

function isProcessAlive(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}

function staleLock(lockPath) {
  try {
    assertOwnerOnly(lockPath, "file");
    const lock = JSON.parse(readFileSync(lockPath, "utf8"));
    const started = Date.parse(lock.startedAt);
    if (!Number.isFinite(started)) return true;
    if (Date.now() - started > MAX_LOCK_AGE_MS) return true;
    return lock.hostname === hostname() && !isProcessAlive(lock.pid);
  } catch {
    return true;
  }
}

export function withRunLock(stateDir, operation) {
  ensureStateDirectory(stateDir);
  const lockPath = statePaths(stateDir).lock;
  const token = randomUUID();
  const record = { version: 1, token, pid: process.pid, hostname: hostname(), startedAt: new Date().toISOString() };
  let acquired = false;
  for (let attempt = 0; attempt < 2 && !acquired; attempt += 1) {
    try {
      const descriptor = openSync(lockPath, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600);
      writeFileSync(descriptor, `${JSON.stringify(record)}\n`, "utf8");
      fsyncSync(descriptor);
      closeSync(descriptor);
      acquired = true;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      if (!staleLock(lockPath)) throw new PublisherError("Another publisher command is running", "publisher_locked");
      unlinkSync(lockPath);
    }
  }
  assert(acquired, "Could not acquire publisher lock", "publisher_locked");
  try {
    return operation();
  } finally {
    try {
      const current = JSON.parse(readFileSync(lockPath, "utf8"));
      if (current.token === token) unlinkSync(lockPath);
    } catch {
      // A missing or replaced lock is safer to leave alone.
    }
  }
}

export function initializeQueue(stateDir, { nextPublishOn, publishEveryDays = 2 }) {
  validateDate(nextPublishOn, "nextPublishOn");
  const cadence = Number(publishEveryDays);
  const target = statePaths(stateDir).queue;
  assert(!existsSync(target), `Queue already exists at ${target}`, "queue_exists");
  const queue = validateQueue({
    version: 1,
    timezone: TIMEZONE,
    publishEveryDays: cadence,
    nextPublishOn,
    posts: [],
  });
  saveQueue(stateDir, queue);
  return { ok: true, outcome: "initialized", queue };
}

export function listQueue(stateDir) {
  return { ok: true, outcome: "listed", queue: loadQueue(stateDir) };
}

export function addPost(stateDir, postPath) {
  validateDraftPath(postPath);
  const queue = loadQueue(stateDir);
  assert(!queue.posts.includes(postPath), `Post is already queued: ${postPath}`, "duplicate_post");
  queue.posts.push(postPath);
  saveQueue(stateDir, queue);
  return { ok: true, outcome: "added", post: postPath, position: queue.posts.length, queue };
}

export function removePost(stateDir, postPath) {
  validateDraftPath(postPath);
  const queue = loadQueue(stateDir);
  const index = queue.posts.indexOf(postPath);
  assert(index !== -1, `Post is not queued: ${postPath}`, "post_not_queued");
  queue.posts.splice(index, 1);
  saveQueue(stateDir, queue);
  return { ok: true, outcome: "removed", post: postPath, queue };
}

export function movePost(stateDir, postPath, position) {
  validateDraftPath(postPath);
  const target = Number(position);
  const queue = loadQueue(stateDir);
  assert(Number.isSafeInteger(target) && target >= 1 && target <= queue.posts.length, "Move position must be within the queue (1-based)", "invalid_position");
  const current = queue.posts.indexOf(postPath);
  assert(current !== -1, `Post is not queued: ${postPath}`, "post_not_queued");
  queue.posts.splice(current, 1);
  queue.posts.splice(target - 1, 0, postPath);
  saveQueue(stateDir, queue);
  return { ok: true, outcome: "moved", post: postPath, position: target, queue };
}

export function setCadence(stateDir, days) {
  const cadence = Number(days);
  assert(Number.isSafeInteger(cadence) && cadence >= 1 && cadence <= 365, "Cadence must be an integer from 1 to 365", "invalid_cadence");
  const queue = loadQueue(stateDir);
  const previousNextPublishOn = queue.nextPublishOn;
  queue.publishEveryDays = cadence;
  saveQueue(stateDir, queue);
  return {
    ok: true,
    outcome: "cadence-updated",
    publishEveryDays: cadence,
    nextPublishOn: queue.nextPublishOn,
    nextPublishOnUnchanged: queue.nextPublishOn === previousNextPublishOn,
    queue,
  };
}

export function status(stateDir, date) {
  validateDate(date);
  const queue = loadQueue(stateDir);
  if (queue.posts.length === 0) {
    return { ok: true, outcome: "noop", reason: "empty-queue", date, nextPublishOn: queue.nextPublishOn };
  }
  if (date < queue.nextPublishOn) {
    return {
      ok: true,
      outcome: "noop",
      reason: "not-due",
      date,
      nextPublishOn: queue.nextPublishOn,
      head: queue.posts[0],
    };
  }
  return {
    ok: true,
    outcome: "action",
    action: "publish",
    date,
    nextPublishOn: queue.nextPublishOn,
    head: queue.posts[0],
  };
}

function assertRepository(repo) {
  assert(typeof repo === "string" && path.isAbsolute(repo), "Repository path must be absolute", "invalid_repo");
  const info = statSync(repo);
  assert(info.isDirectory(), "Repository path must be a directory", "invalid_repo");
  try {
    const root = execFileSync(process.env.XYLEM_BLOG_PUBLISHER_GIT ?? "git", ["-C", repo, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
    assert(path.resolve(root) === path.resolve(repo), "--repo must point to the repository root", "invalid_repo");
  } catch (error) {
    if (error instanceof PublisherError) throw error;
    throw new PublisherError("Repository is not a Git worktree", "invalid_repo");
  }
}

function assertCleanRepository(repo) {
  let output;
  try {
    output = execFileSync(
      process.env.XYLEM_BLOG_PUBLISHER_GIT ?? "git",
      ["-C", repo, "status", "--porcelain=v1", "--untracked-files=all"],
      { encoding: "utf8" },
    );
  } catch {
    throw new PublisherError("Could not inspect publication worktree status", "git_status_failed");
  }
  assert(output.trim() === "", `Publication worktree is dirty:\n${output.trim()}`, "dirty_repository");
}

function listFilesRecursively(directory) {
  if (!existsSync(directory)) return [];
  const results = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    const info = lstatSync(fullPath);
    assert(!info.isSymbolicLink(), `Draft bundle contains a symbolic link: ${fullPath}`, "invalid_bundle");
    if (entry.isDirectory()) results.push(...listFilesRecursively(fullPath));
    else if (entry.isFile()) results.push(fullPath);
    else throw new PublisherError(`Draft bundle contains an unsupported entry: ${fullPath}`, "invalid_bundle");
  }
  return results;
}

function validateFrontmatter(raw, requestedDate) {
  assert(matter.test(raw), "Draft must contain YAML frontmatter", "invalid_frontmatter");
  let parsed;
  try {
    parsed = matter(raw);
  } catch (error) {
    throw new PublisherError(`Draft frontmatter is malformed: ${error.message}`, "invalid_frontmatter");
  }
  const { data } = parsed;
  assert(typeof data.title === "string" && data.title.trim() !== "", "Draft frontmatter requires a title", "invalid_frontmatter");
  assert(typeof data.summary === "string" && data.summary.trim() !== "", "Draft frontmatter requires a summary", "invalid_frontmatter");
  assert(Array.isArray(data.tags) && data.tags.every((tag) => typeof tag === "string" && tag.trim() !== ""), "Draft frontmatter tags must be an array of strings", "invalid_frontmatter");
  if (data.date !== undefined) {
    const existing = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);
    validateDate(existing, "draft date");
    assert(existing === requestedDate, `Draft date ${existing} conflicts with publication date ${requestedDate}`, "date_conflict");
  }
}

function setFrontmatterDate(raw, requestedDate) {
  const lines = raw.split("\n");
  assert(lines[0].trim() === "---", "Draft frontmatter must start on the first line", "invalid_frontmatter");
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  assert(end !== -1, "Draft frontmatter has no closing delimiter", "invalid_frontmatter");
  const dateLine = lines.findIndex((line, index) => index > 0 && index < end && /^date\s*:/.test(line));
  if (dateLine !== -1) lines[dateLine] = `date: ${requestedDate}`;
  else {
    const titleLine = lines.findIndex((line, index) => index > 0 && index < end && /^title\s*:/.test(line));
    lines.splice(titleLine === -1 ? end : titleLine + 1, 0, `date: ${requestedDate}`);
  }
  return lines.join("\n");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rewriteLocalImageReferences(raw, assetNames) {
  let result = raw;
  for (const name of assetNames) {
    const escaped = escapeRegExp(name);
    result = result.replace(new RegExp(`(src|key)=(['\"])(?:\\./)?images/${escaped}\\2`, "g"), `$1=$2/images/${name}$2`);
    result = result.replace(new RegExp(`(!?\\[[^\\]]*\\]\\()(?:\\./)?images/${escaped}(?=[\\s)])`, "g"), `$1/images/${name}`);
  }
  return result;
}

function hashQueue(queue) {
  return createHash("sha256").update(JSON.stringify(queue)).digest("hex");
}

function hasSamePublishedPosition(actual, expected) {
  return (
    actual.version === expected.version &&
    actual.timezone === expected.timezone &&
    actual.nextPublishOn === expected.nextPublishOn &&
    JSON.stringify(actual.posts) === JSON.stringify(expected.posts)
  );
}

function stableMarker(source, destination) {
  const digest = createHash("sha256").update(`${source}\0${destination}`).digest("hex");
  return `xylem-blog-publication:${digest}`;
}

function expectedQueueAfterFinalize(queue, publicationDate) {
  return validateQueue({
    ...queue,
    nextPublishOn: addDays(publicationDate, queue.publishEveryDays),
    posts: queue.posts.slice(1),
  });
}

function filesWithBasename(directory, basename) {
  if (!existsSync(directory)) return [];
  return listFilesRecursively(directory).filter((file) => path.basename(file) === basename);
}

function removeEmptyParents(directory, stopAt) {
  let current = directory;
  while (current.startsWith(stopAt) && current !== stopAt) {
    if (!existsSync(current) || readdirSync(current).length !== 0) break;
    rmdirSync(current);
    current = path.dirname(current);
  }
}

export function prepare(stateDir, { date, repo }) {
  validateDate(date);
  assertRepository(repo);
  const queue = loadQueue(stateDir);
  assert(queue.posts.length > 0, "Cannot prepare from an empty queue", "empty_queue");
  assert(date >= queue.nextPublishOn, `Queue is not due until ${queue.nextPublishOn}`, "not_due");

  const source = queue.posts[0];
  const { slug } = validateDraftPath(source);
  const destination = `content/blog/${date}/${slug}.mdx`;
  const expectedPublicUrl = `https://gordonbeeming.com/blog/${date}/${slug}`;
  const existingTransaction = readTransaction(stateDir);
  if (existingTransaction) {
    const matches =
      existingTransaction.source === source &&
      existingTransaction.destination === destination &&
      existingTransaction.publicationDate === date;
    if (matches && existingTransaction.status === "prepared") {
      const destinationExists = existsSync(path.join(repo, ...destination.split("/")));
      const sourceExists = existsSync(path.join(repo, ...source.split("/")));
      const assetsExist = existingTransaction.assetPaths.every((asset) =>
        existsSync(path.join(repo, ...asset.destination.split("/"))),
      );
      assert(destinationExists && !sourceExists && assetsExist, "Prepared transaction files do not match its record", "incomplete_transaction");
      return { ok: true, outcome: "already-prepared", transaction: existingTransaction };
    }
    if (existingTransaction.status === "finalized" && existingTransaction.queueApplied) {
      const expected = expectedQueueAfterFinalize(
        existingTransaction.queueAtFinalize,
        existingTransaction.successfulPublicationDate,
      );
      assert(hasSamePublishedPosition(queue, expected), "Finalized transaction does not match the current queue", "queue_head_changed");
    } else {
      assert(matches, "An existing publisher transaction does not match the queue head", "transaction_mismatch");
      throw new PublisherError("An interrupted preparing transaction requires manual inspection", "incomplete_transaction");
    }
  }

  assertCleanRepository(repo);
  const sourceAbsolute = path.join(repo, ...source.split("/"));
  const bundle = path.dirname(sourceAbsolute);
  assert(existsSync(sourceAbsolute), `Queued draft is missing: ${source}`, "missing_draft");
  const bundleFiles = listFilesRecursively(bundle);
  const mdxFiles = bundleFiles.filter((file) => /\.mdx$/i.test(file));
  assert(mdxFiles.length === 1, `Draft bundle must contain exactly one MDX file; found ${mdxFiles.length}`, "invalid_bundle");
  assert(path.resolve(mdxFiles[0]) === path.resolve(sourceAbsolute), "The bundle MDX must be post.mdx", "invalid_bundle");

  const imagesDirectory = path.join(bundle, "images");
  const assetFiles = existsSync(imagesDirectory) ? listFilesRecursively(imagesDirectory) : [];
  for (const asset of assetFiles) {
    assert(path.dirname(asset) === imagesDirectory, "Draft images must be files directly inside the images directory", "invalid_bundle");
  }
  const allowed = new Set([sourceAbsolute, ...assetFiles]);
  const unexpected = bundleFiles.filter((file) => !allowed.has(file));
  assert(unexpected.length === 0, `Draft bundle contains unexpected files: ${unexpected.map((file) => path.relative(repo, file)).join(", ")}`, "invalid_bundle");

  const destinationAbsolute = path.join(repo, ...destination.split("/"));
  assert(!existsSync(destinationAbsolute), `Post destination already exists: ${destination}`, "destination_collision");
  const raw = readFileSync(sourceAbsolute, "utf8");
  validateFrontmatter(raw, date);

  const assetMoves = assetFiles.map((sourceAsset) => {
    const name = path.basename(sourceAsset);
    assert(ASSET_NAME.test(name) && name !== "." && name !== "..", `Draft image has an unsafe filename: ${name}`, "invalid_bundle");
    const destinationAsset = path.join(repo, "content", "blog", date, "images", name);
    const collisions = filesWithBasename(path.join(repo, "content", "blog"), name).filter(
      (candidate) => !candidate.startsWith(bundle + path.sep),
    );
    assert(!existsSync(destinationAsset) && collisions.length === 0, `Image destination collides for ${name}`, "asset_collision");
    return {
      source: path.relative(repo, sourceAsset).split(path.sep).join("/"),
      destination: path.relative(repo, destinationAsset).split(path.sep).join("/"),
      publicPath: `/images/${name}`,
      sourceAbsolute: sourceAsset,
      destinationAbsolute: destinationAsset,
    };
  });

  let transformed = setFrontmatterDate(raw, date);
  transformed = rewriteLocalImageReferences(transformed, assetMoves.map((asset) => path.basename(asset.sourceAbsolute)));
  const transaction = {
    version: 1,
    status: "preparing",
    marker: stableMarker(source, destination),
    publicationDate: date,
    source,
    destination,
    expectedPublicUrl,
    assetPaths: assetMoves.map(({ source: assetSource, destination: assetDestination, publicPath }) => ({
      source: assetSource,
      destination: assetDestination,
      publicPath,
    })),
    queueAtPrepare: queue,
    queueHashAtPrepare: hashQueue(queue),
    preparedAt: new Date().toISOString(),
  };
  saveTransaction(stateDir, transaction);

  const moved = [];
  try {
    mkdirSync(path.dirname(destinationAbsolute), { recursive: true });
    renameSync(sourceAbsolute, destinationAbsolute);
    moved.push({ from: sourceAbsolute, to: destinationAbsolute });
    if (assetMoves.length > 0) mkdirSync(path.dirname(assetMoves[0].destinationAbsolute), { recursive: true });
    for (const asset of assetMoves) {
      renameSync(asset.sourceAbsolute, asset.destinationAbsolute);
      moved.push({ from: asset.sourceAbsolute, to: asset.destinationAbsolute });
    }
    writeFileSync(destinationAbsolute, transformed, "utf8");
    if (existsSync(imagesDirectory) && readdirSync(imagesDirectory).length === 0) rmdirSync(imagesDirectory);
    removeEmptyParents(bundle, path.join(repo, "content", "blog-drafts"));
    transaction.status = "prepared";
    saveTransaction(stateDir, transaction);
  } catch (error) {
    let rolledBack = true;
    for (const move of moved.reverse()) {
      if (existsSync(move.to)) {
        try {
          mkdirSync(path.dirname(move.from), { recursive: true });
          renameSync(move.to, move.from);
        } catch {
          rolledBack = false;
        }
      }
    }
    if (rolledBack && existsSync(sourceAbsolute)) {
      writeFileSync(sourceAbsolute, raw, "utf8");
      unlinkSync(statePaths(stateDir).transaction);
    }
    throw error;
  }
  return { ok: true, outcome: "prepared", transaction };
}

function applyFinalizedQueue(stateDir, transaction, queue) {
  const original = transaction.queueAtFinalize;
  validateQueue(original);
  const expected = expectedQueueAfterFinalize(original, transaction.successfulPublicationDate);
  const currentHash = hashQueue(queue);
  if (currentHash === transaction.queueHashAtFinalize) {
    saveQueue(stateDir, expected);
  } else {
    assert(hashQueue(expected) === currentHash, "Queue changed after publication was prepared", "queue_head_changed");
  }
  transaction.queueApplied = true;
  transaction.nextPublishOn = expected.nextPublishOn;
  saveTransaction(stateDir, transaction);
  return expected;
}

export function finalize(stateDir, { date, mergeSha, liveUrl }) {
  validateDate(date);
  assert(typeof mergeSha === "string" && SHA.test(mergeSha), "merge-sha must be a hexadecimal Git SHA", "invalid_merge_sha");
  assert(typeof liveUrl === "string" && URL.canParse(liveUrl), "live-url must be an absolute URL", "invalid_live_url");
  const transaction = readTransaction(stateDir);
  assert(transaction, "No publisher transaction exists", "missing_transaction");
  assert(transaction.status !== "preparing", "Publisher transaction is incomplete", "incomplete_transaction");
  assert(date >= transaction.publicationDate, "Successful publication date cannot be before the prepared post date", "transaction_mismatch");
  assert(transaction.expectedPublicUrl === liveUrl, "Live URL does not match the expected public URL", "transaction_mismatch");
  const queue = loadQueue(stateDir);

  if (transaction.status === "finalized") {
    assert(
      transaction.mergeSha === mergeSha &&
        transaction.liveUrl === liveUrl &&
        transaction.successfulPublicationDate === date,
      "Finalize arguments do not match the completed transaction",
      "transaction_mismatch",
    );
    let appliedQueue;
    if (transaction.queueApplied) {
      const expected = expectedQueueAfterFinalize(
        transaction.queueAtFinalize,
        transaction.successfulPublicationDate,
      );
      assert(hasSamePublishedPosition(queue, expected), "Finalized transaction does not match the current queue", "queue_head_changed");
      appliedQueue = queue;
    } else {
      appliedQueue = applyFinalizedQueue(stateDir, transaction, queue);
    }
    return { ok: true, outcome: "already-finalized", transaction, queue: appliedQueue };
  }

  assert(queue.posts[0] === transaction.source, "Queue head changed after publication was prepared", "queue_head_changed");
  assert(
    queue.nextPublishOn === transaction.queueAtPrepare.nextPublishOn &&
      JSON.stringify(queue.posts) === JSON.stringify(transaction.queueAtPrepare.posts),
    "Queue order or due date changed after publication was prepared",
    "queue_head_changed",
  );
  transaction.queueAtFinalize = queue;
  transaction.queueHashAtFinalize = hashQueue(queue);
  transaction.status = "finalized";
  transaction.mergeSha = mergeSha;
  transaction.liveUrl = liveUrl;
  transaction.successfulPublicationDate = date;
  transaction.finalizedAt = new Date().toISOString();
  transaction.queueApplied = false;
  saveTransaction(stateDir, transaction);
  const appliedQueue = applyFinalizedQueue(stateDir, transaction, queue);
  return { ok: true, outcome: "finalized", transaction, queue: appliedQueue };
}

export function reconcile(stateDir) {
  const transaction = readTransaction(stateDir);
  if (!transaction) return { ok: true, outcome: "noop", reason: "no-transaction" };
  if (transaction.status === "preparing") {
    throw new PublisherError("Preparing transaction is incomplete and requires manual inspection", "incomplete_transaction");
  }
  if (transaction.status === "prepared") {
    return {
      ok: true,
      outcome: "noop",
      reason: "awaiting-live-finalize",
      marker: transaction.marker,
      expectedPublicUrl: transaction.expectedPublicUrl,
      transaction,
    };
  }
  const queue = loadQueue(stateDir);
  if (!transaction.queueApplied) {
    const appliedQueue = applyFinalizedQueue(stateDir, transaction, queue);
    return { ok: true, outcome: "reconciled", transaction, queue: appliedQueue };
  }
  const expected = expectedQueueAfterFinalize(
    transaction.queueAtFinalize,
    transaction.successfulPublicationDate,
  );
  assert(hasSamePublishedPosition(queue, expected), "Finalized transaction does not match the current queue", "queue_head_changed");
  return { ok: true, outcome: "noop", reason: "already-finalized", transaction, queue };
}
