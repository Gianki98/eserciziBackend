import { Router } from "express";
import {
  getAll,
  getOneById,
  create,
  updateById,
  deleteById,
} from "../controllers/planets.js";

const router = Router();

router.get("/api/planets", getAll);
router.get("/api/planets/:id", getOneById);
router.post("/api/planets", create);
router.put("/api/planets/:id", updateById);
router.delete("/api/planets/:id", deleteById);

export default router;
