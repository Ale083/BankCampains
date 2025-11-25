// src/controller/model/predict.js
const { spawn } = require("child_process");
const path = require("path");

exports.predict = (req, res) => {
  const scriptPath = path.join(__dirname, "..", "..", "scripts", "predict_cli.py");

  const py = spawn("python", [scriptPath]); 

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
