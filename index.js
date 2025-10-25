import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.get("/", (_, res) => res.json({ ok: true, service: "dni-mock" }));

app.get("/api/v1/dni/:dni", async (req, res) => {
  const dni = (req.params.dni || "").trim();
  if (!/^\d{8}$/.test(dni)) return res.status(400).json({ error: "DNI inválido" });

  try {
    const url = `https://randomuser.me/api/?seed=${dni}&inc=name&nat=es&noinfo`;
    const r = await fetch(url, { headers: { "Accept": "application/json" } });
    const j = await r.json();
    const name = j?.results?.[0]?.name || {};
    const first = (name.first || "Nombre").toUpperCase();
    const last  = (name.last  || "Apellido").toUpperCase();

    return res.json({
      dni,
      nombres: first,
      apellidoPaterno: last,
      apellidoMaterno: "MOCK",
      codVerifica: String((Number(dni.at(-1)) + 3) % 10)
    });
  } catch {
    return res.status(502).json({ error: "Proveedor no disponible" });
  }
});

app.listen(PORT, () => console.log("dni-mock listening on", PORT));
