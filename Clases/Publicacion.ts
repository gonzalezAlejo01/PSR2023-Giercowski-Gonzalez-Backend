import { Tipo } from "./Tipo"
import { Comentario } from "./Comentario"

export class Publicacion{
    id: Number
    fotos: Array<string>
    precio: Number
    tipo: Tipo
    descripcion: String
    titulo: String
    mailUsuario: String
    ubicacion: String
    comentarios: Array<Comentario>

    constructor(tipo: Tipo,id: Number, fotos: Array<string>, precio: Number, descripcion: String, titulo: String, mailUsuario: String, ubicacion: String){
        this.tipo = tipo
        this.id = id
        this.fotos = fotos
        this.precio = precio
        this.descripcion = descripcion
        this.titulo = titulo
        this.mailUsuario = mailUsuario
        this.ubicacion = ubicacion
        this.comentarios = []
    }
}