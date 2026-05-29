import { auth } from "express-oauth2-jwt-bearer";
import { type Request, type Response, type NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/modeloUsuario.js";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      userId: string;
      auth0Id: string;
    }
  }
}

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE || "",
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || "",
  tokenSigningAlg: "RS256",
});

export const jwtParse = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const { authorization } = req.headers;

  // Las cabeceras del token siempre empiezan con la palabra Bearer seguida del token real
  // Por ejemplo: Bearer 1234xesldfsksjs
  // Checamos que la autorizacion venga en ese formato para estar seguros
  if (!authorization || !authorization.startsWith("Bearer")) {
    console.log("jwtParse - Authorization denegada");
    return res.sendStatus(401).json({ message: "Autorización denegada" });
  }

  // Extraemos el token puro quitando la palabra Bearer
  // Separamos el string por espacios para quedarnos solo con la parte del token
  const token = authorization.split(" ")[1] || "";

  try {
    console.log("jwtParse - Analizando Token");
    // Decodificamos el token de seguridad para poder ver que trae adentro
    const decoded = jwt.decode(token) as jwt.JwtPayload;

    // La propiedad sub del token contiene el ID unico del usuario registrado en Auth0
    const auth0Id = decoded.sub || "";

    // Buscamos al usuario en nuestra base de datos de MongoDB Atlas usando ese ID
    const user = await User.findOne({ auth0Id });

    if (!user) {
      console.log("jwtParse - !user encontrado - Autorización denegada");
      return res.status(401).json({ message: "Autorización denegada" });
    }

    // Guardamos el ID de auth0 y el ID interno de la base de datos en la peticion
    // de esta manera cualquier controlador posterior los puede usar directamente
    req.auth0Id = auth0Id as string;
    req.userId = user._id.toString();
    console.log("JwtParse - Autorización concedida");
    next();
  } catch (error) {
    console.log(error);
    console.log("JwtParse - catch Autorización denegada");
    return res.status(401).json({ message: "Autorización denegada" });
  }
}; // Fin de jwtParse
