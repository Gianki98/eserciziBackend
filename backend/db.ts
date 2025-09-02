// db.ts
export type Planet = { id: number; name: string };
export type Planets = Planet[];

export let planets: Planets = [
  { id: 1, name: "Earth" },
  { id: 2, name: "Mars" },
];
