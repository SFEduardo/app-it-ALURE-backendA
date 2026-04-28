import { type Request, type Response } from "express";
import User from "../models/userModel.js";
//funciones para crear usuario(LOGICA)
export const createUser = async (req: Request, res: Response): Promise<any> => {
  //1. verificar si el usuario ya existe
  //2. crear usuario si no existe
  //3. regresar los datos del usuario al cliente (frontend) - response
  try {
    console.log(req.body);
    const { auth0Id } = req.body;
    //find <--- select * from user where auth0Id=auth0Id limit 1
    const existingUser = await User.findOne({ auth0Id });

    if (existingUser)
      //El usuario ya existe em la bd
      res.status(200).json(existingUser);

    //En caso de que no exista en la base de datos existingUser==null
    const newUser = new User(req.body);
    //save z-- inser into user values (name=req.body.name,email=...)
    await newUser.save();

    return res.status(201).json(newUser.toObject());
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al crear usuario" });
  }
}; //fin de create user

export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, address, city, country } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    } //fin if
    user!.name = name;
    user!.address = address;
    user!.city = city;
    user!.country = country;

    //Guardamos usuario en la base de datos
    await user!.save();
    res.send(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al actualizar el usuario" });
  }
}; //Fin del update de usuario

//funciones para obtener usuario(LOGICA)
export const getUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser)
      return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(currentUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al obtener usuario" });
  }
}; //Fin de getUser
