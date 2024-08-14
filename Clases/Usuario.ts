import { Publicacion } from "./Publicacion"
export class Usuario{

    correo: string
    nombre: String
    contraseña: string
    publicaciones: Array<Publicacion>
    foto: String
    direccion: String
    telefono: String

    constructor(correo: string, nombre: String, constraseña: string, direccion: String, foto: String, telefono: String){
        this.correo = correo
        this.nombre = nombre
        this.contraseña = constraseña
        this.publicaciones = []
        this.foto = foto
        this.direccion = direccion
        this.telefono = telefono
    }
}