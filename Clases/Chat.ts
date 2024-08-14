import { Mensaje } from "./Mensaje"

export class Chat{
    id: Number
    mailUsuario1: String
    mailUsuario2: String
    mensajes: Array<Mensaje>

    constructor(id: Number, mailUsuario1: String, mailUsuario2: String){
        this.id = id
        this.mailUsuario1 = mailUsuario1
        this.mailUsuario2 = mailUsuario2
        this.mensajes = []
    }
}