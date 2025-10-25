import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// Prueba del servicio
app.get("/", (_, res) => res.json({ ok: true, service: "dni-mock" }));

// --- Fallback determinístico (funciona sin internet) ---
const NOMBRES = [
  "AMPARO","JUAN","MARIA","PEDRO","LUISA","CARLOS","ROCIO","MIGUEL","ANA","JAVIER",
  "SOFIA","DIEGO","VALERIA","GABRIEL","LUCIA","SERGIO","KAREN","JORGE","PAOLA","ALONSO"
];
const APELLIDOS = [
  "RAMIREZ","PEREZ","GARCIA","RODRIGUEZ","LOPEZ","SANCHEZ","CASTRO","FLORES","DIAZ",
  "HERRERA","TORRES","CRUZ","MENDOZA","VASQUEZ","GUTIERREZ","RIVERA","RIVAS","SALAZAR",
  "ROMERO","MARTINEZ"
];

function genFromDni(dni) {
  const n = parseInt(dni, 10) || 0;
  const i1 = n % NOMBRES.length;
  const i2 = Math.floor(n / 3) % APELLIDOS.length;
  const lastDigit = parseInt(dni[dni.length - 1], 10) || 0;
  return {
    dni,
    nombres: NOMBRES[i1],
    apellidoPaterno: APELLIDOS[i2],
    apellidoMaterno: "MOCK",
    codVerifica: String((lastDigit + 3) % 10)
  };
}

// Endpoint principal
app.get("/api/v1/dni/:dni", async (req, res) => {
  const dni = (req.params.dni || "").trim();
  if (!/^\d{8}$/.test(dni)) return res.status(400).json({ error: "DNI inválido" });

  try {
    // intento con randomuser
    const url = `https://randomuser.me/api/?seed=${dni}&inc=name&nat=es&noinfo`;
    const r = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!r.ok) throw new Error(`randomuser status ${r.status}`);
    const j = await r.json();
    const nm = j?.results?.[0]?.name || {};
    const first = (nm.first || "").toUpperCase();
    const last  = (nm.last  || "").toUpperCase();

    if (first && last) {
      const lastDigit = parseInt(dni[dni.length - 1], 10) || 0;
      return res.json({
        dni,
        nombres: first,
        apellidoPaterno: last,
        apellidoMaterno: "MOCK",
        codVerifica: String((lastDigit + 3) % 10)
      });
    }

    // fallback si no devuelve nombre
    return res.json(genFromDni(dni));
  } catch (e) {
    console.error("Fallo proveedor externo -> usando fallback:", e.message);
    return res.json(genFromDni(dni));
  }
});

app.listen(PORT, "0.0.0.0", () => console.log("dni-mock listening on", PORT));
