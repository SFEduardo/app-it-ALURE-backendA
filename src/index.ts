process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

// Cargamos las variables de entorno desde el archivo .env para usarlas en todo el servidor
dotenv.config();

// Importamos las rutas de usuarios para el login y el perfil
import userRoutes from "./routes/rutasUsuario.js";
import morgan from "morgan";

// Importamos las rutas para el despacho de arquitectura ALURE
import despachoRoutes from "./routes/rutasDespacho.js";

// Importamos las rutas para manejar el catalogo de propiedades
import propertyRoutes from "./routes/rutasPropiedades.js";

// Nos conectamos a la base de datos de MongoDB Atlas
const dbUri = process.env.DB_CONNECTION_STRING as string;
console.log("Intentando conectar a la base de datos...");

mongoose
  .connect(dbUri, {
    tlsAllowInvalidCertificates: true // Soluciona el error de certificado SSL en Mac
  })
  .then(() => {
    console.log("Base de datos conectada correctamente");
  })
  .catch((error) => {
    console.log("Error al conectar a la base de datos");
    console.log(error);
  });

// Configuramos el cliente de Cloudinary con nuestras credenciales de la nube para subir fotos
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
const apiKey = process.env.CLOUDINARY_API_KEY || "";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Inicializamos la aplicacion de Express
const app = express();
app.use(express.json()); // Permite al servidor entender JSON en el cuerpo de las peticiones
app.use(cors()); // Permite peticiones cruzadas desde el frontend
app.use(morgan("dev")); // Muestra las peticiones HTTP en consola en tiempo real

// Ruta rapida para ver si el servidor esta vivo y respondiendo chido
app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "servidor OK!" });
});

// Redirigimos la raiz del servidor al health check
app.get("/", async (req: Request, res: Response) => {
  res.redirect("/health");
});

// Registramos las rutas de la API asociandolas a sus prefijos correspondientes
app.use("/api/user", userRoutes);
app.use("/api/despacho", despachoRoutes);
app.use("/api/properties", propertyRoutes);

// Arrancamos el servidor en el puerto 3000 o el configurado por el sistema
const port = process.env.port || 3000;
app.listen(port, () => {
  console.log("App corriendo en el puerto " + port);
});
