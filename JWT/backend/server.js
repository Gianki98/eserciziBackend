import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import multer from "multer";
import passport from "passport";
import db from "./db.js";
import "./passport.js"; // registra la strategy JWT

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(passport.initialize());

function authorize(req, res, next) {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Authentication error." });
    }
    if (!user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    req.user = user;
    next();
  })(req, res, next);
}

app.post("/users/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username e password sono obbligatori." });
  }

  try {
    const exists = await db.oneOrNone(
      "SELECT id FROM users WHERE username=$1",
      [username]
    );
    if (exists) {
      return res.status(409).json({ message: "Username già esistente." });
    }

    const user = await db.one(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, password]
    );

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

app.post("/users/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username e password obbligatori." });
  }

  try {
    const user = await db.oneOrNone("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Credenziali errate" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

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

app.get("/users/logout", authorize, async (req, res) => {
  try {
    await db.none("UPDATE users SET token=NULL WHERE id=$1", [req.user.id]); // consegna: WHERE id=$1
    return res.json({ message: "Logout." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const fileFilter = (_req, file, cb) => {
  // permetti solo immagini comuni
  const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
  cb(ok ? null : new Error("Only image files are allowed."), ok);
};

const upload = multer({ storage, fileFilter });

// rotta protetta: solo utenti loggati possono caricare immagini dei pianeti
app.post("/planets/image", authorize, upload.single("image"), (req, res) => {
  // se serve, qui potresti anche registrare il path nel DB
  return res.json({
    message: "Planet image uploaded.",
    filename: req.file?.filename,
  });
});

// handler errori di multer
app.use((err, _req, res, _next) => {
  if (
    err instanceof multer.MulterError ||
    err.message?.includes("Only image files")
  ) {
    return res.status(400).json({ message: err.message });
  }
  return res.status(500).json({ message: "Unexpected error." });
});

app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});
