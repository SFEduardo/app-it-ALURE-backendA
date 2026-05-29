import { type Request, type Response } from "express";
import User from "../models/modeloUsuario.js";

// Controlador de usuarios que administra la creacion, consulta y actualizacion de los
// perfiles de usuario. Se comunica directamente con MongoDB y actua en tandem
// con la autenticacion federada de Auth0 en el frontend.

// 1. Crear un usuario nuevo o devolver uno existente (sincronizacion tras login)
export const createUser = async (req: Request, res: Response): Promise<any> => {
  // Flujo del metodo:
  // 1. Verificar si el usuario ya esta registrado en la base de datos local usando su auth0Id.
  // 2. Si ya existe, retornar sus datos para evitar duplicados.
  // 3. Si no existe, instanciar un nuevo usuario con la informacion provista y guardarlo.
  try {
    console.log(req.body);
    const { auth0Id } = req.body;

    // Buscamos un usuario que coincida con el identificador de Auth0 (auth0Id)
    // Equivalente en SQL: select * from user where auth0Id = 'auth0Id' limit 1
    const existingUser = await User.findOne({ auth0Id });

    if (existingUser) {
      // Si el usuario ya existe en la coleccion, se retorna HTTP 200 y sus datos actuales
      return res.status(200).json(existingUser);
    }

    // Si el usuario no existe, se crea un nuevo documento de Mongoose
    const newUser = new User(req.body);
    
    // Se guarda el usuario en MongoDB
    // Equivalente en SQL: insert into user values (name=req.body.name, email=...)
    await newUser.save();

    // Se retorna HTTP 201 (Creado) con el objeto guardado serializado a formato simple
    return res.status(201).json(newUser.toObject());
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al crear usuario" });
  }
};

// 2. Actualizar la informacion personal del perfil del usuario logueado
export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, address, city, country } = req.body;
    
    // Se busca el usuario por su ID interno (_id) inyectado en la peticion (req.userId)
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Se actualizan los campos editables del perfil en base a lo enviado desde el formulario de react
    user.name = name;
    user.address = address;
    user.city = city;
    user.country = country;

    // Se guardan los cambios en MongoDB
    await user.save();
    
    // Se responde con el objeto usuario actualizado
    res.send(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al actualizar el usuario" });
  }
};

// 3. Obtener el perfil completo del usuario actual autenticado
export const getUser = async (req: Request, res: Response): Promise<any> => {
  try {
    // Se busca en MongoDB al usuario por su ID interno extraido del token JWT verificado
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    // Se responde con la informacion del perfil en formato JSON
    res.json(currentUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al obtener usuario" });
  }
};
