import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import morgan from 'morgan';
import Joi from 'joi';

const app = express();
const PORT = 3000;

// Config: JSON in ingresso + logging richieste
app.use(express.json());
app.use(morgan('dev'));


let planets = [
  { id: 1, name: 'Earth' },
  { id: 2, name: 'Mars' },
];

// Schemi Joi
const idParam = Joi.object({ id: Joi.number().integer().positive().required() });
const createPlanet = Joi.object({
  id: Joi.number().integer().positive().required(),
  name: Joi.string().trim().min(1).required(),
});
const updatePlanet = Joi.object({ name: Joi.string().trim().min(1).required() });

// Helper validazione
const validateOr400 = (schema, data, res) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    res.status(400).json({ msg: 'Validation error', details: error.details.map(d => d.message) });
    return null;
  }
  return value;
};

// GET /api/planets → 200 + tutti i pianeti
app.get('/api/planets', (_req, res) => {
  res.status(200).json(planets);
});

// GET /api/planets/:id → 200 + pianeta per id, 404 se non trovato
app.get('/api/planets/:id', (req, res) => {
  const params = validateOr400(idParam, req.params, res);
  if (!params) return;
  const planet = planets.find(p => p.id === Number(params.id));
  if (!planet) return res.status(404).json({ msg: 'Planet not found' });
  res.status(200).json(planet);
});

// POST /api/planets → crea pianeta (richiede {id,name}) → 201 + {msg}
app.post('/api/planets', (req, res) => {
  const body = validateOr400(createPlanet, req.body, res);
  if (!body) return;
  if (planets.some(p => p.id === body.id)) {
    return res.status(409).json({ msg: 'Planet id already exists' });
  }
  planets.push({ id: body.id, name: body.name });
  res.status(201).json({ msg: 'Planet created' });
});

// PUT /api/planets/:id → aggiorna name per id → 200 + {msg}
app.put('/api/planets/:id', (req, res) => {
  const params = validateOr400(idParam, req.params, res);
  if (!params) return;
  const body = validateOr400(updatePlanet, req.body, res);
  if (!body) return;

  const idx = planets.findIndex(p => p.id === Number(params.id));
  if (idx === -1) return res.status(404).json({ msg: 'Planet not found' });

  planets[idx].name = body.name;
  res.status(200).json({ msg: 'Planet updated' });
});

// DELETE /api/planets/:id → elimina per id → 200 + {msg}
app.delete('/api/planets/:id', (req, res) => {
  const params = validateOr400(idParam, req.params, res);
  if (!params) return;

  const idx = planets.findIndex(p => p.id === Number(params.id));
  if (idx === -1) return res.status(404).json({ msg: 'Planet not found' });

  planets.splice(idx, 1);
  res.status(200).json({ msg: 'Planet deleted' });
});

// Error handler minimale
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ msg: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
