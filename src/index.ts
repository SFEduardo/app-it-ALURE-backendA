import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

//Instanciamos dotenv para cargar las variables de entorno desde el archivo .env
dotenv.config();

//importamos el archvo de rutas para usuarios
import userRoutes from "./routes/userRoutes.js"; //<--- rutas de usuarios
import morgan from "morgan";

//importamos el archivo de rutas para ALURE
import despachoRoutes from "./routes/despachoRoutes.js"; //<--- rutas de ALURE

//importamos el archivo de rutas para propiedades
import propertyRoutes from "./routes/propertyRoutes.js"; //<--- rutas de propiedades

//Nos conectamos a la base de datos
mongoose
  .connect(process.env.DB_CONNECTION_STRING as string)
  .then(() => {
    console.log("Base de datos conectada correctamente");
    console.log(process.env.DB_CONNECTION_STRING);
  })
  .catch((error) => {
    console.log("Error al conectar a la base de datos");
    console.log(error);
  });

//Configuramos Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
const apiKey = process.env.CLOUDINARY_API_KEY || "";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "¡servidor OK!" });
});

//Request <--- Es un objeto para recibir datods del front
//Response <--- Es un objeto para enviar datos al front

app.get("/", async (req: Request, res: Response) => {
  res.redirect("/health");
});

app.use("/api/user", userRoutes);
app.use("/api/despacho", despachoRoutes);
app.use("/api/properties", propertyRoutes);

const port = process.env.port || 3000;
app.listen(port, () => {
  console.log("App corriendo en el puerto " + port);
});
