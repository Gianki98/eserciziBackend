import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import pgPromise from "pg-promise";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

const db = pgPromise({})(
  "postgres://postgres:postgres@localhost:5432/planetsdb"
);

const createTable = async () => {
  await db.none(`
    CREATE TABLE IF NOT EXISTS planets(
      id   SERIAL PRIMARY KEY,
      name TEXT   NOT NULL
    );
  `);
  console.log("Tabella planets pronta");
};

const popolaDb = async () => {
  const { count } = await db.one(`SELECT COUNT(*)::int AS count FROM planets;`);
  if (count === 0) {
    await db.none(`INSERT INTO planets (name) VALUES ($1), ($2);`, [
      "Earth",
      "Mars",
    ]);
    console.log("Popolato con Earth e Mars");
  }
};

const getAllPlanets = async () => {
  const planets = await db.any(`SELECT * FROM planets;`);
  console.log("Esempio getAllPlanets():", planets);
  return planets;
};

createTable().catch(console.error);
popolaDb().catch(console.error);

// GET /planets → SELECT * FROM planets;
app.get("/planets", async (_req, res) => {
  try {
    const rows = await db.any(`SELECT * FROM planets;`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// GET /planets/:id → SELECT * FROM planets WHERE id=$1;
app.get("/planets/:id", async (req, res) => {
  const { id } = req.params;
  const numId = Number(id);
  if (Number.isNaN(numId)) return res.status(400).json({ msg: "Invalid id" });

  try {
    const row = await db.oneOrNone(`SELECT * FROM planets WHERE id=$1;`, [
      numId,
    ]); // $1 = id
    if (!row) return res.status(404).json({ msg: "Planet not found" });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// POST /planets → INSERT INTO planets (name) VALUES ($1);
app.post("/planets", async (req, res) => {
  const { name } = req.body || {};
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ msg: "Field 'name' is required" });
  }

  try {
    await db.none(`INSERT INTO planets (name) VALUES ($1);`, [name.trim()]); // $1 = name
    res.status(201).json({ msg: "Planet created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// PUT /planets/:id → UPDATE planets SET name=$2 WHERE id=$1;
app.put("/planets/:id", async (req, res) => {
  const { id } = req.params;
  const numId = Number(id);
  const { name } = req.body || {};

  if (Number.isNaN(numId)) return res.status(400).json({ msg: "Invalid id" });
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ msg: "Field 'name' is required" });
  }

  try {
    // db.result per sapere quante righe sono state toccate
    const affected = await db.result(
      `UPDATE planets SET name=$2 WHERE id=$1;`,
      [numId, name.trim()], // $1=id, $2=name
      (r) => r.rowCount
    );
    if (affected === 0)
      return res.status(404).json({ msg: "Planet not found" });
    res.json({ msg: "Planet updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// DELETE /planets/:id → DELETE FROM planets WHERE id=$1;
app.delete("/planets/:id", async (req, res) => {
  const { id } = req.params;
  const numId = Number(id);
  if (Number.isNaN(numId)) return res.status(400).json({ msg: "Invalid id" });

  try {
    const affected = await db.result(
      `DELETE FROM planets WHERE id=$1;`,
      [numId], // $1=id
      (r) => r.rowCount
    );
    if (affected === 0)
      return res.status(404).json({ msg: "Planet not found" });
    res.json({ msg: "Planet deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.get("/", (req, res) => res.send("Server attivo"));

app.listen(PORT, () => {
  console.log(`Il server è attivo su http://localhost:${PORT}`);
});
