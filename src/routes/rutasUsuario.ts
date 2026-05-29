import express from "express";
import {
  createUser,
  updateUser,
  getUser,
} from "../controllers/controladorUsuario.js";
import { jwtCheck, jwtParse } from "../middleware/autenticacion.js";
import { validateUserRequest } from "../middleware/validacion.js";

const router = express.Router();

// Guardar un usuario nuevo en la base de datos cuando inicia sesion por primera vez
router.post("/", jwtCheck, createUser);

// Modificar los datos del perfil del usuario validando que la informacion sea correcta
router.put("/", jwtCheck, jwtParse, validateUserRequest, updateUser);

// Pedir los datos de un usuario especifico para cargarlos en la pantalla
router.get("/", jwtCheck, jwtParse, getUser);

export default router;
