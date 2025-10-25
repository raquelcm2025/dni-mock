import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// Ruta principal: prueba de estado del servicio
app.get("/", (_, res) => res.json({ ok: true, service: "dni-mock" }));

// Ruta principal de consulta DNI
app.get("/api/v1/dni/:dni", async (req, res) => {
  const dni = (req.params.dni || "").trim();

  // Validación: debe tener 8 dígitos
  if (!/^\d{8}$/.test(dni)) {
    return res.status(400).json({ error: "DNI inválido" });
  }

  try {
    // Simulamos consulta con randomuser (mock)
    const url = `https://randomuser.me/api/?seed=${dni}&inc=name&nat=es&noinfo`;
    const r = await fetch(url, { headers: { "Accept": "application/json" } });
    const j = await r.json();

    const name = j?.results?.[0]?.name || {};
    const first = (name.first || "Nombre").toUpperCase();
    const last = (name.last || "Apellido").toUpperCase();

    // Cálculo compatible con todas las versiones de Node
    const lastDigit = parseInt(dni[dni.length - 1], 10) || 0;

    // Respuesta JSON mock
    return res.json({
      dni,
      nombres: first,
      apellidoPaterno: last,
      apellidoMaterno: "MOCK",
      codVerifica: String((lastDigit + 3) % 10)
    });
  } catch (err) {
    console.error("Error consultando mock:", err);
    return res.status(502).json({ error: "Proveedor no disponible" });
  }
});

// Inicia servidor
app.listen(PORT, () => console.log("dni-mock listening on", PORT));
