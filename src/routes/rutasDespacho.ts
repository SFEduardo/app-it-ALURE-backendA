import express from "express";
import multer from "multer";
import { createDespacho } from "../controllers/controladorDespacho.js";
import { jwtCheck, jwtParse } from "../middleware/autenticacion.js";
import { validateDespachoRequest } from "../middleware/validacion.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

// Ruta para crear o dar de alta la ficha tecnica de arquitectura ALURE subiendo hasta 4 imagenes
router.post(
  "/",
  jwtCheck,
  jwtParse,
  upload.array("imageFiles", 4),
  validateDespachoRequest,
  createDespacho,
);

export default router;
