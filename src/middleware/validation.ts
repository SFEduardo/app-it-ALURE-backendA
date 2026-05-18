import { body, validationResult } from "express-validator";
import { type Request, type Response, type NextFunction } from "express";

const handValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //Si hay errores regresa un 400 y el mensaje de error
    return res.status(400).json({ errors: errors.array() });
  }
  //Si no hay errores, se ejecuta la funcion next
  next();
}; //Fin del heandValidationErrors

export const validateUserRequest = [
  body("name")
    .isString()
    .notEmpty()
    .withMessage("El nombre debe ser un string"),

  body("address")
    .isString()
    .notEmpty()
    .withMessage("La direccion debe ser un string"),

  body("city")
    .isString()
    .notEmpty()
    .withMessage("La ciudad debe ser un string"),

  body("country")
    .isString()
    .notEmpty()
    .withMessage("El país debe ser un string"),
  handValidationErrors,
]; //Fin de validateUserRequest

export const validateDespachoRequest = [
  body("title")
    .notEmpty()
    .withMessage("El título de la ficha técnica es requerido"),

  body("style").notEmpty().withMessage("El estilo es requerido"),

  body("area")
    .isFloat({ min: 0 })
    .withMessage("El área debe ser un número positivo"),

  body("imageLabel")
    .notEmpty()
    .withMessage("La etiqueta de la imagen principal es requerida"),

  body("type").notEmpty().withMessage("El tipo de propiedad es requerido"),

  body("colors").notEmpty().withMessage("Los colores son requeridos"),

  body("finishes").notEmpty().withMessage("Los acabados son requeridos"),

  body("distribution").notEmpty().withMessage("La distribución es requerida"),

  handValidationErrors,
]; //Fin de validateDespachoRequest
