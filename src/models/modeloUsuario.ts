import mongoose from "mongoose";

// Esquema de la base de datos para guardar la informacion de los usuarios en MongoDB
const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true, // El identificador unico que le da Auth0 al usuario
  },
  email: {
    type: String,
    required: true, // Correo electronico para contactar al usuario
  },
  name: {
    type: String, // Nombre completo del usuario
  },
  address: {
    type: String, // Direccion fisica de residencia
  },
  city: {
    type: String, // Ciudad donde vive
  },
  country: {
    type: String, // Pais de residencia
  },
});

// Exportamos el modelo para poder usarlo en los controladores y buscar usuarios
export default mongoose.model("User", userSchema);
