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
} from "../controllers/propertyController.js";
import { jwtParse } from "../middleware/auth.js";

const router = express.Router();

// Usar multer en memoria para que la subida a Cloudinary se realice manualmente
const upload = multer({ storage: multer.memoryStorage() });

// Obtener todas las propiedades (sin autenticación)
router.get("/", getAllProperties);

// Obtener una propiedad por id (sin autenticación)
router.get("/:id", getPropertyById);

// Obtener reseñas de una propiedad (sin autenticación)
router.get("/:id/reviews", getPropertyReviews);

// Todas las demás rutas requieren autenticación
router.use(jwtParse);

// Crear una nueva propiedad con imágenes
router.post("/", upload.array("images", 4), createProperty);

// Actualizar una propiedad
router.put("/:id", upload.array("images", 4), updateProperty);

// Eliminar una propiedad
router.delete("/:id", deleteProperty);

// Agregar una reseña
router.post("/:id/reviews", addReview);

// Actualizar una reseña
router.put("/:id/reviews/:reviewId", updateReview);

// Eliminar una reseña
router.delete("/:id/reviews/:reviewId", deleteReview);

export default router;
