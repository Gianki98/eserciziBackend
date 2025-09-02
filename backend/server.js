import "dotenv/config";
import express from "express";
import morgan from "morgan";
import planetsRouter from "./routes/planets.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(morgan("dev"));

app.use(planetsRouter); // monta /api/...

app.get("/", (_req, res) => res.send("Server up"));

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
