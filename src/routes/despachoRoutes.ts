import express from "express";
import multer from "multer";
import { createDespacho } from "../controllers/despachoController.js";
import { jwtCheck, jwtParse } from "../middleware/auth.js";
import { validateDespachoRequest } from "../middleware/validation.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

//Ruta para crear una arquitectura ALURE
router.post(
  "/",
  jwtCheck,
  jwtParse,
  upload.array("imageFiles", 4),
  validateDespachoRequest,
  createDespacho,
);

export default router;
