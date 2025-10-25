import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.get("/", (_, res) => res.json({ ok: true, service: "dni-mock-hibrido" }));

// --- Datos de respaldo  ---
const NOMBRES = ["AMPARO","JUAN","MARIA","PEDRO","LUISA","CARLOS","ROCIO","MIGUEL","ANA","JAVIER","SOFIA","DIEGO","VALERIA","GABRIEL","LUCIA","SERGIO","KAREN","JORGE","PAOLA","ALONSO"];
const APELLIDOS = ["RAMIREZ","PEREZ","GARCIA","RODRIGUEZ","LOPEZ","SANCHEZ","CASTRO","FLORES","DIAZ","HERRERA","TORRES","CRUZ","MENDOZA","VASQUEZ","GUTIERREZ","RIVERA","RIVAS","SALAZAR","ROMERO","MARTINEZ"];

function genFromDni(dni) {
  const n = parseInt(dni, 10) || 0;
  const i1 = n % NOMBRES.length;
  const i2 = Math.floor(n / 3) % APELLIDOS.length;
  const lastDigit = parseInt(dni[dni.length - 1], 10) || 0;
  return {
    dni,
    nombres: NOMBRES[i1],
    apellidoPaterno: APELLIDOS[i2],
    apellidoMaterno: "GOMEZ",
    codVerifica: String((lastDigit + 3) % 10)
  };
}

app.get("/api/v1/dni/:dni", async (req, res) => {
  const dni = (req.params.dni || "").trim();
  if (!/^\d{8}$/.test(dni)) return res.status(400).json({ error: "DNI inválido" });

  // usar la API de GiansAlex 
  const token = process.env.API_TOKEN || "TU_TOKEN_DE_PERU-CONSULT"; // pon tu token aquí
  const apiReal = `https://apiperu.dev/api/dni/${dni}?token=${token}`;

  try {
    const r = await fetch(apiReal);
    if (r.ok) {
      const data = await r.json();
      if (data?.data?.nombres) {
        const d = data.data;
        return res.json({
          dni: d.numero,
          nombres: d.nombres,
          apellidoPaterno: d.apellido_paterno,
          apellidoMaterno: d.apellido_materno,
          codVerifica: String(parseInt(dni[dni.length - 1], 10) || 0)
        });
      }
    }
    // si falla la API o no hay datos → fallback
    return res.json(genFromDni(dni));
  } catch (e) {
    console.error("Error al consultar API real:", e.message);
    return res.json(genFromDni(dni));
  }
});

app.listen(PORT, "0.0.0.0", () => console.log("dni-mock-hibrido listening on", PORT));
