import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

//Instanciamos dotenv para cargar las variables de entorno desde el archivo .env
dotenv.config();

//importamos el archvo de rutas para usuarios
import userRoutes from "./routes/userRoutes.js"; //<--- rutas de usuarios
import morgan from "morgan";

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

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/health", async (req: Request, res: Response) => {
  res.send("Hola mundo desde Express y TypeScript!!!");
});

//Request <--- Es un objeto para recibir datods del front
//Response <--- Es un objeto para enviar datos al front

app.use("/api/user", userRoutes);

app.get("/", async (req: Request, res: Response) => {
  res.redirect("/health");
});

const port = process.env.port || 3000;
app.listen(port, () => {
  console.log("App corriendo en el puerto " + port);
});
