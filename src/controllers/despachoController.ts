import { Request, Response } from "express";
import Despacho from "../models/despachoModelo.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

//Función para crear una arquitectura ALURE
export const createDespacho = async (req: Request, res: Response) => {
  try {
    const existingDespacho = await Despacho.findOne({ user: req.userId });
    if (existingDespacho) {
      res
        .status(500)
        .json({ message: "La arquitectura ALURE para este usuario ya existe" });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;
    const imageUrls: string[] = [];

    if (files && files.length > 0) {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const base64Image = Buffer.from(file.buffer).toString("base64");
          const dataUri = `data:${file.mimetype};base64,${base64Image}`;
          const uploadResponse = await cloudinary.v2.uploader.upload(dataUri);
          return uploadResponse.secure_url || uploadResponse.url;
        }),
      );
      imageUrls.push(...uploaded.filter(Boolean));
    }

    const despacho = new Despacho({
      ...req.body,
      area: Number(req.body.area),
      imageUrls,
      user: new mongoose.Types.ObjectId(req.userId),
      lastUpdated: new Date(),
    });

    await despacho.save();
    res.status(200).json(despacho);
  } catch (error) {
    console.log("Error al crear la arquitectura ALURE", error);
    res.status(500).json({ message: "Error al crear la arquitectura ALURE" });
  }
};
