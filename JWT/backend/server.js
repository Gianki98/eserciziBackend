import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Pool } from "pg"; // Importa il pacchetto pg per la connessione al database

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Configurazione connessione al database PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Assicurati di avere la variabile DATABASE_URL nel file .env
});

// Rotta di registrazione (signup)
app.post("/registrazione", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username e password sono obbligatori." });
  }

  try {
    // Cifra la password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Salva l'utente nel database
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, hashedPassword]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: "Registrazione avvenuta con successo.",
      userId: user.id,
      username: user.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore in fase di registrazione" });
  }
});

// Rotta di login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username e password obbligatori." });
  }

  try {
    // Trova l'utente nel database
    const user = await db.one("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (!user && !user.password === password) {
      return res.status(401).json({ message: "Credenziali errate" });
    }

    // Crea un JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login effettuato con successo.",
      token,
      userId: user.id,
      username: user.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore in fase di login" });
  }
});

app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});
