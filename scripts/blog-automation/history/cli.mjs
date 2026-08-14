#!/usr/bin/env node

import { abort, complete, DEFAULT_STATE_DIR, prepare } from './core.mjs'

function parseArguments(argv) {
  const [command, ...rest] = argv
  const options = { command }
  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index]
    if (!argument.startsWith('--')) throw new Error(`Unexpected argument: ${argument}`)
    const name = argument.slice(2)
    const value = rest[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value`)
    options[name] = value
    index += 1
  }
  return options
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const common = { now: options.now ? new Date(options.now) : new Date(), stateDir: options['state-dir'] ?? DEFAULT_STATE_DIR }
  if (options.home) common.home = options.home
  let result
  if (options.command === 'prepare') result = await prepare(common)
  else if (options.command === 'complete') result = await complete({ ...common, ideasPath: options.ideas })
  else if (options.command === 'abort') result = await abort(common)
  else throw new Error('Usage: cli.mjs prepare|complete --ideas PATH|abort [--now ISO] [--state-dir PATH]')
  process.stdout.write(`${JSON.stringify(result)}\n`)
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
})
