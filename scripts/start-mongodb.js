const fs = require("fs");
const path = require("path");

function loadEnvFile(file) {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // File may not exist.
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const uri = (process.env.MONGODB_URI ?? "").trim();
const usesAtlas = uri.startsWith("mongodb+srv://") || uri.includes("mongodb.net");
if (usesAtlas) {
  console.log("Using MongoDB Atlas; skipping local MongoDB.");
  process.exit(0);
}

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
