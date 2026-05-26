const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..", "..");
const venvDir = path.join(rootDir, ".venv");
const requirementsPath = path.join(rootDir, "requirements.txt");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

function findPython() {
  for (const command of ["python3", "python"]) {
    const result = spawnSync(command, ["--version"], {
      cwd: rootDir,
      stdio: "ignore",
      shell: process.platform === "win32",
    });

    if (result.status === 0) return command;
  }

  throw new Error("Python was not found. Install python3 before deploying.");
}

const python = findPython();

if (!fs.existsSync(venvDir)) {
  run(python, ["-m", "venv", venvDir]);
}

const venvPython =
  process.platform === "win32"
    ? path.join(venvDir, "Scripts", "python.exe")
    : path.join(venvDir, "bin", "python");

run(venvPython, ["-m", "pip", "install", "--upgrade", "pip"]);
run(venvPython, ["-m", "pip", "install", "-r", requirementsPath]);
