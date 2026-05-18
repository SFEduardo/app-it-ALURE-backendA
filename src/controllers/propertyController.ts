import { type Request, type Response } from "express";
import cloudinary from "cloudinary";
import Property from "../models/propertyModel.js";

// Obtener todas las propiedades
export const getAllProperties = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const properties = await Property.find();
    return res.status(200).json(properties);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al obtener propiedades" });
  }
};

// Obtener una propiedad por id
export const getPropertyById = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const property = await Property.findOne({ id: parseInt(id as string) });
    if (!property) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }
    return res.status(200).json(property);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al obtener propiedad" });
  }
};

// Obtener reseñas de una propiedad
export const getPropertyReviews = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const property = await Property.findOne({ id: parseInt(id as string) });
    if (!property) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }
    return res.status(200).json(property.reviews || []);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al obtener reseñas" });
  }
};

// Agregar reseña a una propiedad
export const addReview = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { author, authorId, rating, text } = req.body;
    const property = await Property.findOne({ id: parseInt(id as string) });
    if (!property) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }

    const newReview = {
      id: Date.now(),
      author,
      authorId,
      rating,
      text,
      createdAt: new Date(),
    };

    property.reviews.push(newReview);
    await property.save();
    return res.status(201).json(newReview);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al agregar reseña" });
  }
};

// Actualizar reseña
export const updateReview = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id, reviewId } = req.params;
    const { rating, text } = req.body;
    const property = await Property.findOne({ id: parseInt(id as string) });
    if (!property) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }

    const reviewIndex = property.reviews?.findIndex(
      (review) => review.id === parseInt(reviewId as string),
    );
    if (reviewIndex === undefined || reviewIndex === -1) {
      return res.status(404).json({ error: "Reseña no encontrada" });
    }

    const review = property.reviews[reviewIndex];
    if (!review) {
      return res.status(404).json({ error: "Reseña no encontrada" });
    }
    if (review.authorId && review.authorId !== req.auth0Id) {
      return res
        .status(403)
        .json({ error: "No autorizado para editar esta reseña" });
    }

    review.set({ rating, text });
    await property.save();

    return res.status(200).json(review);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al actualizar reseña" });
  }
};

// Eliminar reseña
export const deleteReview = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id, reviewId } = req.params;
    const property = await Property.findOne({ id: parseInt(id as string) });
    if (!property) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }

    const review = property.reviews?.find(
      (review) => review.id === parseInt(reviewId as string),
    );
    if (!review) {
      return res.status(404).json({ error: "Reseña no encontrada" });
    }

    if (review.authorId && review.authorId !== req.auth0Id) {
      return res
        .status(403)
        .json({ error: "No autorizado para eliminar esta reseña" });
    }

    property.reviews.pull({ id: parseInt(reviewId as string) });
    await property.save();

    return res.status(200).json({ message: "Reseña eliminada" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al eliminar reseña" });
  }
};

// Crear una nueva propiedad
export const createProperty = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const {
      id,
      name,
      description,
      category,
      style,
      color,
      price,
      finishes,
      distribution,
    } = req.body;
    const createdBy = req.auth0Id; // Asumiendo que el middleware jwtParse añade req.auth0Id

    // Verificar si el id ya existe
    const existingProperty = await Property.findOne({ id });
    if (existingProperty) {
      return res.status(400).json({ error: "ID de propiedad ya existe" });
    }

    // Procesar las imágenes subidas
    const images: string[] = [];
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const base64Image = Buffer.from(file.buffer).toString("base64");
          const dataUri = `data:${file.mimetype};base64,${base64Image}`;
          const uploadResponse = await cloudinary.v2.uploader.upload(dataUri);
          return uploadResponse.secure_url || uploadResponse.url || "";
        }),
      );
      images.push(...(uploadedImages.filter(Boolean) as string[]));
    }

    const newProperty = new Property({
      id,
      name,
      description,
      category,
      style,
      color,
      price,
      images,
      finishes: finishes ? JSON.parse(finishes) : [],
      distribution,
      createdBy,
    });

    await newProperty.save();
    return res.status(201).json(newProperty);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al crear propiedad" });
  }
};

// Actualizar una propiedad
export const updateProperty = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const { finishes, distribution } = req.body;

    // Procesar las imágenes subidas
    const updates: any = {
      ...req.body,
      finishes: finishes ? JSON.parse(finishes) : undefined,
      distribution: distribution || undefined,
    };

    // Si hay nuevas imágenes, actualizar
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      const images: string[] = [];
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const base64Image = Buffer.from(file.buffer).toString("base64");
          const dataUri = `data:${file.mimetype};base64,${base64Image}`;
          const uploadResponse = await cloudinary.v2.uploader.upload(dataUri);
          return uploadResponse.secure_url || uploadResponse.url || "";
        }),
      );
      images.push(...(uploadedImages.filter(Boolean) as string[]));
      if (images.length > 0) {
        updates.images = images;
      }
    }

    const property = await Property.findOneAndUpdate(
      { id: parseInt(id as string) },
      updates,
      { new: true },
    );
    if (!property) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }

    return res.status(200).json(property);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al actualizar propiedad" });
  }
};

// Eliminar una propiedad
export const deleteProperty = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;

    const property = await Property.findOneAndDelete({
      id: parseInt(id as string),
    });
    if (!property) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }

    return res.status(200).json({ message: "Propiedad eliminada" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al eliminar propiedad" });
  }
};
