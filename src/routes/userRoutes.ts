import express from "express";
import {
  createUser,
  updateUser,
  getUser,
} from "../controllers/userController.js";
import { jwtCheck, jwtParse } from "../middleware/auth.js";
import { validateUserRequest } from "../middleware/validation.js";

const router = express.Router();

//Ruta para crear Usuario
router.post("/", jwtCheck, createUser);

//Ruta para actualizar Usuario
router.put("/", jwtCheck, jwtParse, validateUserRequest, updateUser);

//Ruta para obtener un usuario específico
router.get("/", jwtCheck, jwtParse, getUser);

export default router;
