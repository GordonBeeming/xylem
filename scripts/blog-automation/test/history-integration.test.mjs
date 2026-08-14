import assert from 'node:assert/strict'
import { appendFile, cp, mkdir, mkdtemp, readFile, readdir, stat, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

import { abort, complete, prepare } from '../history/core.mjs'

const fixtureHome = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'history', 'home')

async function setup() {
  const root = await mkdtemp(join(tmpdir(), 'xylem-history-test-'))
  const home = join(root, 'home')
  const stateDir = join(root, 'state')
  await cp(fixtureHome, home, { recursive: true })
  await appendFile(join(home, '.codex', 'archived_sessions', 'archived.jsonl'), '{"timestamp":"2026-08-09T02:02:01.000Z","type":"response_item"')
  await mkdir(stateDir, { recursive: true, mode: 0o700 })
  await writeFile(join(stateDir, 'scout-state.json'), `${JSON.stringify({
    version: 1,
    timezone: 'Australia/Brisbane',
    lastSuccessfulCutoff: null,
    nextNominalThursday: '2026-08-13',
    activeRun: null,
  })}\n`)
  return { root, home, stateDir }
}

async function readTree(root) {
  let output = ''
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name)
    output += entry.isDirectory() ? await readTree(path) : await readFile(path, 'utf8')
  }
  return output
}

function validIdeas(sourceCardId) {
  return {
    ideas: [{
      inventedExamplesOnly: true,
      sourceCardIds: [sourceCardId],
      variants: Array.from({ length: 5 }, (_, index) => ({
        title: `Invented automation lesson ${index + 1}`,
        vibe: 'A practical, general reflection using a fictional scenario.',
        headers: ['The fictional setup', 'What changes', 'A reusable lesson'],
      })),
    }],
  }
}

test('prepare inventories root local histories and keeps restricted canaries out of batches', async () => {
  const { home, stateDir } = await setup()
  const result = await prepare({ now: new Date('2026-08-14T00:00:00.000Z'), stateDir, home })
  assert.equal(result.status, 'prepared')
  assert.equal(result.manifestPath, join(result.runDirectory, 'manifest.json'))
  assert.equal(result.manifestPath.startsWith('/'), true)
  assert.deepEqual(result.window, {
    since: '2026-08-07T00:00:00.000Z',
    scanSince: '2026-08-06T00:00:00.000Z',
    until: '2026-08-14T00:00:00.000Z',
  })
  assert.equal(result.conversationCount, 3)
  const manifest = JSON.parse(await readFile(join(result.runDirectory, 'manifest.json'), 'utf8'))
  assert.deepEqual(manifest.counts, { byProvider: { codex: 2, claude: 1 }, byPrivacyClass: { restricted: 3, unrestricted: 0 } })
  assert.equal(manifest.modelReadableFiles.every((path) => path.startsWith(result.runDirectory)), true)
  assert.deepEqual(manifest.priorIdeaReportFiles, [])
  const batch = JSON.parse(await readFile(join(result.runDirectory, 'batches', 'batch-0001.json'), 'utf8'))
  assert.equal(batch.conversations.every((conversation) => conversation.restricted && conversation.taxonomy.inventedExamplesOnly), true)
  const modelReadable = JSON.stringify(batch)
  for (const canary of ['RESTRICTED_CANARY', 'SUBAGENT_CANARY', 'CLAUDE_THINKING_CANARY', 'CLAUDE_INTERMEDIATE_CANARY', 'RESTRICTED_TOOL_PAYLOAD']) {
    assert.equal(modelReadable.includes(canary), false, canary)
  }
  const privateRunState = await readTree(result.runDirectory)
  for (const canary of ['RESTRICTED_CANARY', 'SUBAGENT_CANARY', 'CLAUDE_THINKING_CANARY', 'CLAUDE_INTERMEDIATE_CANARY', 'RESTRICTED_TOOL_PAYLOAD']) {
    assert.equal(privateRunState.includes(canary), false, `${canary} was written into run state`)
  }
  assert.equal((await stat(stateDir)).mode & 0o777, 0o700)
  assert.equal((await stat(join(result.runDirectory, 'manifest.json'))).mode & 0o777, 0o600)
  const state = JSON.parse(await readFile(join(stateDir, 'scout-state.json'), 'utf8'))
  assert.ok(state.activeRun)
  assert.equal(state.lastSuccessfulCutoff, null)
  await assert.rejects(() => prepare({ now: new Date('2026-08-14T01:00:00.000Z'), stateDir, home }), /already active/)
})

test('prepare serializes concurrent state transitions and rejects unsafe state paths', async () => {
  const { root, home, stateDir } = await setup()
  const attempts = await Promise.allSettled([
    prepare({ now: new Date('2026-08-14T00:00:00.000Z'), stateDir, home }),
    prepare({ now: new Date('2026-08-14T00:00:00.000Z'), stateDir, home }),
  ])
  assert.equal(attempts.filter((attempt) => attempt.status === 'fulfilled').length, 1)
  assert.equal(attempts.filter((attempt) => attempt.status === 'rejected').length, 1)

  const unsafeStateDir = join(root, 'unsafe-state')
  await mkdir(unsafeStateDir, { mode: 0o700 })
  const symlinkedStateDir = join(root, 'symlinked-state')
  await symlink(unsafeStateDir, symlinkedStateDir)
  await assert.rejects(
    () => prepare({ now: new Date('2026-08-14T02:00:00.000Z'), stateDir: symlinkedStateDir, home }),
    /Private state directory is unsafe/,
  )
})

test('prepare recovers a stale scout lock left by a dead process', async () => {
  const { home, stateDir } = await setup()
  await writeFile(join(stateDir, 'scout.lock'), `${JSON.stringify({ token: 'stale', pid: 999999, hostname: 'localhost', startedAt: '2026-08-14T00:00:00.000Z' })}\n`, { mode: 0o600 })
  const result = await prepare({ now: new Date('2026-08-14T00:00:00.000Z'), stateDir, home })
  assert.equal(result.status, 'prepared')
})

test('unrestricted batches redact secrets and enforce per-message bounds', async () => {
  const { home, stateDir } = await setup()
  const ownershipResolver = async (cwd) => ({ cwd, exists: true, email: 'person@example.com' })
  const result = await prepare({ now: new Date('2026-08-14T00:00:00.000Z'), stateDir, home, ownershipResolver })
  const batch = JSON.parse(await readFile(join(result.runDirectory, 'batches', 'batch-0001.json'), 'utf8'))
  assert.equal(batch.conversations.every((conversation) => conversation.restricted === false), true)
  const serialized = JSON.stringify(batch)
  assert.equal(serialized.includes('sk-abcdefghijklmnopqrstuvwxyz0123456789'), false)
  assert.equal(serialized.includes('[REDACTED_SECRET]'), true)
  assert.equal(batch.conversations.flatMap((conversation) => conversation.messages).every((message) => message.text.length <= 12_000), true)
})

test('complete validates ideas, archives provenance, and advances state only after success', async () => {
  const { root, home, stateDir } = await setup()
  const prepared = await prepare({ now: new Date('2026-08-14T00:00:00.000Z'), stateDir, home })
  const manifest = JSON.parse(await readFile(join(prepared.runDirectory, 'manifest.json'), 'utf8'))
  const sourceCardId = manifest.cardCatalog[0].id
  const invalidPath = join(root, 'invalid.json')
  await writeFile(invalidPath, JSON.stringify({ ideas: [{ inventedExamplesOnly: true, variants: [] }] }))
  await assert.rejects(() => complete({ ideasPath: invalidPath, now: new Date('2026-08-14T01:00:00.000Z'), stateDir }), /exactly five/)
  let state = JSON.parse(await readFile(join(stateDir, 'scout-state.json'), 'utf8'))
  assert.ok(state.activeRun)
  assert.equal(state.lastSuccessfulCutoff, null)

  const privacyInvalidPath = join(root, 'privacy-invalid.json')
  const privacyInvalid = validIdeas(sourceCardId)
  privacyInvalid.ideas[0].variants[0].title = '019ffc02-18ec-7c71-8a35-4b8fbf157257'
  await writeFile(privacyInvalidPath, JSON.stringify(privacyInvalid))
  await assert.rejects(() => complete({ ideasPath: privacyInvalidPath, now: new Date('2026-08-14T01:00:00.000Z'), stateDir }), /privacy validation/)

  const overlapInvalidPath = join(root, 'overlap-invalid.json')
  const overlapInvalid = validIdeas(sourceCardId)
  overlapInvalid.ideas[0].variants[0].title = 'restricted canary codex debug a release pipeline'
  await writeFile(overlapInvalidPath, JSON.stringify(overlapInvalid))
  await assert.rejects(() => complete({ ideasPath: overlapInvalidPath, now: new Date('2026-08-14T01:00:00.000Z'), stateDir }), /overlaps restricted source wording/)

  const ideasPath = join(root, 'ideas.json')
  await writeFile(ideasPath, JSON.stringify(validIdeas(sourceCardId)))
  const result = await complete({ ideasPath, now: new Date('2026-08-14T01:00:00.000Z'), stateDir })
  assert.equal(result.status, 'completed')
  assert.equal(result.successfulCutoff, '2026-08-14T00:00:00.000Z')
  assert.equal(result.nextNominalThursday, '2026-08-20')
  state = JSON.parse(await readFile(join(stateDir, 'scout-state.json'), 'utf8'))
  assert.equal(state.activeRun, null)
  assert.equal(state.lastSuccessfulCutoff, '2026-08-14T00:00:00.000Z')
  const archive = join(stateDir, 'archive', result.runId)
  assert.equal(result.archiveDirectory, archive)
  assert.equal(result.reportPath, join(archive, 'ideas.json'))
  assert.equal(result.reportPath.startsWith('/'), true)
  assert.equal(JSON.parse(await readFile(join(archive, 'manifest.json'), 'utf8')).status, 'completed')
  assert.equal(JSON.parse(await readFile(result.reportPath, 'utf8')).ideas.length, 1)
  assert.equal(JSON.parse(await readFile(join(archive, 'provenance.json'), 'utf8')).events.length > 0, true)
  assert.equal(prepared.runDirectory.endsWith(result.runId), true)
})

test('retry lookback deduplicates archived events and admits a late unseen event', async () => {
  const { root, home, stateDir } = await setup()
  const firstPrepared = await prepare({ now: new Date('2026-08-14T00:00:00.000Z'), stateDir, home })
  const firstManifest = JSON.parse(await readFile(join(firstPrepared.runDirectory, 'manifest.json'), 'utf8'))
  const ideasPath = join(root, 'ideas.json')
  await writeFile(ideasPath, JSON.stringify(validIdeas(firstManifest.cardCatalog[0].id)))
  await complete({ ideasPath, now: new Date('2026-08-14T01:00:00.000Z'), stateDir })
  const codexPath = join(home, '.codex', 'sessions', '2026', '08', '08', 'root.jsonl')
  await appendFile(codexPath, '\n{"timestamp":"2026-08-13T12:00:00.000Z","type":"response_item","payload":{"id":"late-user","type":"message","role":"user","content":[{"type":"input_text","text":"LATE_RESTRICTED_CANARY performance testing"}]}}\n')
  const retry = await prepare({ now: new Date('2026-08-15T00:00:00.000Z'), stateDir, home })
  assert.equal(retry.window.since, '2026-08-14T00:00:00.000Z')
  assert.equal(retry.window.scanSince, '2026-08-13T00:00:00.000Z')
  assert.equal(retry.conversationCount, 1)
  const retryManifest = JSON.parse(await readFile(join(retry.runDirectory, 'manifest.json'), 'utf8'))
  assert.equal(retryManifest.priorIdeaReportFiles.length, 1)
  assert.equal(retryManifest.priorIdeaReportFiles[0].endsWith('/ideas.json'), true)
  const batch = await readFile(join(retry.runDirectory, 'batches', 'batch-0001.json'), 'utf8')
  assert.equal(batch.includes('LATE_RESTRICTED_CANARY'), false)
  const provenance = JSON.parse(await readFile(join(retry.runDirectory, 'provenance.json'), 'utf8'))
  assert.equal(provenance.events.length, 1)
  assert.equal(provenance.events[0].nativeEventId, 'late-user')
})

test('abort marks a run failed without advancing cutoff or due date', async () => {
  const { home, stateDir } = await setup()
  const prepared = await prepare({ now: new Date('2026-08-14T00:00:00.000Z'), stateDir, home })
  const result = await abort({ now: new Date('2026-08-14T01:00:00.000Z'), stateDir })
  assert.equal(result.status, 'aborted')
  const state = JSON.parse(await readFile(join(stateDir, 'scout-state.json'), 'utf8'))
  assert.equal(state.activeRun, null)
  assert.equal(state.lastSuccessfulCutoff, null)
  assert.equal(state.nextNominalThursday, '2026-08-13')
  assert.equal(JSON.parse(await readFile(join(prepared.runDirectory, 'manifest.json'), 'utf8')).status, 'failed')
})
