import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import morgan from 'morgan';

const app = express();
const PORT = 3000;

// Config: accetta JSON + log delle richieste
app.use(express.json());
app.use(morgan('dev'));

// Dummy "database"
let planets = [
  { id: 1, name: 'Earth' },
  { id: 2, name: 'Mars' },
];

// Rotte minime (torneranno utili nei passi successivi)
app.get('/', (_req, res) => res.send('Server up'));
app.get('/planets', (_req, res) => res.json(planets));

// Handler errori (utile con express-async-errors)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
