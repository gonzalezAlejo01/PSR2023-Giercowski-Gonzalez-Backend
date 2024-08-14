import { Collection, Db } from "mongodb";
import { Comentario } from "../Clases/Comentario";

export class AccesoChat {
    url: String;
    database: Db;
    collection: Collection;

    constructor(url: String, database: Db, collection: Collection) {
        this.url = url;
        this.database = database;
        this.collection = collection;
    }

    public async getIdMasAlto() {
        if (await this.database.listCollections({ name: "Chats" }).hasNext()) {
            const chat = await this.collection.find().sort({ id: -1 }).limit(1).toArray()
            if (!chat[0]?.id) {
                return 0
            }
            else {
                return chat[0]?.id;
            }
        }
        return 0;
    }

    public async getChat(id: Number) {
        const filtro = { id: Number(id) };
        const chat = await this.collection.findOne(filtro);
        return chat;
    }

    public async subirChat(chat: any) {
        this.collection.insertOne(chat);
        return chat
    }

    public async deleteChat(id: Number) {
        await this.collection.deleteOne({ id: id })
    }

    public async getChats(mail: String) {
        const chats = await this.collection.find({ $or: [{ mailUsuario1: mail }, { mailUsuario2: mail }] }).sort({ id: -1 }).toArray()
        return chats
    }

    public async getChatConUsuario(mail: String, mail2: String) {
        const chat = await this.collection.findOne({ $or: [{ mailUsuario1: mail, mailUsuario2: mail2 }, { mailUsuario1: mail2, mailUsuario2: mail }] })
        return chat
    }

    public async getChatConUsuarioPorId(id: Number, mail: String, mail2: String) {
        const chat = await this.collection.findOne({ id: id, $or: [{ mailUsuario1: mail, mailUsuario2: mail2 }, { mailUsuario1: mail2, mailUsuario2: mail }] })
        return chat
    }

    public async getMensajes(idChat: Number) {
        const chat = await this.collection.findOne({ id: Number(idChat) })
        return chat?.mensajes
    }

    public async subirMensaje(idChat: Number, mensaje: any) {
        await this.collection.findOne({ id: idChat }).then((u) => {
            u!.mensajes.push(mensaje)
            this.collection.findOneAndReplace({ id: idChat }, u!)})
    }
    
}
