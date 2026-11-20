import { spawnSync } from "node:child_process";

// OpenNext runs `pnpm build`. The Pages build already calls tinacms separately.
// The preview Worker build needs the generated Tina client and /admin assets.
if (process.env.XYLEM_PREVIEW !== "1") {
  process.exit(0);
}

const args = ["exec", "tinacms", "build"];
if (process.env.TINA_SKIP_CLOUD_CHECKS === "1") {
  args.push("--skip-cloud-checks");
}

const result = spawnSync("pnpm", args, { stdio: "inherit" });
process.exit(result.status ?? 1);
