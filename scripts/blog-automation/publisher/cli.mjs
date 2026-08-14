#!/usr/bin/env node
import {
  DEFAULT_STATE_DIR,
  PublisherError,
  addPost,
  finalize,
  initializeQueue,
  listQueue,
  movePost,
  prepare,
  reconcile,
  removePost,
  setCadence,
  status,
  withRunLock,
} from "./publisher.mjs";

function parseArguments(argv) {
  const positional = [];
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) {
      positional.push(value);
      continue;
    }
    const name = value.slice(2);
    const next = argv[index + 1];
    if (next === undefined || next.startsWith("--")) throw new PublisherError(`Missing value for --${name}`, "invalid_arguments");
    options[name] = next;
    index += 1;
  }
  return { positional, options };
}

function required(options, name) {
  if (options[name] === undefined) throw new PublisherError(`Missing required option --${name}`, "invalid_arguments");
  return options[name];
}

function exactlyOne(values, description) {
  if (values.length !== 1) throw new PublisherError(`${description} requires exactly one post path`, "invalid_arguments");
  return values[0];
}

function run(command, args, options, stateDir) {
  switch (command) {
    case "init":
      return initializeQueue(stateDir, {
        nextPublishOn: required(options, "next-publish-on"),
        publishEveryDays: options["publish-every-days"] ?? 2,
      });
    case "list":
      return listQueue(stateDir);
    case "add":
      return addPost(stateDir, exactlyOne(args, "add"));
    case "remove":
      return removePost(stateDir, exactlyOne(args, "remove"));
    case "move":
      return movePost(stateDir, exactlyOne(args, "move"), required(options, "to"));
    case "set-cadence":
      return setCadence(stateDir, exactlyOne(args, "set-cadence"));
    case "status":
      return status(stateDir, required(options, "date"));
    case "prepare":
      return prepare(stateDir, { date: required(options, "date"), repo: required(options, "repo") });
    case "finalize":
      return finalize(stateDir, {
        date: required(options, "date"),
        mergeSha: required(options, "merge-sha"),
        liveUrl: required(options, "live-url"),
      });
    case "reconcile":
      return reconcile(stateDir);
    default:
      throw new PublisherError(
        "Command must be one of: init, list, add, remove, move, set-cadence, status, prepare, finalize, reconcile",
        "invalid_arguments",
      );
  }
}

try {
  const { positional, options } = parseArguments(process.argv.slice(2));
  const [command, ...args] = positional;
  if (!command) throw new PublisherError("A command is required", "invalid_arguments");
  const stateDir = options["state-dir"] ?? DEFAULT_STATE_DIR;
  delete options["state-dir"];
  const result = withRunLock(stateDir, () => run(command, args, options, stateDir));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch (error) {
  const code = error instanceof PublisherError ? error.code : "unexpected_error";
  process.stderr.write(`${JSON.stringify({ ok: false, error: code, message: error.message }, null, 2)}\n`);
  process.exitCode = 1;
}
