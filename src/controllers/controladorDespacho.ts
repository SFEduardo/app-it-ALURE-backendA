import { Request, Response } from "express";
import Despacho from "../models/despachoModelo.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

// Controlador para la creacion de registros de arquitectura/despacho
// para un usuario en la base de datos de MongoDB.
// Recibe peticiones HTTP, procesa archivos subidos en memoria,
// los almacena en Cloudinary y guarda la referencia en la base de datos.

// Funcion principal para crear una arquitectura ALURE asociada a un usuario
export const createDespacho = async (req: Request, res: Response) => {
  try {
    // 1. Validar duplicados: se busca si este usuario ya tiene un despacho guardado.
    // Se usa el ID del usuario extraido previamente por el middleware de autenticacion (req.userId).
    const existingDespacho = await Despacho.findOne({ user: req.userId });
    if (existingDespacho) {
      // Si ya existe, se responde con codigo de estado 500 y un mensaje descriptivo.
      res
        .status(500)
        .json({ message: "La arquitectura ALURE para este usuario ya existe" });
      return; // Importante detener la ejecucion de la funcion aqui.
    }

    // 2. Procesamiento de archivos: se obtienen los archivos cargados por Multer en req.files
    const files = req.files as Express.Multer.File[] | undefined;
    const imageUrls: string[] = [];

    // Si el cliente subio uno o mas archivos, se envian a Cloudinary uno por uno en paralelo
    if (files && files.length > 0) {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          // Se convierte el buffer del archivo en memoria a una cadena base64 legible por Cloudinary
          const base64Image = Buffer.from(file.buffer).toString("base64");
          // Se crea el Data URI con el tipo de archivo correcto (mimetype)
          const dataUri = `data:${file.mimetype};base64,${base64Image}`;
          // Se sube la imagen a Cloudinary de forma asincrona
          const uploadResponse = await cloudinary.v2.uploader.upload(dataUri);
          // Se retorna la URL segura que devuelve Cloudinary
          return uploadResponse.secure_url || uploadResponse.url;
        }),
      );
      // Se agregan las URLs validas al arreglo final, filtrando elementos nulos o vacios
      imageUrls.push(...uploaded.filter(Boolean));
    }

    // 3. Creacion e inicializacion del modelo Despacho
    // Se fusionan los datos textuales enviados en req.body con los datos procesados en el backend
    const despacho = new Despacho({
      ...req.body,
      area: Number(req.body.area), // Se castea explicitamente el campo area a Numero
      imageUrls, // Se asigna la lista de URLs de las imagenes subidas a Cloudinary
      user: new mongoose.Types.ObjectId(req.userId), // Se crea un ObjectId valido a partir del ID de usuario
      lastUpdated: new Date(), // Se setea la marca de tiempo de la ultima actualizacion
    });

    // 4. Persistencia en la base de datos MongoDB
    await despacho.save();
    
    // Se responde con exito (HTTP 200) enviando el objeto despacho guardado en formato JSON
    res.status(200).json(despacho);
  } catch (error) {
    // Si ocurre un error inesperado, se registra en consola y se responde con HTTP 500
    console.log("Error al crear la arquitectura ALURE", error);
    res.status(500).json({ message: "Error al crear la arquitectura ALURE" });
  }
};
