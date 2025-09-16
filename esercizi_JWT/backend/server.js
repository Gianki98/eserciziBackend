import express from "express";

const app = express();
const PORT = 3000;

app.listen(PORT, () =>
  console.log(`Il server è attivo su http://localhost:${PORT}`)
);
