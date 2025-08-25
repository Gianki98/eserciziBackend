import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res
    .status(200) 
    .set("Content-Type", "text/html") 
    .send(`<!doctype html>
<html lang="it">
  <head><meta charset="utf-8"><title>Home</title></head>
  <body>
    <h1>Server online</h1>
  </body>
</html>`);
});

app.listen(PORT, () =>
  console.log(`Il server è attivo su http://localhost:${PORT}`)
);
