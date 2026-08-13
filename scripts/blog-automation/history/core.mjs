import { createHash, randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { access, chmod, mkdir, open, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'

export const STATE_VERSION = 1
export const TIMEZONE = 'Australia/Brisbane'
export const DEFAULT_STATE_DIR = join(homedir(), 'Library', 'Application Support', 'Xylem Blog Automation')
export const RETRY_LOOKBACK_MS = 24 * 60 * 60 * 1000
export const FIRST_RUN_MS = 7 * 24 * 60 * 60 * 1000
export const MAX_MESSAGE_CHARS = 12_000
export const MAX_CONVERSATION_CHARS = 48_000
export const MAX_BATCH_CHARS = 180_000
export const MAX_JSONL_RECORD_CHARS = 64 * 1024 * 1024

const SSW_EMAIL = /@ssw\.com\.au$/i
const UUIDISH = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi
const URL = /\b(?:https?|ssh|git):\/\/\S+/gi
const PRIVATE_KEY = /-----BEGIN [^-\n]*(?:PRIVATE KEY|OPENSSH KEY)-----[\s\S]*?-----END [^-\n]*(?:PRIVATE KEY|OPENSSH KEY)-----/g
const CONNECTION_STRING = /\b(?:Server|Host|Data Source|AccountKey|SharedAccessSignature|Password|Pwd|Secret)\s*=\s*[^;\s]+/gi
const ASSIGNMENT_SECRET = /\b(?:api[_-]?key|token|secret|password|passwd|pwd|authorization)\b\s*[:=]\s*["']?[^\s,"']{8,}/gi
const BEARER = /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi
const COMMON_TOKEN = /\b(?:sk|ghp|github_pat|xox[baprs]|AKIA)[-_A-Za-z0-9]{12,}\b/g
const HIGH_ENTROPY = /\b[A-Za-z0-9+/=_-]{32,}\b/g

const TAXONOMY = Object.freeze({
  accessibility: /\b(?:accessib|a11y|screen reader|keyboard navigation|contrast|aria)\b/i,
  'agent-workflows': /\b(?:agent|prompt|context window|subagent|codex|claude|llm)\b/i,
  architecture: /\b(?:architect|design pattern|dependency|interface|module|schema|refactor)\b/i,
  automation: /\b(?:automat|scheduled|cron|routine|workflow|pipeline)\b/i,
  data: /\b(?:database|sql|data model|migration|query|warehouse|dataset)\b/i,
  debugging: /\b(?:debug|diagnos|bug|exception|failure|root cause|trace)\b/i,
  infrastructure: /\b(?:container|docker|network|dns|server|cloud|deploy|hosting|nfs)\b/i,
  performance: /\b(?:performance|latency|slow|memory|cpu|throughput|profil)\b/i,
  release: /\b(?:release|version|notari|signing|artifact|package|homebrew|publish)\b/i,
  security: /\b(?:security|credential|secret|auth|permission|vulnerab|cve)\b/i,
  testing: /\b(?:test(?:ing|ed|s)?|assert|coverage|fixture|regression|playwright|verify)\b/i,
  ux: /\b(?:\bux\b|user experience|interface|layout|interaction|navigation|visual)\b/i,
})

export function parseInstant(value, label = 'timestamp') {
  const date = value instanceof Date ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${label}: ${value}`)
  return date
}

export function inHalfOpenWindow(timestamp, since, until) {
  const value = parseInstant(timestamp).getTime()
  return value >= parseInstant(since).getTime() && value < parseInstant(until).getTime()
}

export function redactSecrets(value) {
  let text = String(value ?? '')
  for (const pattern of [PRIVATE_KEY, CONNECTION_STRING, ASSIGNMENT_SECRET, BEARER, COMMON_TOKEN]) {
    text = text.replace(pattern, '[REDACTED_SECRET]')
  }
  return text.replace(HIGH_ENTROPY, (candidate) => {
    const classes = [/[a-z]/, /[A-Z]/, /\d/, /[+/_=-]/].filter((pattern) => pattern.test(candidate)).length
    return classes >= 3 ? '[REDACTED_SECRET]' : candidate
  })
}

export function boundText(value, limit = MAX_MESSAGE_CHARS) {
  const text = String(value ?? '').trim()
  if (text.length <= limit) return text
  return `${text.slice(0, Math.max(0, limit - 20)).trimEnd()}\n[TRUNCATED]`
}

export function isCodexRoot(meta) {
  const payload = meta?.payload ?? meta ?? {}
  const source = payload.source
  return !payload.parent_thread_id
    && !payload.forked_from_id
    && payload.thread_source !== 'subagent'
    && !(source && typeof source === 'object' && source.subagent)
    && source !== 'exec'
    && payload.thread_source !== 'automation'
}

export function isClaudeHumanPrompt(row) {
  if (!row || row.type !== 'user' || row.isSidechain === true || row.isMeta === true || row.promptSource === 'system') return false
  if (Array.isArray(row.message?.content)) return row.message.content.some((part) => part?.type === 'text' && part.text?.trim())
  return typeof row.message?.content === 'string' && row.message.content.trim().length > 0
}

export function classifyOwnership(records) {
  const normalized = records.map((record) => ({
    cwd: record?.cwd ?? null,
    exists: record?.exists === true,
    email: typeof record?.email === 'string' ? record.email.trim().toLowerCase() : null,
  }))
  if (!normalized.length || normalized.some((item) => !item.cwd || !item.exists || !item.email)) {
    return { restricted: true, reason: 'unresolved' }
  }
  const emails = new Set(normalized.map((item) => item.email))
  if (emails.size !== 1) return { restricted: true, reason: 'mixed' }
  if ([...emails].some((email) => SSW_EMAIL.test(email))) return { restricted: true, reason: 'ssw' }
  return { restricted: false, reason: 'personal' }
}

export function taxonomyForMessages(messages) {
  const counts = Object.fromEntries(Object.keys(TAXONOMY).map((name) => [name, 0]))
  const cooccurrences = new Map()
  for (const message of messages) {
    const matched = Object.entries(TAXONOMY).filter(([, pattern]) => pattern.test(message.text ?? '')).map(([name]) => name)
    for (const name of matched) counts[name] += 1
    for (let left = 0; left < matched.length; left += 1) {
      for (let right = left + 1; right < matched.length; right += 1) {
        const pair = [matched[left], matched[right]].sort().join('+')
        cooccurrences.set(pair, (cooccurrences.get(pair) ?? 0) + 1)
      }
    }
  }
  return {
    counts: Object.fromEntries(Object.entries(counts).filter(([, count]) => count > 0)),
    cooccurrences: Object.fromEntries([...cooccurrences].sort(([a], [b]) => a.localeCompare(b))),
    messageCount: messages.length,
    inventedExamplesOnly: true,
  }
}

function normalizedTokens(value) {
  return String(value ?? '').toLowerCase().normalize('NFKC').replace(/[_-]+/g, ' ').match(/[a-z0-9][a-z0-9]{2,}/g) ?? []
}

export function privacyNgramHashes(value, size = 4) {
  const tokens = normalizedTokens(value)
  const hashes = new Set()
  for (let index = 0; index + size <= tokens.length; index += 1) {
    hashes.add(createHash('sha256').update(tokens.slice(index, index + size).join(' ')).digest('hex'))
  }
  return hashes
}

export function validateIdeas(input, { requireInventedExamplesOnly = false, requireSourceCardIds = false, knownCardIds = null, restrictedCardIds = null } = {}) {
  const ideas = Array.isArray(input) ? input : input?.ideas
  if (!Array.isArray(ideas)) throw new Error('Ideas must be an array or an object with an ideas array')
  for (const [ideaIndex, idea] of ideas.entries()) {
    if (!idea || !Array.isArray(idea.variants) || idea.variants.length !== 5) {
      throw new Error(`Idea ${ideaIndex + 1} must contain exactly five variants`)
    }
    if (requireSourceCardIds && (!Array.isArray(idea.sourceCardIds) || !idea.sourceCardIds.length || idea.sourceCardIds.some((id) => typeof id !== 'string' || !id.trim()))) {
      throw new Error(`Idea ${ideaIndex + 1} must reference at least one source card`)
    }
    if (knownCardIds && (idea.sourceCardIds ?? []).some((id) => !knownCardIds.has(id))) {
      throw new Error(`Idea ${ideaIndex + 1} references an unknown source card`)
    }
    const referencesRestricted = restrictedCardIds && (idea.sourceCardIds ?? []).some((id) => restrictedCardIds.has(id))
    if ((requireInventedExamplesOnly || referencesRestricted) && idea.inventedExamplesOnly !== true) {
      throw new Error(`Idea ${ideaIndex + 1} must set inventedExamplesOnly to true`)
    }
    for (const [variantIndex, variant] of idea.variants.entries()) {
      if (!variant || typeof variant.title !== 'string' || !variant.title.trim()) throw new Error(`Idea ${ideaIndex + 1} variant ${variantIndex + 1} needs a title`)
      if (typeof variant.vibe !== 'string' || !variant.vibe.trim()) throw new Error(`Idea ${ideaIndex + 1} variant ${variantIndex + 1} needs a vibe`)
      if (!Array.isArray(variant.headers) || !variant.headers.length || variant.headers.some((header) => typeof header !== 'string' || !header.trim())) {
        throw new Error(`Idea ${ideaIndex + 1} variant ${variantIndex + 1} needs non-empty headers`)
      }
    }
  }
  return ideas
}

export function findRestrictedOverlap(value, restrictedHashes) {
  if (!restrictedHashes?.size) return false
  for (const hash of privacyNgramHashes(JSON.stringify(value))) if (restrictedHashes.has(hash)) return true
  return false
}

export function findPrivacyViolations(value) {
  const serialized = JSON.stringify(value)
  const violations = []
  if (UUIDISH.test(serialized)) violations.push('native identifier')
  UUIDISH.lastIndex = 0
  if (URL.test(serialized)) violations.push('URL')
  URL.lastIndex = 0
  if (/```|\/Users\/|\\Users\\|@ssw\.com\.au/i.test(serialized)) violations.push('restricted source detail')
  return violations
}

export function nextBrisbaneThursday(now) {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
  let cursor = parseInstant(now)
  for (let step = 0; step < 9; step += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(cursor).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]))
    if (parts.weekday === 'Thu') return `${parts.year}-${parts.month}-${parts.day}`
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
  }
  throw new Error('Unable to calculate next Thursday')
}

export function eventFingerprint(provider, conversationId, eventId, timestamp, text) {
  return createHash('sha256').update([provider, conversationId, eventId, timestamp, text].join('\0')).digest('hex')
}

export async function readJsonl(path, onRow) {
  const file = await stat(path)
  let endsWithNewline = false
  if (file.size > 0) {
    const handle = await open(path, 'r')
    try {
      const byte = Buffer.alloc(1)
      await handle.read(byte, 0, 1, file.size - 1)
      endsWithNewline = byte[0] === 0x0a
    } finally { await handle.close() }
  }
  const input = createReadStream(path, { encoding: 'utf8', highWaterMark: 64 * 1024 })
  let lineNumber = 0
  let buffer = ''
  const parseRow = async (line, number, allowIncomplete) => {
    if (line.endsWith('\r')) line = line.slice(0, -1)
    if (!line.trim()) return
    let row
    try { row = JSON.parse(line) } catch (error) {
      if (allowIncomplete && error instanceof SyntaxError) return
      throw new Error(`Invalid JSONL at ${resolve(path)}:${number}`)
    }
    await onRow(row, number)
  }
  for await (const chunk of input) {
    buffer += chunk
    let newlineIndex
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      lineNumber += 1
      const line = buffer.slice(0, newlineIndex)
      buffer = buffer.slice(newlineIndex + 1)
      await parseRow(line, lineNumber, false)
    }
    if (buffer.length > MAX_JSONL_RECORD_CHARS) {
      throw new Error(`JSONL record exceeds ${MAX_JSONL_RECORD_CHARS} characters at ${resolve(path)}:${lineNumber + 1}`)
    }
  }
  if (buffer.length || !endsWithNewline) {
    lineNumber += 1
    await parseRow(buffer, lineNumber, !endsWithNewline)
  }
}

async function pathExists(path) {
  try { await access(path); return true } catch { return false }
}

async function walkJsonl(root) {
  if (!await pathExists(root)) return []
  const found = []
  const visit = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) await visit(path)
      else if (entry.isFile() && entry.name.endsWith('.jsonl')) found.push(path)
    }
  }
  await visit(root)
  return found.sort()
}

function userText(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.filter((part) => part?.type === 'text' || part?.type === 'input_text').map((part) => part.text ?? '').join('\n')
}

function codexMessageText(payload) {
  return (payload.content ?? []).filter((part) => part?.type === 'input_text' || part?.type === 'output_text').map((part) => part.text ?? '').join('\n')
}

function isOrientationCandidate(timestamp, since) {
  return parseInstant(timestamp).getTime() < parseInstant(since).getTime()
}

async function parseCodexConversation(path, scanSince, until, orientationSince) {
  let meta = null
  let firstUser = null
  const messages = []
  await readJsonl(path, (row) => {
    if (row.type === 'session_meta' && !meta) meta = row
    if (row.type !== 'response_item' || row.payload?.type !== 'message') return
    const role = row.payload.role
    const phase = row.payload.phase
    if (role !== 'user' && !(role === 'assistant' && (phase === 'final_answer' || phase == null))) return
    const text = codexMessageText(row.payload)
    if (!text.trim()) return
    const item = { id: row.payload.id ?? `${role}-${row.timestamp}`, role, timestamp: row.timestamp, text }
    if (role === 'user' && !firstUser) firstUser = item
    if (inHalfOpenWindow(row.timestamp, scanSince, until)) messages.push(item)
  })
  if (!meta || !isCodexRoot(meta) || !messages.length) return null
  if (firstUser && isOrientationCandidate(firstUser.timestamp, orientationSince)) {
    messages.unshift({ ...firstUser, text: boundText(firstUser.text, 1_000), orientation: true })
  }
  return {
    provider: 'codex', nativeId: meta.payload.id, cwd: meta.payload.cwd, messages,
    startedAt: meta.payload.timestamp, updatedAt: messages.at(-1).timestamp,
  }
}

async function codexStateDatabaseFiles(home, since) {
  const codexHome = join(home, '.codex')
  if (!await pathExists(codexHome)) return null
  const databases = (await readdir(codexHome, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && /^state_\d+\.sqlite$/.test(entry.name))
    .sort((left, right) => Number(right.name.match(/\d+/)?.[0] ?? 0) - Number(left.name.match(/\d+/)?.[0] ?? 0))
  if (!databases.length) return null
  const database = join(codexHome, databases[0].name)
  const sinceSeconds = Math.floor(since.getTime() / 1000)
  const sql = `SELECT DISTINCT t.rollout_path AS path FROM threads t LEFT JOIN thread_spawn_edges e ON e.child_thread_id=t.id WHERE e.child_thread_id IS NULL AND t.updated_at >= ${sinceSeconds} AND t.source <> 'exec' AND COALESCE(t.thread_source, '') NOT IN ('automation', 'subagent') ORDER BY t.rollout_path;`
  const output = await spawnText('sqlite3', ['-readonly', '-json', database, sql]).catch(() => null)
  if (output == null) throw new Error('Unable to inventory Codex histories from the local state database')
  const rows = output ? JSON.parse(output) : []
  return rows.map((row) => row.path).filter((path) => typeof path === 'string')
}

async function collectCodex(home, scanSince, until, orientationSince) {
  const roots = [join(home, '.codex', 'sessions'), join(home, '.codex', 'archived_sessions')]
  const indexedFiles = await codexStateDatabaseFiles(home, scanSince)
  const files = indexedFiles ?? (await Promise.all(roots.map(walkJsonl))).flat()
  const conversations = []
  for (const path of files) {
    const conversation = await parseCodexConversation(path, scanSince, until, orientationSince)
    if (conversation) conversations.push(conversation)
  }
  return conversations
}

async function claudePromptIndex(path, since, until) {
  const sessions = new Map()
  if (!await pathExists(path)) return sessions
  await readJsonl(path, (row) => {
    const timestamp = typeof row.timestamp === 'number' ? new Date(row.timestamp).toISOString() : row.timestamp
    if (!row.sessionId || !timestamp || !inHalfOpenWindow(timestamp, since, until)) return
    const item = {
      id: `${row.timestamp}:${createHash('sha256').update(JSON.stringify(row)).digest('hex').slice(0, 16)}`,
      role: 'user', timestamp, cwd: row.project ?? null, text: row.display ?? '',
    }
    if (!item.text.trim()) return
    const list = sessions.get(row.sessionId) ?? []
    list.push(item)
    sessions.set(row.sessionId, list)
  })
  for (const list of sessions.values()) list.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  return sessions
}

async function parseClaudeTranscript(path, sessionId, prompts, scanSince, until, orientationSince) {
  const assistants = []
  const cwds = new Set(prompts.map((prompt) => prompt.cwd).filter(Boolean))
  let firstHumanPrompt = null
  await readJsonl(path, (row) => {
    if (row.sessionId && row.sessionId !== sessionId) return
    if (row.cwd) cwds.add(row.cwd)
    if (isClaudeHumanPrompt(row) && !firstHumanPrompt) {
      firstHumanPrompt = { id: row.promptId ?? row.uuid, role: 'user', timestamp: row.timestamp, text: userText(row.message?.content) }
    }
    if (row.type !== 'assistant' || row.isSidechain === true || !Array.isArray(row.message?.content)) return
    const text = row.message.content.filter((part) => part?.type === 'text').map((part) => part.text ?? '').join('\n')
    if (text.trim()) assistants.push({ id: row.uuid ?? row.message.id, role: 'assistant', timestamp: row.timestamp, text })
  })
  const messages = []
  for (let index = 0; index < prompts.length; index += 1) {
    const prompt = prompts[index]
    const nextTimestamp = prompts[index + 1]?.timestamp ?? until.toISOString()
    messages.push(prompt)
    const final = assistants.filter((assistant) => assistant.timestamp >= prompt.timestamp && assistant.timestamp < nextTimestamp).at(-1)
    if (final && inHalfOpenWindow(final.timestamp, scanSince, until)) messages.push(final)
  }
  if (firstHumanPrompt && isOrientationCandidate(firstHumanPrompt.timestamp, orientationSince)) {
    messages.unshift({ ...firstHumanPrompt, text: boundText(firstHumanPrompt.text, 1_000), orientation: true })
  }
  return { provider: 'claude', nativeId: sessionId, cwds: [...cwds], messages, startedAt: firstHumanPrompt?.timestamp ?? prompts[0]?.timestamp, updatedAt: messages.at(-1)?.timestamp }
}

async function collectClaude(home, scanSince, until, orientationSince) {
  const index = await claudePromptIndex(join(home, '.claude', 'history.jsonl'), scanSince, until)
  if (!index.size) return []
  const transcriptFiles = await findClaudeTranscriptFiles(join(home, '.claude', 'projects'), new Set(index.keys()))
  const bySession = new Map()
  for (const path of transcriptFiles) {
    if (path.includes(`${join('', 'subagents', '')}`) || dirname(path).endsWith('/subagents')) continue
    const sessionId = basename(path, '.jsonl')
    if (!index.has(sessionId)) continue
    const list = bySession.get(sessionId) ?? []
    list.push(path)
    bySession.set(sessionId, list)
  }
  const conversations = []
  for (const [sessionId, prompts] of index) {
    const paths = bySession.get(sessionId) ?? []
    if (!paths.length) {
      conversations.push({ provider: 'claude', nativeId: sessionId, cwds: [...new Set(prompts.map((prompt) => prompt.cwd).filter(Boolean))], messages: prompts, startedAt: prompts[0].timestamp, updatedAt: prompts.at(-1).timestamp })
      continue
    }
    const ranked = []
    for (const path of paths) {
      let matching = 0
      await readJsonl(path, (row) => { if (row.sessionId === sessionId) matching += 1 })
      ranked.push({ path, matching })
    }
    ranked.sort((a, b) => b.matching - a.matching || a.path.localeCompare(b.path))
    conversations.push(await parseClaudeTranscript(ranked[0].path, sessionId, prompts, scanSince, until, orientationSince))
  }
  return conversations
}

async function findClaudeTranscriptFiles(projectsRoot, sessionIds) {
  if (!await pathExists(projectsRoot)) return []
  const files = []
  for (const project of await readdir(projectsRoot, { withFileTypes: true })) {
    if (!project.isDirectory()) continue
    const projectPath = join(projectsRoot, project.name)
    for (const entry of await readdir(projectPath, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.jsonl')) continue
      if (sessionIds.has(basename(entry.name, '.jsonl'))) files.push(join(projectPath, entry.name))
    }
  }
  return files.sort()
}

function spawnText(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { ...options, shell: false, stdio: ['ignore', 'pipe', 'ignore'] })
    let output = ''
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (chunk) => { output += chunk })
    child.on('error', reject)
    child.on('close', (code) => resolvePromise(code === 0 ? output.trim() : null))
  })
}

export function createOwnershipResolver() {
  const cache = new Map()
  return async (cwd) => {
    if (cache.has(cwd)) return cache.get(cwd)
    const promise = (async () => {
      if (!cwd || !await pathExists(cwd)) return { cwd, exists: false, email: null }
      const email = await spawnText('git', ['-C', cwd, 'config', '--get', 'user.email']).catch(() => null)
      return { cwd, exists: true, email: email || null }
    })()
    cache.set(cwd, promise)
    return promise
  }
}

function sanitizeConversation(conversation, restricted) {
  const opaqueId = createHash('sha256').update(`${conversation.provider}\0${conversation.nativeId}`).digest('hex').slice(0, 24)
  const messages = []
  let remaining = MAX_CONVERSATION_CHARS
  for (const message of conversation.messages) {
    if (remaining <= 0) break
    const redacted = boundText(redactSecrets(message.text), Math.min(MAX_MESSAGE_CHARS, remaining))
    if (!redacted) continue
    remaining -= redacted.length
    messages.push({ role: message.role, timestamp: message.timestamp, text: redacted, orientation: message.orientation === true })
  }
  const base = { id: opaqueId, provider: conversation.provider, startedAt: conversation.startedAt, updatedAt: conversation.updatedAt }
  if (restricted) return { ...base, restricted: true, taxonomy: taxonomyForMessages(conversation.messages) }
  return { ...base, restricted: false, messages }
}

async function atomicWriteJson(path, value, mode = 0o600) {
  await ensurePrivateDirectory(dirname(path))
  const temporary = join(dirname(path), `.${basename(path)}.${process.pid}.${randomUUID()}.tmp`)
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode })
  await chmod(temporary, mode)
  await rename(temporary, path)
  await chmod(path, mode)
}

async function ensurePrivateDirectory(path) {
  await mkdir(path, { recursive: true, mode: 0o700 })
  await chmod(path, 0o700)
}

async function readJson(path, fallback = null) {
  try { return JSON.parse(await readFile(path, 'utf8')) } catch (error) { if (error.code === 'ENOENT') return fallback; throw error }
}

export async function prepare({ now = new Date(), stateDir = DEFAULT_STATE_DIR, home = homedir(), ownershipResolver = createOwnershipResolver() } = {}) {
  const until = parseInstant(now, 'now')
  const statePath = join(stateDir, 'scout-state.json')
  const state = await readJson(statePath, { version: STATE_VERSION, timezone: TIMEZONE, lastSuccessfulCutoff: null, nextNominalThursday: nextBrisbaneThursday(until), activeRun: null })
  if (state.version !== STATE_VERSION) throw new Error(`Unsupported scout state version: ${state.version}`)
  if (state.activeRun) throw new Error('A scout run is already active; complete or abort it first')
  const since = state.lastSuccessfulCutoff ? parseInstant(state.lastSuccessfulCutoff, 'lastSuccessfulCutoff') : new Date(until.getTime() - FIRST_RUN_MS)
  if (since >= until) throw new Error('The successful cutoff must be before now')
  const scanSince = new Date(Math.max(0, since.getTime() - RETRY_LOOKBACK_MS))
  const [codex, claude, knownFingerprints] = await Promise.all([
    collectCodex(home, scanSince, until, since), collectClaude(home, scanSince, until, since),
    state.lastSuccessfulCutoff ? readArchivedFingerprints(stateDir) : Promise.resolve(new Set()),
  ])
  const seen = new Set()
  const cards = []
  const provenance = []
  const restrictedNgramHashes = new Set()
  let hasRestricted = false
  const counts = { byProvider: {}, byPrivacyClass: { restricted: 0, unrestricted: 0 } }
  for (const conversation of [...codex, ...claude]) {
    conversation.messages = conversation.messages.filter((message) => {
      const fingerprint = eventFingerprint(conversation.provider, conversation.nativeId, message.id, message.timestamp, message.text)
      const inCatchUp = parseInstant(message.timestamp).getTime() >= since.getTime()
      const inRetryWindow = parseInstant(message.timestamp).getTime() >= scanSince.getTime()
      const eligible = message.orientation === true || inCatchUp || (state.lastSuccessfulCutoff && inRetryWindow && !knownFingerprints.has(fingerprint))
      if (!eligible || knownFingerprints.has(fingerprint) || seen.has(fingerprint)) return false
      seen.add(fingerprint)
      provenance.push({ fingerprint, provider: conversation.provider, nativeConversationId: conversation.nativeId, nativeEventId: message.id, timestamp: message.timestamp })
      return true
    })
    if (!conversation.messages.length) continue
    const cwds = conversation.cwds ?? [conversation.cwd]
    const classification = classifyOwnership(await Promise.all(cwds.map(ownershipResolver)))
    hasRestricted ||= classification.restricted
    if (classification.restricted) {
      for (const message of conversation.messages) for (const hash of privacyNgramHashes(message.text)) restrictedNgramHashes.add(hash)
    }
    const card = sanitizeConversation(conversation, classification.restricted)
    cards.push(card)
    counts.byProvider[card.provider] = (counts.byProvider[card.provider] ?? 0) + 1
    counts.byPrivacyClass[card.restricted ? 'restricted' : 'unrestricted'] += 1
  }
  const runId = `${until.toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`
  const runDirectory = join(stateDir, 'runs', runId)
  const batches = []
  let current = []
  let currentChars = 0
  for (const card of cards) {
    const size = JSON.stringify(card).length
    if (current.length && currentChars + size > MAX_BATCH_CHARS) { batches.push(current); current = []; currentChars = 0 }
    current.push(card); currentChars += size
  }
  if (current.length || !batches.length) batches.push(current)
  const modelReadableFiles = batches.map((_, index) => resolve(runDirectory, 'batches', `batch-${String(index + 1).padStart(4, '0')}.json`))
  const priorIdeaReportFiles = await listPriorIdeaReports(stateDir)
  const manifest = {
    version: 1, runId, createdAt: until.toISOString(),
    window: { since: since.toISOString(), scanSince: scanSince.toISOString(), until: until.toISOString() },
    status: 'prepared', batchCount: batches.length, conversationCount: cards.length, eventCount: seen.size,
    hasRestrictedSources: hasRestricted, counts, modelReadableFiles, priorIdeaReportFiles,
    cardCatalog: cards.map((card) => ({ id: card.id, provider: card.provider, restricted: card.restricted })),
  }
  await ensurePrivateDirectory(stateDir)
  await ensurePrivateDirectory(join(runDirectory, 'batches'))
  await chmod(runDirectory, 0o700)
  for (const [index, batch] of batches.entries()) {
    await atomicWriteJson(join(runDirectory, 'batches', `batch-${String(index + 1).padStart(4, '0')}.json`), { version: 1, runId, conversations: batch })
  }
  await atomicWriteJson(join(runDirectory, 'provenance.json'), { version: 1, runId, events: provenance, restrictedNgramHashes: [...restrictedNgramHashes].sort() })
  await atomicWriteJson(join(runDirectory, 'manifest.json'), manifest)
  await atomicWriteJson(statePath, { ...state, version: STATE_VERSION, timezone: TIMEZONE, activeRun: runId })
  return {
    status: 'prepared',
    runDirectory,
    manifestPath: resolve(runDirectory, 'manifest.json'),
    window: manifest.window,
    batchCount: batches.length,
    conversationCount: cards.length,
  }
}

export async function complete({ ideasPath, now = new Date(), stateDir = DEFAULT_STATE_DIR } = {}) {
  if (!ideasPath) throw new Error('complete requires --ideas PATH')
  const statePath = join(stateDir, 'scout-state.json')
  const state = await readJson(statePath)
  if (!state?.activeRun) throw new Error('There is no active scout run')
  const runDirectory = join(stateDir, 'runs', state.activeRun)
  const archiveDirectory = join(stateDir, 'archive', state.activeRun)
  const runExists = await pathExists(runDirectory)
  const sourceDirectory = runExists ? runDirectory : archiveDirectory
  const manifest = await readJson(join(sourceDirectory, 'manifest.json'))
  if (!manifest || (manifest.status !== 'prepared' && manifest.status !== 'completed')) throw new Error('The active run is not prepared')
  const ideasDocument = JSON.parse(await readFile(resolve(ideasPath), 'utf8'))
  const knownCardIds = new Set((manifest.cardCatalog ?? []).map((card) => card.id))
  const restrictedCardIds = new Set((manifest.cardCatalog ?? []).filter((card) => card.restricted).map((card) => card.id))
  const ideas = validateIdeas(ideasDocument, { requireSourceCardIds: true, knownCardIds, restrictedCardIds })
  const privacyViolations = findPrivacyViolations(ideas)
  if (privacyViolations.length) throw new Error(`Ideas failed privacy validation: ${privacyViolations.join(', ')}`)
  const provenance = await readJson(join(sourceDirectory, 'provenance.json'))
  const restrictedHashes = new Set(provenance?.restrictedNgramHashes ?? [])
  for (const [index, idea] of ideas.entries()) {
    if (findRestrictedOverlap(idea, restrictedHashes)) throw new Error(`Idea ${index + 1} overlaps restricted source wording`)
  }
  const completedAt = parseInstant(now, 'now')
  if (runExists) {
    await atomicWriteJson(join(runDirectory, 'ideas.json'), { version: 1, ideas })
    await atomicWriteJson(join(runDirectory, 'manifest.json'), { ...manifest, status: 'completed', completedAt: completedAt.toISOString(), ideaCount: ideas.length })
    await ensurePrivateDirectory(dirname(archiveDirectory))
    await rename(runDirectory, archiveDirectory)
  }
  await atomicWriteJson(statePath, {
    ...state, version: STATE_VERSION, timezone: TIMEZONE, lastSuccessfulCutoff: manifest.window.until,
    nextNominalThursday: nextBrisbaneThursday(new Date(completedAt.getTime() + 24 * 60 * 60 * 1000)), activeRun: null,
  })
  return {
    status: 'completed',
    runId: manifest.runId,
    archiveDirectory: resolve(archiveDirectory),
    reportPath: resolve(archiveDirectory, 'ideas.json'),
    successfulCutoff: manifest.window.until,
    nextNominalThursday: nextBrisbaneThursday(new Date(completedAt.getTime() + 24 * 60 * 60 * 1000)),
    ideaCount: ideas.length,
  }
}

async function readArchivedFingerprints(stateDir) {
  const archiveRoot = join(stateDir, 'archive')
  if (!await pathExists(archiveRoot)) return new Set()
  const fingerprints = new Set()
  for (const entry of await readdir(archiveRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const provenance = await readJson(join(archiveRoot, entry.name, 'provenance.json'))
    for (const event of provenance?.events ?? []) {
      fingerprints.add(event.fingerprint)
    }
  }
  return fingerprints
}

async function listPriorIdeaReports(stateDir) {
  const archiveRoot = join(stateDir, 'archive')
  if (!await pathExists(archiveRoot)) return []
  const reports = []
  for (const entry of await readdir(archiveRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const path = resolve(archiveRoot, entry.name, 'ideas.json')
    if (await pathExists(path)) reports.push(path)
  }
  return reports.sort()
}

export async function abort({ now = new Date(), stateDir = DEFAULT_STATE_DIR } = {}) {
  const statePath = join(stateDir, 'scout-state.json')
  const state = await readJson(statePath)
  if (!state?.activeRun) throw new Error('There is no active scout run')
  const runId = state.activeRun
  const runDirectory = join(stateDir, 'runs', runId)
  const manifest = await readJson(join(runDirectory, 'manifest.json'))
  if (manifest) await atomicWriteJson(join(runDirectory, 'manifest.json'), { ...manifest, status: 'failed', failedAt: parseInstant(now, 'now').toISOString() })
  await atomicWriteJson(statePath, { ...state, activeRun: null })
  return { status: 'aborted', runId }
}

export async function removeDirectory(path) {
  await rm(path, { recursive: true, force: true })
}
