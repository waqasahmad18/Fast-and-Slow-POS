if (process.env.VERCEL || process.platform !== "win32") {
  process.exit(0);
}

const { spawnSync } = require("child_process");
const result = spawnSync(
  "powershell",
  ["-ExecutionPolicy", "Bypass", "-File", "./scripts/start-mongodb.ps1"],
  { stdio: "inherit" }
);
process.exit(result.status ?? 1);
