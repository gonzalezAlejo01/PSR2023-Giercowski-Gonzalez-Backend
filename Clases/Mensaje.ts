export class Mensaje{
    contenido: String
    mailUsuario: String
    fecha: String

    constructor(contenido: String, mailUsuario: String, fecha: Date){
        this.contenido = contenido
        this.mailUsuario = mailUsuario
        this.fecha = fecha.toString()
    }
}