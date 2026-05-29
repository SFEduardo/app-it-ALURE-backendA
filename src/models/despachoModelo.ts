import mongoose from "mongoose";

// Esquema de Mongoose que define la estructura y reglas de validacion para la coleccion
// "Alure" en la base de datos de MongoDB, mapeando las propiedades a documentos BSON.

const alureSchema = new mongoose.Schema({
  // Relacion de clave foranea: Vincula este registro con un usuario unico de la coleccion 'User'
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // Titulo descriptivo de la propuesta de arquitectura o diseno
  title: {
    type: String,
    required: true, // Campo obligatorio
  },
  // Estilo estetico (ej. Minimalista, Industrial, Vanguardista)
  style: {
    type: String,
    required: true,
  },
  // Area total construida expresada en metros cuadrados (m²)
  area: {
    type: Number,
    required: true,
  },
  // Etiqueta del render o plano principal
  imageLabel: {
    type: String,
    required: true,
  },
  // Tipo de espacio (ej. Residencial, Comercial, Oficina)
  type: {
    type: String,
    required: false, // Campo opcional
  },
  // Paleta de colores seleccionada para el diseno
  colors: {
    type: String,
    required: false,
  },
  // Tipo de acabados sugeridos (ej. Madera, Marmol, Hormigon pulido)
  finishes: {
    type: String,
    required: false,
  },
  // Distribucion de los ambientes interiores
  distribution: {
    type: String,
    required: false,
  },
  // Coleccion de URLs de imagenes subidas y hospedadas de forma remota en Cloudinary
  imageUrls: {
    type: [String],
    default: [], // Por defecto se inicializa como un arreglo vacio
  },
  // Sello de fecha de la ultima modificacion realizada
  lastUpdated: {
    type: Date,
    default: Date.now, // Por defecto captura la fecha y hora de la creacion
  },
});

// Se exporta el modelo compilado de Mongoose listo para realizar consultas
export default mongoose.model("Alure", alureSchema);
