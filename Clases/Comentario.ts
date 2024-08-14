export class Comentario{
    id: Number
    mailUsuario: String
    contenido: String
    fecha: String
    idPublicacion: Number
    respondido: Boolean
    respuesta: String

    constructor(id: any, mailUsuario: String, contenido: String, idPublicacion: Number, fecha: Date){
        this.id = id
        this.mailUsuario = mailUsuario
        this.contenido = contenido
        this.fecha = fecha.toString() 
        this.respondido = false
        this.respuesta = ""
        this.idPublicacion = idPublicacion
    }
}