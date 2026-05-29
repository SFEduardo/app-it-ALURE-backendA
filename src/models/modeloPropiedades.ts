import mongoose from "mongoose";

// Esquema de base de datos para guardar los proyectos y sus fichas tecnicas en MongoDB
const propertySchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true, // Identificador unico numerico del proyecto
    },
    name: {
      type: String,
      required: true, // Nombre o titulo del proyecto arquitectonico
    },
    description: {
      type: String,
      required: true, // Explicacion o descripcion detallada de la obra
    },
    category: {
      type: String,
      required: true, // Tipo de propiedad (ej: Departamento, Oficina, etc)
    },
    style: {
      type: String,
      required: true, // Estilo de diseño de interiores aplicado
    },
    color: {
      type: String,
      required: true, // Colores o paleta cromatica seleccionada
    },
    price: {
      type: Number,
      required: true, // Metros cuadrados de area de la propiedad (guardado como price)
    },
    images: [
      {
        type: String, // Enlaces de las fotos del proyecto subidas a Cloudinary
      },
    ],
    finishes: [
      {
        type: String, // Lista de acabados y materiales utilizados
      },
    ],
    distribution: {
      type: String, // Descripcion de como estan distribuidos los cuartos y zonas
    },
    reviews: [
      {
        id: {
          type: Number,
          required: true, // ID numerico para identificar este comentario
        },
        author: {
          type: String,
          required: true, // Nombre de la persona que comento
        },
        authorId: {
          type: String, // ID unico de Auth0 de quien comento
        },
        rating: {
          type: Number,
          required: true, // Calificacion del 1 al 5
        },
        text: {
          type: String,
          required: true, // Contenido escrito de la opinion
        },
        createdAt: {
          type: Date,
          default: Date.now, // Fecha de publicacion
        },
      },
    ],
    createdBy: {
      type: String, // ID de Auth0 del usuario creador para control de permisos
      required: true,
    },
  },
  {
    timestamps: true, // Guarda automaticamente la fecha de creacion y modificacion
  },
);

// Exportamos el modelo para usarlo en las operaciones de consulta y edicion
export default mongoose.model("Property", propertySchema);
