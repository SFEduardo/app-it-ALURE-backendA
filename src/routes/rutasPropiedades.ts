import express from "express";
import multer from "multer";
import {
  getAllProperties,
  getPropertyById,
  getPropertyReviews,
  createProperty,
  updateProperty,
  deleteProperty,
  addReview,
  updateReview,
  deleteReview,
} from "../controllers/controladorPropiedades.js";
import { jwtParse } from "../middleware/autenticacion.js";

const router = express.Router();

// Usar multer en memoria para que la subida a Cloudinary se realice manualmente
const upload = multer({ storage: multer.memoryStorage() });

// Traer toda la lista de propiedades de la base de datos sin pedir login
router.get("/", getAllProperties);

// Traer una sola propiedad usando su id sin pedir login
router.get("/:id", getPropertyById);

// Traer todos los comentarios y opiniones de una propiedad usando su id sin pedir login
router.get("/:id/reviews", getPropertyReviews);

// De aqui para abajo todas las rutas van a pedir que el usuario este autenticado con token
router.use(jwtParse);

// Guardar una propiedad nueva subiendo hasta 4 fotos
router.post("/", upload.array("images", 4), createProperty);

// Modificar los datos de una propiedad ya existente subiendo fotos nuevas
router.put("/:id", upload.array("images", 4), updateProperty);

// Borrar una propiedad de la base de datos usando su id
router.delete("/:id", deleteProperty);

// Escribir un comentario u opinion nueva en una propiedad
router.post("/:id/reviews", addReview);

// Editar un comentario u opinion que ya habia escrito el usuario antes usando su id
router.put("/:id/reviews/:reviewId", updateReview);

// Borrar un comentario u opinion que el usuario habia escrito usando su id
router.delete("/:id/reviews/:reviewId", deleteReview);

export default router;
