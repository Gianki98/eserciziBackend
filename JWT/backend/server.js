import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import db from "./db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rotta di registrazione (signup)
app.post("/users/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username e password sono obbligatori." });
  }

  try {
    // Salva l'utente nel database
    const result = await db.one(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, password]
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
app.post("/users/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username e password obbligatori." });
  }

  try {
    // Trova l'utente nel database
    const user = await db.oneOrNone("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Credenziali errate" });
    }

    // Crea un JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
    // Salviamo in token con Update in users
    await db.none("UPDATE users SET token=$1 WHERE id=$2", [token, user.id]);
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
