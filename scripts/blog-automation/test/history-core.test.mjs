import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

import {
  boundText,
  classifyOwnership,
  createOwnershipResolver,
  findPrivacyViolations,
  findRestrictedOverlap,
  inHalfOpenWindow,
  isClaudeSubagentPath,
  isClaudeHumanPrompt,
  isCodexRoot,
  nextBrisbaneThursday,
  privacyNgramHashes,
  redactSecrets,
  readJsonl,
  taxonomyForMessages,
  validateIdeas,
} from '../history/core.mjs'

const fixtureDirectory = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'history')

test('half-open windows include since and exclude until', () => {
  const since = new Date('2026-08-07T00:00:00.000Z')
  const until = new Date('2026-08-14T00:00:00.000Z')
  assert.equal(inHalfOpenWindow('2026-08-07T00:00:00.000Z', since, until), true)
  assert.equal(inHalfOpenWindow('2026-08-13T23:59:59.999Z', since, until), true)
  assert.equal(inHalfOpenWindow('2026-08-14T00:00:00.000Z', since, until), false)
})

test('root filters reject Codex descendants and Claude synthetic prompts', () => {
  assert.equal(isCodexRoot({ payload: { source: 'cli', thread_source: 'user', parent_thread_id: null } }), true)
  assert.equal(isCodexRoot({ payload: { source: 'exec', thread_source: 'user', parent_thread_id: null } }), false)
  assert.equal(isCodexRoot({ payload: { source: 'cli', thread_source: 'automation', parent_thread_id: null } }), false)
  assert.equal(isCodexRoot({ payload: { source: { subagent: {} }, thread_source: 'subagent', parent_thread_id: 'parent' } }), false)
  assert.equal(isClaudeHumanPrompt({ type: 'user', isSidechain: false, message: { content: 'hello' } }), true)
  assert.equal(isClaudeHumanPrompt({ type: 'user', isSidechain: true, message: { content: 'hello' } }), false)
  assert.equal(isClaudeHumanPrompt({ type: 'user', isMeta: true, message: { content: 'hello' } }), false)
  assert.equal(isClaudeHumanPrompt({ type: 'user', message: { content: [{ type: 'tool_result', content: 'secret' }] } }), false)
  assert.equal(isClaudeSubagentPath('/tmp/projects/subagents/run.jsonl'), true)
  assert.equal(isClaudeSubagentPath('C:\\tmp\\projects\\subagents\\run.jsonl'), true)
  assert.equal(isClaudeSubagentPath('/tmp/projects/subagents-archive/run.jsonl'), false)
})

test('ownership classification fails closed for SSW, mixed, missing, and unresolved cwd ownership', () => {
  assert.deepEqual(classifyOwnership([{ cwd: '/personal', exists: true, email: 'me@example.com' }]), { restricted: false, reason: 'personal' })
  assert.deepEqual(classifyOwnership([{ cwd: '/work', exists: true, email: 'Person@SSW.COM.AU' }]), { restricted: true, reason: 'ssw' })
  assert.deepEqual(classifyOwnership([{ cwd: '/a', exists: true, email: 'a@example.com' }, { cwd: '/b', exists: true, email: 'b@example.com' }]), { restricted: true, reason: 'mixed' })
  assert.deepEqual(classifyOwnership([{ cwd: '/gone', exists: false, email: null }]), { restricted: true, reason: 'unresolved' })
  assert.deepEqual(classifyOwnership([]), { restricted: true, reason: 'unresolved' })
})

test('ownership resolver accepts only a repository-local Git identity', async () => {
  const root = await mkdtemp(join(tmpdir(), 'xylem-ownership-'))
  assert.deepEqual(await createOwnershipResolver()(root), { cwd: root, exists: true, email: null })

  execFileSync('git', ['init', '--quiet', root])
  execFileSync('git', ['-C', root, 'config', '--local', 'user.email', 'local@example.com'])
  assert.deepEqual(await createOwnershipResolver()(root), { cwd: root, exists: true, email: 'local@example.com' })
})

test('redaction and bounds are deterministic', () => {
  const source = 'Authorization: Bearer abcdefghijklmnopqrstuvwxyz012345 and api_key=sk-abcdefghijklmnopqrstuvwxyz0123456789'
  assert.equal(redactSecrets(source).includes('abcdefghijklmnopqrstuvwxyz012345'), false)
  assert.equal(redactSecrets(source), redactSecrets(source))
  assert.equal(redactSecrets('{"api_key":"short-secret-value"}').includes('short-secret-value'), false)
  assert.equal(redactSecrets('{"password":"hunter12345"}').includes('hunter12345'), false)
  const bounded = boundText('x'.repeat(500), 100)
  assert.equal(bounded.length <= 100, true)
  assert.match(bounded, /\[TRUNCATED\]$/)
})

test('restricted taxonomy emits broad counts and co-occurrences without source text', () => {
  const result = taxonomyForMessages([
    { text: 'Debug a failing release test and deployment pipeline' },
    { text: 'Improve keyboard accessibility testing' },
  ])
  assert.equal(result.inventedExamplesOnly, true)
  assert.equal(result.counts.debugging, 1)
  assert.equal(result.counts.release, 1)
  assert.equal(result.counts.testing, 2)
  assert.equal(JSON.stringify(result).includes('failing release test'), false)
})

test('idea validation requires exactly five complete variants', () => {
  const variants = Array.from({ length: 5 }, (_, index) => ({ title: `Title ${index}`, vibe: `Vibe ${index}`, headers: ['Opening', 'Lesson'] }))
  assert.equal(validateIdeas({ ideas: [{ inventedExamplesOnly: true, variants }] }, { requireInventedExamplesOnly: true }).length, 1)
  assert.throws(() => validateIdeas([{ variants: variants.slice(0, 4) }]), /exactly five/)
  assert.throws(() => validateIdeas([{ variants }], { requireInventedExamplesOnly: true }), /inventedExamplesOnly/)
  assert.throws(() => validateIdeas([{ variants: variants.map((variant, index) => index === 2 ? { ...variant, headers: [] } : variant) }]), /headers/)
})

test('privacy validation catches source identifiers, URLs, and local paths', () => {
  assert.deepEqual(findPrivacyViolations({ title: 'An invented testing lesson' }), [])
  assert.ok(findPrivacyViolations({ title: '019ffc02-18ec-7c71-8a35-4b8fbf157257' }).includes('native identifier'))
  assert.ok(findPrivacyViolations({ title: 'https://example.com/private' }).includes('URL'))
  assert.ok(findPrivacyViolations({ title: '/Users/person/private/repo' }).includes('restricted source detail'))
})

test('restricted overlap uses hashes without persisting source wording', () => {
  const source = 'distinctive canary phrase about deployment testing'
  const hashes = privacyNgramHashes(source)
  assert.equal([...hashes].some((hash) => hash.includes('distinctive')), false)
  assert.equal(findRestrictedOverlap({ title: 'A distinctive canary phrase about deployment testing' }, hashes), true)
  assert.equal(findRestrictedOverlap({ title: 'A wholly invented lesson about unit tests' }, hashes), false)
})

test('next Thursday uses Brisbane calendar dates', () => {
  assert.equal(nextBrisbaneThursday('2026-08-14T00:00:00.000Z'), '2026-08-20')
  assert.equal(nextBrisbaneThursday('2026-08-12T00:00:00.000Z'), '2026-08-13')
})

test('JSONL ignores only an incomplete trailing record', async () => {
  const root = await mkdtemp(join(tmpdir(), 'xylem-jsonl-test-'))
  const incomplete = join(root, 'incomplete.jsonl')
  await writeFile(incomplete, '{"value":1}\n{"value":')
  const values = []
  await readJsonl(incomplete, (row) => values.push(row.value))
  assert.deepEqual(values, [1])

  const invalidComplete = join(root, 'invalid-complete.jsonl')
  await writeFile(invalidComplete, '{"value":1}\n{"value":}\n')
  await assert.rejects(() => readJsonl(invalidComplete, () => {}), (error) => {
    assert.match(error.message, new RegExp(`Invalid JSONL at ${invalidComplete.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:2$`))
    assert.equal(error.message.includes('{"value":}'), false)
    return true
  })
})

test('JSONL framing preserves literal U+2028 and U+2029 inside JSON strings', async () => {
  const rows = []
  await readJsonl(join(fixtureDirectory, 'unicode-separators.jsonl'), (row, lineNumber) => rows.push({ ...row, lineNumber }))
  assert.deepEqual(rows, [
    { value: 'before\u2028middle\u2029after', lineNumber: 1 },
    { value: 'second record', lineNumber: 2 },
  ])
})
