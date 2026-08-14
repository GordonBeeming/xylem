import assert from "node:assert/strict";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { hostname, tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  PublisherError,
  addPost,
  finalize,
  initializeQueue,
  listQueue,
  loadQueue,
  movePost,
  prepare,
  reconcile,
  removePost,
  setCadence,
  status,
  withRunLock,
} from "../publisher/publisher.mjs";

const TEST_ROOT = mkdtempSync(path.join(tmpdir(), "xylem-publisher-test-"));
const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures", "publisher");
const ORIGINAL_GIT = process.env.XYLEM_BLOG_PUBLISHER_GIT;

function makeFakeGit() {
  const target = path.join(TEST_ROOT, "fake-git");
  writeFileSync(
    target,
    `#!/bin/sh
repo="$2"
case "$3 $4" in
  "rev-parse --show-toplevel") printf '%s\\n' "$repo" ;;
  "status --porcelain=v1")
    if [ -f "$repo/.publisher-dirty" ]; then printf '%s\\n' ' M unexpected-file.txt'; fi ;;
  *) exit 2 ;;
esac
`,
    { mode: 0o700 },
  );
  chmodSync(target, 0o700);
  return target;
}

before(() => {
  process.env.XYLEM_BLOG_PUBLISHER_GIT = makeFakeGit();
});

after(() => {
  if (ORIGINAL_GIT === undefined) delete process.env.XYLEM_BLOG_PUBLISHER_GIT;
  else process.env.XYLEM_BLOG_PUBLISHER_GIT = ORIGINAL_GIT;
});

function scenario() {
  const root = mkdtempSync(path.join(TEST_ROOT, "scenario-"));
  const repo = path.join(root, "repo");
  const stateDir = path.join(root, "state");
  mkdirSync(repo, { recursive: true });
  initializeQueue(stateDir, { nextPublishOn: "2026-08-14", publishEveryDays: 2 });
  return { root, repo, stateDir };
}

function addFixture(repo, slug = "queued-post", { withImage = true } = {}) {
  const destination = path.join(repo, "content", "blog-drafts", slug);
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(path.join(FIXTURES, "valid"), destination, { recursive: true });
  if (!withImage) {
    rmSync(path.join(destination, "images"), { recursive: true, force: true });
    const postPath = path.join(destination, "post.mdx");
    writeFileSync(postPath, readFileSync(postPath, "utf8").replace(/\n<Figure.*\n/, "\n"));
  }
  return `content/blog-drafts/${slug}/post.mdx`;
}

function expectPublisherError(callback, code) {
  assert.throws(callback, (error) => error instanceof PublisherError && error.code === code);
}

test("status returns successful no-ops for empty and not-due queues", () => {
  const { repo, stateDir } = scenario();
  assert.deepEqual(status(stateDir, "2026-08-14"), {
    ok: true,
    outcome: "noop",
    reason: "empty-queue",
    date: "2026-08-14",
    nextPublishOn: "2026-08-14",
  });
  const draft = addFixture(repo);
  addPost(stateDir, draft);
  const result = status(stateDir, "2026-08-13");
  assert.equal(result.outcome, "noop");
  assert.equal(result.reason, "not-due");
  assert.equal(result.head, draft);
  const due = status(stateDir, "2026-08-14");
  assert.equal(due.outcome, "action");
  assert.equal(due.action, "publish");
  assert.equal(due.head, draft);
});

test("CLI initialization uses owner-only state and emits JSON", () => {
  const root = mkdtempSync(path.join(TEST_ROOT, "cli-"));
  const stateDir = path.join(root, "state");
  const cli = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "publisher", "cli.mjs");
  const initialized = spawnSync(
    process.execPath,
    [cli, "--state-dir", stateDir, "init", "--next-publish-on", "2026-08-14", "--publish-every-days", "2"],
    { encoding: "utf8", env: process.env },
  );
  assert.equal(initialized.status, 0, initialized.stderr);
  assert.equal(JSON.parse(initialized.stdout).outcome, "initialized");
  assert.equal(statSync(stateDir).mode & 0o777, 0o700);
  assert.equal(statSync(path.join(stateDir, "queue.yaml")).mode & 0o777, 0o600);
  const listed = spawnSync(process.execPath, [cli, "--state-dir", stateDir, "list"], {
    encoding: "utf8",
    env: process.env,
  });
  assert.equal(listed.status, 0, listed.stderr);
  assert.deepEqual(JSON.parse(listed.stdout).queue.posts, []);
});

test("malformed and unexpected queue fields fail closed", () => {
  const { stateDir } = scenario();
  const queuePath = path.join(stateDir, "queue.yaml");
  writeFileSync(queuePath, "version: 1\ntimezone: [broken\n", { mode: 0o600 });
  chmodSync(queuePath, 0o600);
  expectPublisherError(() => loadQueue(stateDir), "invalid_schema");

  writeFileSync(
    queuePath,
    "version: 1\ntimezone: Australia/Brisbane\npublishEveryDays: 2\nnextPublishOn: '2026-08-14'\nposts: []\nsurprise: true\n",
    { mode: 0o600 },
  );
  expectPublisherError(() => loadQueue(stateDir), "invalid_schema");
});

test("add, move, remove, and cadence changes preserve explicit queue order and due date", () => {
  const { repo, stateDir } = scenario();
  const first = addFixture(repo, "first-post");
  const second = addFixture(repo, "second-post");
  addPost(stateDir, first);
  addPost(stateDir, second);
  const moved = movePost(stateDir, second, 1);
  assert.deepEqual(moved.queue.posts, [second, first]);
  const cadence = setCadence(stateDir, 3);
  assert.equal(cadence.nextPublishOn, "2026-08-14");
  assert.equal(cadence.nextPublishOnUnchanged, true);
  assert.equal(cadence.queue.publishEveryDays, 3);
  assert.deepEqual(removePost(stateDir, first).queue.posts, [second]);
  assert.deepEqual(listQueue(stateDir).queue.posts, [second]);
});

test("queue paths reject traversal and alternate draft shapes", () => {
  const { stateDir } = scenario();
  for (const invalid of [
    "../content/blog-drafts/post/post.mdx",
    "/content/blog-drafts/post/post.mdx",
    "content/blog-drafts/../post/post.mdx",
    "content/blog-drafts/Bad-Slug/post.mdx",
    "content/blog-drafts/post/other.mdx",
  ]) {
    expectPublisherError(() => addPost(stateDir, invalid), "invalid_post_path");
  }
});

test("prepare fails for a missing queued draft and leaves the queue intact", () => {
  const { repo, stateDir } = scenario();
  const draft = "content/blog-drafts/missing/post.mdx";
  addPost(stateDir, draft);
  expectPublisherError(() => prepare(stateDir, { date: "2026-08-14", repo }), "missing_draft");
  assert.deepEqual(loadQueue(stateDir).posts, [draft]);
});

test("prepare fails when a draft bundle contains multiple MDX files", () => {
  const { repo, stateDir } = scenario();
  const draft = addFixture(repo);
  writeFileSync(path.join(repo, "content", "blog-drafts", "queued-post", "extra.mdx"), "---\ntitle: Extra\n---\n");
  addPost(stateDir, draft);
  expectPublisherError(() => prepare(stateDir, { date: "2026-08-14", repo }), "invalid_bundle");
  assert.deepEqual(loadQueue(stateDir).posts, [draft]);
});

test("prepare fails on an image collision and leaves source and queue unchanged", () => {
  const { repo, stateDir } = scenario();
  const draft = addFixture(repo);
  const existing = path.join(repo, "content", "blog", "2025-01-01", "images", "diagram.png");
  mkdirSync(path.dirname(existing), { recursive: true });
  writeFileSync(existing, "existing");
  addPost(stateDir, draft);
  expectPublisherError(() => prepare(stateDir, { date: "2026-08-14", repo }), "asset_collision");
  assert.equal(existsSync(path.join(repo, ...draft.split("/"))), true);
  assert.deepEqual(loadQueue(stateDir).posts, [draft]);
});

test("prepare rejects conflicting frontmatter dates and existing post destinations", () => {
  const dated = scenario();
  const datedDraft = addFixture(dated.repo);
  const datedPath = path.join(dated.repo, ...datedDraft.split("/"));
  writeFileSync(datedPath, readFileSync(datedPath, "utf8").replace("title: 'A queued post'", "title: 'A queued post'\ndate: 2026-08-13"));
  addPost(dated.stateDir, datedDraft);
  expectPublisherError(() => prepare(dated.stateDir, { date: "2026-08-14", repo: dated.repo }), "date_conflict");
  assert.deepEqual(loadQueue(dated.stateDir).posts, [datedDraft]);

  const colliding = scenario();
  const collidingDraft = addFixture(colliding.repo);
  const destination = path.join(colliding.repo, "content", "blog", "2026-08-14", "queued-post.mdx");
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, "already here");
  addPost(colliding.stateDir, collidingDraft);
  expectPublisherError(
    () => prepare(colliding.stateDir, { date: "2026-08-14", repo: colliding.repo }),
    "destination_collision",
  );
  assert.deepEqual(loadQueue(colliding.stateDir).posts, [collidingDraft]);
});

test("prepare fails closed when the publication worktree is dirty", () => {
  const { repo, stateDir } = scenario();
  const draft = addFixture(repo);
  writeFileSync(path.join(repo, ".publisher-dirty"), "dirty");
  addPost(stateDir, draft);
  expectPublisherError(() => prepare(stateDir, { date: "2026-08-14", repo }), "dirty_repository");
  assert.deepEqual(loadQueue(stateDir).posts, [draft]);
});

test("prepare transforms one post, moves images, records the transaction, and leaves the queue", () => {
  const { repo, stateDir } = scenario();
  const draft = addFixture(repo);
  addPost(stateDir, draft);
  const result = prepare(stateDir, { date: "2026-08-14", repo });
  assert.equal(result.outcome, "prepared");
  assert.match(result.transaction.marker, /^xylem-blog-publication:[0-9a-f]{64}$/);
  assert.equal(result.transaction.expectedPublicUrl, "https://gordonbeeming.com/blog/2026-08-14/queued-post");
  assert.deepEqual(loadQueue(stateDir).posts, [draft]);
  assert.equal(existsSync(path.join(repo, ...draft.split("/"))), false);
  const post = readFileSync(path.join(repo, "content", "blog", "2026-08-14", "queued-post.mdx"), "utf8");
  assert.match(post, /^date: 2026-08-14$/m);
  assert.match(post, /src="\/images\/diagram\.png"/);
  assert.equal(existsSync(path.join(repo, "content", "blog", "2026-08-14", "images", "diagram.png")), true);
  assert.deepEqual(result.transaction.assetPaths, [
    {
      source: "content/blog-drafts/queued-post/images/diagram.png",
      destination: "content/blog/2026-08-14/images/diagram.png",
      publicPath: "/images/diagram.png",
    },
  ]);
});

test("a failed finalize retains the queued post", () => {
  const { repo, stateDir } = scenario();
  const draft = addFixture(repo);
  addPost(stateDir, draft);
  prepare(stateDir, { date: "2026-08-14", repo });
  expectPublisherError(
    () =>
      finalize(stateDir, {
        date: "2026-08-14",
        mergeSha: "0123456789abcdef0123456789abcdef01234567",
        liveUrl: "https://gordonbeeming.com/blog/wrong",
      }),
    "transaction_mismatch",
  );
  assert.deepEqual(loadQueue(stateDir).posts, [draft]);
});

test("finalize fails when queue order changes after prepare", () => {
  const { repo, stateDir } = scenario();
  const first = addFixture(repo, "first-post");
  const second = addFixture(repo, "second-post", { withImage: false });
  addPost(stateDir, first);
  addPost(stateDir, second);
  prepare(stateDir, { date: "2026-08-14", repo });
  movePost(stateDir, second, 1);
  expectPublisherError(
    () =>
      finalize(stateDir, {
        date: "2026-08-14",
        mergeSha: "0123456789abcdef0123456789abcdef01234567",
        liveUrl: "https://gordonbeeming.com/blog/2026-08-14/first-post",
      }),
    "queue_head_changed",
  );
  assert.deepEqual(loadQueue(stateDir).posts, [second, first]);
});

test("finalize removes only the matching head and applies a cadence changed after prepare", () => {
  const { repo, stateDir } = scenario();
  const first = addFixture(repo, "first-post");
  const second = addFixture(repo, "second-post");
  addPost(stateDir, first);
  addPost(stateDir, second);
  prepare(stateDir, { date: "2026-08-14", repo });
  setCadence(stateDir, 3);
  const result = finalize(stateDir, {
    date: "2026-08-14",
    mergeSha: "0123456789abcdef0123456789abcdef01234567",
    liveUrl: "https://gordonbeeming.com/blog/2026-08-14/first-post",
  });
  assert.deepEqual(result.queue.posts, [second]);
  assert.equal(result.queue.nextPublishOn, "2026-08-17");
});

test("finalize pops one item and retry reconciliation stays idempotent", () => {
  const { repo, stateDir } = scenario();
  const first = addFixture(repo, "first-post");
  const second = addFixture(repo, "second-post", { withImage: false });
  const third = addFixture(repo, "third-post", { withImage: false });
  addPost(stateDir, first);
  addPost(stateDir, second);
  setCadence(stateDir, 3);
  prepare(stateDir, { date: "2026-08-14", repo });
  const mergeSha = "0123456789abcdef0123456789abcdef01234567";
  const liveUrl = "https://gordonbeeming.com/blog/2026-08-14/first-post";
  const finalized = finalize(stateDir, { date: "2026-08-15", mergeSha, liveUrl });
  assert.equal(finalized.outcome, "finalized");
  assert.deepEqual(finalized.queue.posts, [second]);
  assert.equal(finalized.queue.nextPublishOn, "2026-08-18");

  const retried = finalize(stateDir, { date: "2026-08-15", mergeSha, liveUrl });
  assert.equal(retried.outcome, "already-finalized");
  assert.deepEqual(retried.queue.posts, [second]);
  assert.equal(reconcile(stateDir).reason, "already-finalized");

  const transactionPath = path.join(stateDir, "publisher-transaction.json");
  const transaction = JSON.parse(readFileSync(transactionPath, "utf8"));
  transaction.queueApplied = false;
  writeFileSync(transactionPath, `${JSON.stringify(transaction, null, 2)}\n`, { mode: 0o600 });
  chmodSync(transactionPath, 0o600);
  const reconciled = reconcile(stateDir);
  assert.equal(reconciled.outcome, "reconciled");
  assert.deepEqual(reconciled.queue.posts, [second]);

  const changedCadence = setCadence(stateDir, 4);
  assert.equal(changedCadence.nextPublishOn, "2026-08-18");
  addPost(stateDir, third);
  movePost(stateDir, third, 1);
  assert.equal(reconcile(stateDir).reason, "already-finalized");
  const next = prepare(stateDir, { date: "2026-08-18", repo });
  assert.equal(next.outcome, "prepared");
  assert.equal(next.transaction.source, third);
});

test("the exclusive lock rejects a live owner and recovers a stale owner", () => {
  const { stateDir } = scenario();
  const lockPath = path.join(stateDir, "publisher.lock");
  writeFileSync(
    lockPath,
    `${JSON.stringify({ version: 1, token: "live", pid: process.pid, hostname: hostname(), startedAt: new Date().toISOString() })}\n`,
    { mode: 0o600 },
  );
  expectPublisherError(() => withRunLock(stateDir, () => "never"), "publisher_locked");
  writeFileSync(lockPath, "not-json\n", { mode: 0o600 });
  assert.equal(withRunLock(stateDir, () => "recovered"), "recovered");
  assert.equal(existsSync(lockPath), false);
});
