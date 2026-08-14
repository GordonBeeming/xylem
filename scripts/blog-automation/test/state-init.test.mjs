import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, stat, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  STATE_PATHS,
  initializeState,
  initialQueue,
  initialScoutState,
  parseQueueYaml,
  validateQueue,
  validateScoutState,
} from "../state/init.mjs";
import { scoutDue } from "../state/scout-due.mjs";

const FIXED_NOW = new Date("2026-08-14T00:30:00.000Z");

async function temporaryStateDir() {
  return mkdtemp(path.join(os.tmpdir(), "xylem-blog-state-"));
}

test("initial state has a valid empty queue and Thursday scout gate", () => {
  assert.deepEqual(validateQueue(initialQueue(FIXED_NOW)), {
    version: 1,
    timezone: "Australia/Brisbane",
    publishEveryDays: 2,
    nextPublishOn: "2026-08-14",
    posts: [],
  });

  assert.deepEqual(validateScoutState(initialScoutState(FIXED_NOW)), {
    version: 1,
    timezone: "Australia/Brisbane",
    lastSuccessfulCutoff: null,
    nextNominalThursday: "2026-08-20",
    activeRun: null,
  });
});

test("scout due gate catches up from its persisted Thursday", () => {
  const state = {
    ...initialScoutState(FIXED_NOW),
    nextNominalThursday: "2026-08-13",
  };
  assert.equal(scoutDue(state, new Date("2026-08-12T00:30:00Z")).due, false);
  assert.equal(scoutDue(state, new Date("2026-08-14T00:30:00Z")).due, true);
});

test("scout due gate resumes an active run instead of preparing another", () => {
  const state = { ...initialScoutState(FIXED_NOW), activeRun: "2026-08-13-example" };
  assert.deepEqual(scoutDue(state, FIXED_NOW, "/tmp/xylem-state"), {
    due: true,
    reason: "active-run",
    activeRun: "2026-08-13-example",
    runDirectory: "/tmp/xylem-state/runs/2026-08-13-example",
  });
});

test("scout due gate recovers an active run from the archive after completion moved it", async () => {
  const stateDir = await temporaryStateDir();
  const activeRun = "2026-08-13-example";
  const archiveDirectory = path.join(stateDir, STATE_PATHS.archive, activeRun);
  await mkdir(archiveDirectory, { recursive: true });
  const state = { ...initialScoutState(FIXED_NOW), activeRun };

  assert.equal(scoutDue(state, FIXED_NOW, stateDir).runDirectory, archiveDirectory);
});

test("queue parser validates queued draft paths", () => {
  assert.deepEqual(
    parseQueueYaml(
      "version: 1\ntimezone: Australia/Brisbane\npublishEveryDays: 3\nnextPublishOn: '2026-08-29'\nposts:\n  - content/blog-drafts/one-post/post.mdx\n",
    ),
    {
      version: 1,
      timezone: "Australia/Brisbane",
      publishEveryDays: 3,
      nextPublishOn: "2026-08-29",
      posts: ["content/blog-drafts/one-post/post.mdx"],
    },
  );

  assert.throws(
    () =>
      parseQueueYaml(
        "version: 1\ntimezone: Australia/Brisbane\npublishEveryDays: 3\nnextPublishOn: '2026-08-29'\nposts:\n  - ../private/post.mdx\n",
      ),
    /queue schema/,
  );
});

test("initializer creates owner-only files and directories", async () => {
  const stateDir = await temporaryStateDir();
  const result = await initializeState({ stateDir, now: FIXED_NOW });

  assert.equal(result.queueCreated, true);
  assert.equal(result.scoutCreated, true);
  assert.match(await readFile(result.queuePath, "utf8"), /posts: \[\]/);
  validateScoutState(JSON.parse(await readFile(result.scoutPath, "utf8")));

  assert.equal((await stat(stateDir)).mode & 0o777, 0o700);
  assert.equal((await stat(result.queuePath)).mode & 0o777, 0o600);
  assert.equal((await stat(result.scoutPath)).mode & 0o777, 0o600);

  for (const directory of [
    STATE_PATHS.runs,
    STATE_PATHS.archive,
    STATE_PATHS.ideas,
    STATE_PATHS.locks,
  ]) {
    assert.equal((await stat(path.join(stateDir, directory))).mode & 0o777, 0o700);
  }
});

test("initializer never overwrites an existing queue or scout state", async () => {
  const stateDir = await temporaryStateDir();
  const first = await initializeState({ stateDir, now: FIXED_NOW });
  const customQueue = "version: 1\ntimezone: Australia/Brisbane\npublishEveryDays: 3\nnextPublishOn: '2026-08-29'\nposts: []\n";
  const customScout = {
    version: 1,
    timezone: "Australia/Brisbane",
    lastSuccessfulCutoff: "2026-08-13T00:00:00.000Z",
    nextNominalThursday: "2026-08-20",
    activeRun: null,
  };

  await writeFile(first.queuePath, customQueue, { mode: 0o600 });
  await writeFile(first.scoutPath, `${JSON.stringify(customScout)}\n`, { mode: 0o600 });

  const second = await initializeState({ stateDir, now: new Date("2026-09-01T00:00:00Z") });
  assert.equal(second.queueCreated, false);
  assert.equal(second.scoutCreated, false);
  assert.equal(await readFile(first.queuePath, "utf8"), customQueue);
  assert.deepEqual(JSON.parse(await readFile(first.scoutPath, "utf8")), customScout);
});

test("initializer fails closed when existing scout state is malformed", async () => {
  const stateDir = await temporaryStateDir();
  const first = await initializeState({ stateDir, now: FIXED_NOW });
  await writeFile(first.scoutPath, "{}\n", { mode: 0o600 });

  await assert.rejects(
    initializeState({ stateDir, now: FIXED_NOW }),
    /scout state does not match version 1/,
  );
});

test("initializer fails closed when an existing queue is malformed", async () => {
  const stateDir = await temporaryStateDir();
  const first = await initializeState({ stateDir, now: FIXED_NOW });
  await writeFile(first.queuePath, "version: 1\nposts: []\n", { mode: 0o600 });

  await assert.rejects(
    initializeState({ stateDir, now: FIXED_NOW }),
    /publication queue does not match version 1/,
  );
});

test("state validation rejects unknown fields and impossible dates", () => {
  assert.throws(
    () => validateQueue({ ...initialQueue(FIXED_NOW), extra: true }),
    /publication queue does not match version 1/,
  );
  assert.throws(
    () => validateQueue({ ...initialQueue(FIXED_NOW), nextPublishOn: "2026-02-30" }),
    /publication queue does not match version 1/,
  );
  assert.throws(
    () => validateScoutState({ ...initialScoutState(FIXED_NOW), activeRun: "" }),
    /scout state does not match version 1/,
  );
  assert.throws(
    () => validateScoutState({ ...initialScoutState(FIXED_NOW), activeRun: "../../private" }),
    /scout state does not match version 1/,
  );
});

test("initializer refuses a symlinked state file", async () => {
  const stateDir = await temporaryStateDir();
  const outside = path.join(await temporaryStateDir(), "outside.json");
  await writeFile(outside, "{}\n", { mode: 0o600 });
  await symlink(outside, path.join(stateDir, STATE_PATHS.scout));

  await assert.rejects(
    initializeState({ stateDir, now: FIXED_NOW }),
    /must not be a symbolic link/,
  );
  assert.equal(await readFile(outside, "utf8"), "{}\n");
});
