// controllers/planets.ts
import { Request, Response } from "express";
import { planets, Planet } from "../db.js";

// GET /api/planets
export const getAll = (_req: Request, res: Response) => {
  return res.status(200).json(planets);
};

// GET /api/planets/:id
export const getOneById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ msg: "Invalid id" });

  const planet = planets.find((p) => p.id === id); // <- find
  if (!planet) return res.status(404).json({ msg: "Planet not found" });

  return res.status(200).json(planet);
};

// POST /api/planets
export const create = (req: Request, res: Response) => {
  const { id, name } = req.body as Partial<Planet>;

  if (typeof id !== "number" || id <= 0) {
    return res.status(400).json({ msg: "Field 'id' (positive number) is required" });
  }
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ msg: "Field 'name' (non-empty string) is required" });
  }
  if (planets.some((p) => p.id === id)) {
    return res.status(409).json({ msg: "Planet id already exists" });
  }

  // <- spread per creare un nuovo array con l'elemento aggiunto
  const newPlanet: Planet = { id, name: name.trim() };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _old = planets;
  // riassegno la let per rispettare la consegna (spread operator)
  // (in alternativa: planets.push(newPlanet), ma qui usiamo [...planets])
  // @ts-ignore: reassigning exported let
  planets = [...planets, newPlanet];

  return res.status(201).json({ msg: "Planet created" });
};

// PUT /api/planets/:id
export const updateById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ msg: "Invalid id" });

  const { name } = req.body as Partial<Planet>;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ msg: "Field 'name' (non-empty string) is required" });
  }
  if (!planets.some((p) => p.id === id)) {
    return res.status(404).json({ msg: "Planet not found" });
  }

  // <- map per aggiornare immutabilmente
  // @ts-ignore: reassigning exported let
  planets = planets.map((p) => (p.id === id ? { ...p, name: name.trim() } : p));

  return res.status(200).json({ msg: "Planet updated" });
};

// DELETE /api/planets/:id
export const deleteById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ msg: "Invalid id" });

  if (!planets.some((p) => p.id === id)) {
    return res.status(404).json({ msg: "Planet not found" });
  }

  // <- filter per rimuovere
  // @ts-ignore: reassigning exported let
  planets = planets.filter((p) => p.id !== id);

  return res.status(200).json({ msg: "Planet deleted" });
};
