import { type Request, type Response } from "express";
import cloudinary from "cloudinary";
import Property from "../models/modeloPropiedades.js";

// Controlador de propiedades que centraliza toda la logica CRUD para las propiedades
// y la gestion interactiva de sus resenas/comentarios de usuarios.
// Maneja la implementacion de consultas, la integracion con Cloudinary
// y el control de accesos de Auth0.

// 1. Obtener todas las propiedades
export const getAllProperties = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // Se consultan todos los documentos de la coleccion Property en MongoDB
    const properties = await Property.find();
    // Se retorna la coleccion con codigo de exito HTTP 200
    return res.status(200).json(properties);
  } catch (error) {
    // Si la consulta falla (ejemplo: problemas de conexion de BD), se responde con HTTP 500
    console.log(error);
    return res.status(500).json({ error: "Error al obtener propiedades" });
  }
};

// 2. Obtener una sola propiedad por su identificador numerico 'id'
export const getPropertyById = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    // Se busca un documento en MongoDB que coincida con el campo numerico 'id'
    const property = await Property.findOne({ id: parseInt(id as string) });
    // Si no se encuentra ningun registro, se retorna HTTP 404
    if (!property) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }
    // Se retorna el objeto de la propiedad encontrada
    return res.status(200).json(property);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al obtener propiedad" });
  }
};

// 3. Obtener todas las resenas asociadas a una propiedad especifica
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
    // Si la propiedad existe, se retorna su sub-arreglo de reviews
    return res.status(200).json(property.reviews || []);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al obtener reseñas" });
  }
};

// 4. Agregar una nueva resena a una propiedad (requiere estar autenticado)
export const addReview = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { author, authorId, rating, text } = req.body;
    
    // Se busca la propiedad a la cual se desea agregar el comentario
    const property = await Property.findOne({ id: parseInt(id as string) });
    if (!property) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }

    // Se estructura el nuevo sub-documento de la resena
    const newReview = {
      id: Date.now(), // Se usa la estampa de tiempo actual como identificador numerico unico
      author,
      authorId,
      rating,
      text,
      createdAt: new Date(),
    };

    // Se agrega la resena al arreglo y se persiste el documento padre en MongoDB
    property.reviews.push(newReview);
    await property.save();

    // Se retorna codigo HTTP 201 (Creado) con la resena insertada
    return res.status(201).json(newReview);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al agregar reseña" });
  }
};

// 5. Actualizar una resena existente (el usuario solo puede editar su propia resena)
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

    // Se busca el indice de la resena en el sub-arreglo
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

    // Autenticacion y seguridad: se valida si el autorId de la resena coincide con req.auth0Id
    if (review.authorId && review.authorId !== req.auth0Id) {
      return res
        .status(403)
        .json({ error: "No autorizado para editar esta reseña" });
    }

    // Se actualizan los campos editables mediante el metodo .set() de Mongoose
    review.set({ rating, text });
    // Se guarda la propiedad completa
    await property.save();

    return res.status(200).json(review);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al actualizar reseña" });
  }
};

// 6. Eliminar una resena existente (seguridad y borrado de sub-documentos)
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

    // Se valida que el usuario logueado sea el verdadero autor antes de permitir el borrado
    if (review.authorId && review.authorId !== req.auth0Id) {
      return res
        .status(403)
        .json({ error: "No autorizado para eliminar esta reseña" });
    }

    // Se elimina el sub-documento usando el metodo pull() de Mongoose
    property.reviews.pull({ id: parseInt(reviewId as string) });
    await property.save();

    return res.status(200).json({ message: "Reseña eliminada" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al eliminar reseña" });
  }
};

// 7. Crear una nueva propiedad (Administrador)
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
    const createdBy = req.auth0Id; // Se guarda la referencia de quien creo el registro

    // Se comprueba si el identificador numerico ya esta ocupado
    const existingProperty = await Property.findOne({ id });
    if (existingProperty) {
      return res.status(400).json({ error: "ID de propiedad ya existe" });
    }

    // Se inicializa un arreglo de 4 posiciones para mapear las imagenes en sus slots
    let finalImages: string[] = ["", "", "", ""];

    // Si existen imagenes previas, se cargan primero
    if (req.body.existingImageUrls) {
      try {
        const parsed = JSON.parse(req.body.existingImageUrls);
        if (Array.isArray(parsed)) {
          finalImages = [...parsed, "", "", "", ""].slice(0, 4);
        }
      } catch (e) {
        console.log("Error al parsear existingImageUrls:", e);
      }
    }

    // Se parsea la configuracion de los slots de imagenes recibidos en la peticion
    let slots: number[] = [];
    if (req.body.imageSlots) {
      if (typeof req.body.imageSlots === "string") {
        slots = req.body.imageSlots.split(",").map((s: string) => parseInt(s.trim())).filter((s: number) => !isNaN(s));
      }
    }

    // Se procesan y suben los archivos binarios temporales recibidos via Multer
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const base64Image = Buffer.from(file.buffer).toString("base64");
          const dataUri = `data:${file.mimetype};base64,${base64Image}`;
          const uploadResponse = await cloudinary.v2.uploader.upload(dataUri);
          return uploadResponse.secure_url || uploadResponse.url || "";
        }),
      );

      // Se ubica cada imagen subida en el slot indicado por el cliente
      uploadedUrls.forEach((url, i) => {
        const slotIndex = slots[i];
        if (slotIndex !== undefined && slotIndex >= 0 && slotIndex < 4) {
          finalImages[slotIndex] = url;
        } else {
          // Si no tiene slot asignado, se busca la primera posicion libre
          const firstEmpty = finalImages.indexOf("");
          if (firstEmpty !== -1) {
            finalImages[firstEmpty] = url;
          } else {
            finalImages.push(url);
          }
        }
      });
    }

    // Se filtran las posiciones vacias para quedarse solo con las URLs reales
    const images = finalImages.filter((img) => img && img.trim() !== "");

    // Se instancia el modelo con los parametros deserializados
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

// 8. Actualizar ficha tecnica de propiedad existente (Administrador)
export const updateProperty = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const { finishes, distribution } = req.body;

    // Se inicializa el mapeo de 4 imagenes para preservar el orden y posiciones de los slots
    let finalImages: string[] = ["", "", "", ""];

    if (req.body.existingImageUrls) {
      try {
        const parsed = JSON.parse(req.body.existingImageUrls);
        if (Array.isArray(parsed)) {
          finalImages = [...parsed, "", "", "", ""].slice(0, 4);
        }
      } catch (e) {
        console.log("Error al parsear existingImageUrls:", e);
      }
    }

    let slots: number[] = [];
    if (req.body.imageSlots) {
      if (typeof req.body.imageSlots === "string") {
        slots = req.body.imageSlots.split(",").map((s: string) => parseInt(s.trim())).filter((s: number) => !isNaN(s));
      }
    }

    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const base64Image = Buffer.from(file.buffer).toString("base64");
          const dataUri = `data:${file.mimetype};base64,${base64Image}`;
          const uploadResponse = await cloudinary.v2.uploader.upload(dataUri);
          return uploadResponse.secure_url || uploadResponse.url || "";
        }),
      );

      uploadedUrls.forEach((url, i) => {
        const slotIndex = slots[i];
        if (slotIndex !== undefined && slotIndex >= 0 && slotIndex < 4) {
          finalImages[slotIndex] = url;
        } else {
          const firstEmpty = finalImages.indexOf("");
          if (firstEmpty !== -1) {
            finalImages[firstEmpty] = url;
          } else {
            finalImages.push(url);
          }
        }
      });
    }

    const images = finalImages.filter((img) => img && img.trim() !== "");

    // Se preparan los campos a actualizar
    const updates: any = {
      ...req.body,
      images,
      finishes: finishes ? JSON.parse(finishes) : undefined,
      distribution: distribution || undefined,
    };

    // Se remueven metadatos que no forman parte de las columnas del esquema en MongoDB
    delete updates.imageSlots;
    delete updates.existingImageUrls;

    // Se busca y actualiza el documento, pidiendo que nos retorne la version nueva (new: true)
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

// 9. Eliminar propiedad (Administrador)
export const deleteProperty = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;

    // Se busca y remueve en un solo paso
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
