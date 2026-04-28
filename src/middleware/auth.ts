import { auth } from "express-oauth2-jwt-bearer";
import { type Request, type Response, type NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

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

  //Los headers comenzaran con una cadena
  //Bearer token, por ejemplo
  //Bearer 1234xesldfsksjs
  //Por lo tanto es necesario verificar que la autorización comience
  //con la cadena Bearer
  if (!authorization || !authorization.startsWith("Bearer")) {
    console.log("jwtParse - Authorization denegada");
    return res.sendStatus(401).json({ message: "Autorización denegada" });
  } // Fin de if(!authorization)

  //Obtenemos el token del header
  //Bearer 1234xesldfsksjs
  // [0   1]
  //split = ["Bearer", "1234xesldfsksjs"]
  //split divide por el caracter espacio " " la cadena
  const token = authorization.split(" ")[1] || "";

  try {
    console.log("jwtParse - Analizando Token");
    //Analizamos el token para validar que sea correcto
    //Decoded decodifica el token dividiendolo en partes
    const decoded = jwt.decode(token) as jwt.JwtPayload;

    //El elemento sub del token contiene el Id del usuario
    //que inició sesión en la Api Auth0
    const auth0Id = decoded.sub || "";

    //Comprobamos que exista el usuario en la base de datos
    const user = await User.findOne({ auth0Id });

    if (!user) {
      console.log("jwtParse - !user encontrado - Autorización denegada");
      return res.status(401).json({ message: "Autorización denegada" });
    }

    //Almacenamos el auth0Id y el userId en el objeto Request
    //para que esté disponible en todo el backend
    req.auth0Id = auth0Id as string;
    req.userId = user._id.toString();
    console.log("JwtParse - Autorización concedida");
    next();
  } catch (error) {
    console.log(error);
    console.log("JwtParse - catch Autorización denegada");
    return res.status(401).json({ message: "Autorización denegada" });
  } //Fin del catch
}; // Fin de jwtParse
