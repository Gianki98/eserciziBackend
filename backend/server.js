// server.js (ESM)
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import pgPromise from "pg-promise";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// pg-promise
const db = pgPromise({})(
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/planetsdb"
);

// === DB setup: aggiungo campo image ===
async function setupDb() {
  await db.none(`
    CREATE TABLE IF NOT EXISTS planets(
      id    SERIAL PRIMARY KEY,
      name  TEXT   NOT NULL,
      image TEXT
    );
  `);
  // Per chi aveva già la tabella senza image:
  await db.none(`ALTER TABLE planets ADD COLUMN IF NOT EXISTS image TEXT;`);

  const { count } = await db.one(`SELECT COUNT(*)::int AS count FROM planets;`);
  if (count === 0) {
    await db.none(`INSERT INTO planets (name) VALUES ($1), ($2);`, ["Earth", "Mars"]);
  }
}

// === Multer (salva su /uploads) ===
fs.mkdirSync("uploads", { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads"),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Serve i file statici (facoltativo ma comodo)
app.use("/uploads", express.static("uploads"));

// --- ROUTES ---
app.get("/planets", async (_req, res) => {
  const rows = await db.any(`SELECT * FROM planets;`);
  res.json(rows);
});

app.post("/planets/:id/image", upload.single("image"), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ msg: "Invalid id" });
  if (!req.file) return res.status(400).json({ msg: "File is required (field: image)" });

  // Salvo IL PERCORSO nel DB (come richiesto)
  const filePath = `/uploads/${req.file.filename}`;
  const affected = await db.result(
    `UPDATE planets SET image=$2 WHERE id=$1;`,
    [id, filePath], // $1 = id, $2 = image
    r => r.rowCount
  );

  if (affected === 0) return res.status(404).json({ msg: "Planet not found" });
  res.json({ msg: "Image uploaded", image: filePath });
});

// base
app.get("/", (_req, res) => res.send("Server attivo"));

setupDb().then(() => {
  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
});
