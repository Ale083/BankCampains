// src/controller/model/predict.js
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

exports.predict = (req, res) => {
  const scriptPath = path.join(__dirname, "..", "..", "scripts", "predict_cli.py");
  const rootDir = path.join(__dirname, "..", "..", "..");
  const venvPython =
    process.platform === "win32"
      ? path.join(rootDir, ".venv", "Scripts", "python.exe")
      : path.join(rootDir, ".venv", "bin", "python");
  const pythonCommand = fs.existsSync(venvPython) ? venvPython : "python";

  const py = spawn(pythonCommand, [scriptPath]); 

  py.stdin.write(JSON.stringify(req.body));
  py.stdin.end();

  let stdout = "";
  let stderr = "";

  py.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  py.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  py.on("close", (code) => {
    if (code !== 0) {
      console.error("Error en script de Python:", stderr);
      return res.status(500).json({
        ok: false,
        error: "Error ejecutando el modelo",
        detalle: stderr,
      });
    }

    try {
      const json = JSON.parse(stdout);
      return res.json(json);
    } catch (err) {
      console.error("No se pudo parsear la salida de Python:", err, stdout);
      return res.status(500).json({
        ok: false,
        error: "Respuesta inválida del modelo",
      });
    }
  });
};
